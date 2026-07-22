import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';

const require = createRequire(import.meta.url);
const sharedIcons = require('../shared/semantic-icons.cjs');
const Visual = z.enum(sharedIcons.ICON_NAMES);
const CONCRETE_ICON_HINTS = [
  'microphone', 'waveform', 'asr', 'tts', 'headphones', 'speaker', 'subtitle',
  'phone', 'edge-device', 'chip', 'gpu', 'server', 'router', 'sensor',
  'camera', 'cloud', 'network', 'database', 'dataset', 'embedding', 'model',
  'shield', 'lock', 'gate', 'filter', 'target', 'sliders', 'latency',
  'translate', 'globe', 'document', 'search', 'check', 'alert', 'gear',
  'link', 'layers', 'merge', 'room', 'bot', 'ear', 'video', 'branch'
].filter((name) => sharedIcons.ICON_NAMES.includes(name)).join(', ');
const Shape = z.enum(['illustration', 'card', 'pill']);
const Layout = z.enum(['linear-flow', 'staged-flow', 'branching', 'before-after', 'cycle', 'hub-spoke', 'cause-effect', 'timeline', 'semantic-map']);
const Plan = z.object({
  title: z.string().min(1),
  language: z.string().min(1),
  thesis: z.string().min(1),
  audience: z.string().min(1),
  glossary: z.array(z.object({ term: z.string(), definition: z.string() })).max(20),
  visual_style: z.object({
    palette: z.string(),
    character: z.string(),
    recurring_metaphor: z.string()
  }),
  sections: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    heading: z.string().min(1),
    purpose: z.string().min(1),
    key_points: z.array(z.string().min(1)).min(1).max(9)
  })).min(1).max(12)
});

const Storyboard = z.object({
  version: z.literal(2),
  style: z.literal('pastel-handdrawn'),
  title: z.string().min(1),
  visualDirection: z.object({
    character: z.string().min(1).max(60),
    recurringMetaphor: z.string().min(1).max(90)
  }),
  pages: z.array(z.object({
    title: z.string().min(1).max(48),
    section: z.string().min(1),
    pageLabel: z.string().min(1),
    format: z.enum(['square', 'wide']).default('square'),
    layout: Layout,
    headline: z.string().min(1).max(72),
    nodes: z.array(z.object({
      id: z.string().regex(/^[a-z][a-z0-9-]*$/),
      type: z.enum(['input', 'process', 'decision', 'evidence', 'result', 'context']),
      label: z.string().min(1).max(28),
      caption: z.string().min(1).max(90),
      visual: Visual,
      shape: Shape,
      position: z.object({ x: z.number().min(0.08).max(0.92), y: z.number().min(0.28).max(0.86) }).optional()
    })).min(2).max(6),
    edges: z.array(z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().max(18),
      labelPriority: z.enum(['essential', 'optional']).default('optional'),
      relation: z.enum(['flow', 'supervision', 'evidence', 'contrast', 'constraint']).default('flow'),
      edgeGroup: z.string().regex(/^[a-z][a-z0-9-]*$/).optional(),
      pathStyle: z.enum(['straight', 'curve']).optional(),
      bend: z.number().min(-0.7).max(0.7).optional(),
      via: z.array(z.object({ x: z.number().min(0.04).max(0.96), y: z.number().min(0.24).max(0.90) })).max(4).optional()
    })).max(12),
    groups: z.array(z.object({
      id: z.string().regex(/^[a-z][a-z0-9-]*$/),
      label: z.string().max(28),
      nodeIds: z.array(z.string()).min(1).max(5),
      color: z.enum(['teal', 'blue', 'purple', 'orange', 'green']),
      labelAlign: z.enum(['left', 'right']).optional()
    })).max(4).optional()
  })).min(1).max(36)
});

const SingleStoryboard = Storyboard.extend({
  pages: Storyboard.shape.pages.length(1)
});

function usage() {
  console.log('Usage: node generate_with_llm.mjs <article.md|txt> [output-dir] [--series]');
  console.log('Environment: DEEPSEEK_API_KEY or OPENAI_API_KEY (one required)');
  console.log('Optional: LLM_PROVIDER, LLM_MODEL, DEEPSEEK_MODEL, DEEPSEEK_BASE_URL, OPENAI_MODEL, OPENAI_URL');
}

function parseArgs(argv) {
  const positional = argv.filter(v => !v.startsWith('--'));
  return {
    input: positional[0],
    output: positional[1] || 'output/llm-result',
    planOnly: argv.includes('--plan-only'),
    noRender: argv.includes('--no-render'),
    series: argv.includes('--series')
  };
}

function loadEnvFile(filePath) {
  if (!fsSync.existsSync(filePath)) return;
  for (const line of fsSync.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equals = trimmed.indexOf('=');
    if (equals < 0) continue;
    const key = trimmed.slice(0, equals).trim();
    const value = trimmed.slice(equals + 1).trim().replace(/^['"]|['"]$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function assetSlugFor(value) {
  return String(value || 'blog-gif')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72) || 'blog-gif';
}

function assetSlugFromOutputDir(outputDir) {
  const base = path.basename(outputDir);
  const candidate = /^pipeline-\d+$/.test(base) ? path.basename(path.dirname(outputDir)) : base;
  return assetSlugFor(candidate);
}

async function openAIParsedResponse(client, { model, schema, name, instructions, input }) {
  const response = await client.responses.parse({
    model,
    instructions,
    input,
    text: { format: zodTextFormat(schema, name) }
  });
  if (!response.output_parsed) {
    throw new Error(`The model returned no parsed ${name}. Check refusal/output details in the API dashboard.`);
  }
  return response.output_parsed;
}

function clampText(value, maxLength) {
  if (typeof value !== 'string' || value.length <= maxLength) return value;
  return value.slice(0, maxLength).trimEnd();
}

function clampStoryboardText(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  if (payload.visualDirection) {
    payload.visualDirection.character = clampText(payload.visualDirection.character, 60);
    payload.visualDirection.recurringMetaphor = clampText(payload.visualDirection.recurringMetaphor, 90);
  }
  if (Array.isArray(payload.pages)) {
    for (const page of payload.pages) {
      if (!page || typeof page !== 'object') continue;
      page.title = clampText(page.title, 48);
      page.headline = clampText(page.headline, 72);
      if (Array.isArray(page.nodes)) {
        for (const node of page.nodes) {
          node.label = clampText(node.label, 28);
          node.caption = clampText(node.caption, 90);
        }
      }
      if (Array.isArray(page.edges)) {
        for (const edge of page.edges) edge.label = clampText(edge.label, 18);
      }
      if (Array.isArray(page.groups)) {
        for (const group of page.groups) group.label = clampText(group.label, 28);
      }
    }
  }
  return payload;
}

async function deepSeekParsedResponse(client, { model, schema, name, instructions, input }) {
  const jsonSchema = z.toJSONSchema(schema);
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `${instructions}\n\nReturn JSON only. The JSON must match this schema:\n${JSON.stringify(jsonSchema)}`
          },
          { role: 'user', content: input }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 16384,
        stream: false
      });
      const content = completion.choices?.[0]?.message?.content;
      if (!content?.trim()) throw new Error('DeepSeek returned empty JSON content.');
      const payload = JSON.parse(content);
      return schema.parse(name === 'comic_storyboard' ? clampStoryboardText(payload) : payload);
    } catch (error) {
      lastError = error;
      if (attempt < 3) console.warn(`${name} validation failed (attempt ${attempt}/3); retrying...`);
    }
  }
  throw new Error(`DeepSeek could not produce a valid ${name} after 3 attempts: ${lastError?.message}`);
}

function chooseProvider() {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase();
  if (explicit && !['deepseek', 'openai'].includes(explicit)) throw new Error('LLM_PROVIDER must be deepseek or openai.');
  const provider = explicit || (process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'openai');
  const apiKey = provider === 'deepseek' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;
  if (!apiKey) return { provider, apiKey: null };
  if (provider === 'deepseek') {
    return {
      provider, apiKey,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: process.env.LLM_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'
    };
  }
  return {
    provider,
    apiKey,
    baseURL: process.env.OPENAI_URL || undefined,
    model: process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-5.6-luna'
  };
}

async function writeManifest(outputDir, manifest) {
  await fs.writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function render(storyboardPath, outputDir) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['comic_pipeline.js', storyboardPath, outputDir], {
      cwd: process.cwd(), stdio: 'inherit', shell: false
    });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Renderer exited with code ${code}`)));
  });
}

async function main() {
  loadEnvFile(path.join(process.cwd(), '.env'));
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) { usage(); process.exitCode = 1; return; }
  const config = chooseProvider();
  if (!config.apiKey) {
    console.error(`Missing ${config.provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'}. Set it in your shell; do not paste it into source files.`);
    console.error('DeepSeek: $env:DEEPSEEK_API_KEY="..."');
    console.error('OpenAI:   $env:OPENAI_API_KEY="..."');
    process.exitCode = 2; return;
  }

  const inputPath = path.resolve(args.input);
  const outputDir = path.resolve(args.output);
  const assetSlug = assetSlugFromOutputDir(outputDir);
  const article = await fs.readFile(inputPath, 'utf8');
  if (article.trim().length < 80) throw new Error('The article is too short to plan.');
  await fs.mkdir(outputDir, { recursive: true });

  const { provider, model } = config;
  const client = new OpenAI({ apiKey: config.apiKey, ...(config.baseURL ? { baseURL: config.baseURL } : {}) });
  const parsedResponse = provider === 'deepseek' ? deepSeekParsedResponse : openAIParsedResponse;
  console.log(`[1/3] Planning the full article with ${provider}/${model}...`);
  const plan = await parsedResponse(client, {
    model, schema: Plan, name: 'article_plan',
    instructions: [
      'You are the content planner for a pastel hand-drawn educational infographic series.',
      'Read the entire article before planning. Preserve technical correctness and causal order.',
      'Create a global outline, glossary, and consistent visual direction before any page is composed.',
      'Do not mechanically map paragraphs to pages. Merge repetition and split dense concepts semantically.',
      'Keep each key point concise enough to become one visual node later.',
      'Identify causal, sequential, comparative, branching, cyclic, temporal, and hub relationships explicitly.',
      'Ignore article utility sections such as references, bibliography, sources, further reading, appendix, footnotes, table of contents, acknowledgments, citation notes, metadata, front matter, SEO, changelog, author notes, read-more blocks, comments, and newsletter prompts.',
      'If a source heading uses article-utility or meta-writing labels such as takeaway, TL;DR, references, appendix, abstract, introduction, related work, conclusion, summary, overview, discussion, limitations, future work, this article, this post, blog post, section, chapter, figure, table, metadata, front matter, or comments, rewrite it as the actual concept name or a concise reader-facing concept.',
      'Make visual_style.character and recurring_metaphor specific to this article; never use generic AI-to-visual-story wording.'
    ].join('\n'),
    input: `SOURCE ARTICLE\n\n${article}`
  });
  const planPath = path.join(outputDir, 'plan.json');
  await fs.writeFile(planPath, JSON.stringify(plan, null, 2));
  await writeManifest(outputDir, {
    pipeline: 'ai-gif-pipeline-3',
    source: path.basename(inputPath),
    assetSlug,
    title: plan.title,
    version: 2,
    mode: args.series ? 'series' : 'single',
    outputs: {
      plan: 'plan.json',
      storyboard: null,
      gifs: []
    },
    pages: []
  });
  console.log(`Saved ${planPath}`);
  if (args.planOnly) return;

  console.log(`[2/3] Composing storyboard pages with ${provider}/${model}...`);
  const compositionInstructions = args.series ? [
    'Create one or more pages per section and keep the section order.',
    'Use series mode only to preserve section-level teaching detail that cannot fit one coherent canvas.'
  ] : [
    'Create exactly one page that synthesizes the entire article. Do not create one page per section.',
    'Reduce the article to one thesis, one main reading path, and at most one meaningful branch, contrast, failure, or detour.',
    'Use 4 to 6 compound nodes. Fold implementation details, tool names, and repeated evidence into short captions instead of separate nodes.',
    'The page should function as a standalone graphical abstract: a reader must understand the article from the title, headline, nodes, groups, and arrows alone.',
    'Choose format wide with semantic-map when one main horizontal path plus a parallel lane or detour communicates the article most clearly; otherwise use square.',
    'Prefer semantic-map when the article contains a main path plus a parallel constraint or detour. Keep captions near 6 to 10 English words or 12 to 24 Chinese characters; 12 English words is a hard ceiling.',
    'All node captions on the page share one body font size. Write every caption for the narrowest node instead of assuming the renderer will shrink long captions independently.',
    'Keep group labels under 20 characters when possible. Use compact conceptual names, not sentence-like explanations.'
  ];
  const storyboard = await parsedResponse(client, {
    model, schema: args.series ? Storyboard : SingleStoryboard, name: 'comic_storyboard',
    instructions: [
      'You compose square or wide pastel hand-drawn technical infographic pages.',
      'Use the supplied global plan as the single source of truth.',
      ...compositionInstructions,
      'Choose layout by semantic relationship: linear-flow for steps, branching for alternatives, before-after for contrast, cycle for feedback, hub-spoke for one-to-many, cause-effect for causality, and timeline for change over time.',
      'Use staged-flow for a sequential process with 3 to 6 substantial nodes when one horizontal row would compress arrows and leave most of the canvas empty. It uses a serpentine two-row reading path.',
      'Use semantic-map when the argument requires parallel lanes, split-and-merge flow, converging evidence, shared supervision, or multiple channels. For semantic-map, give every node an explicit normalized position and use groups for labeled lanes or subsystems.',
      'Treat semantic-map positions as relative anchors, not absolute canvas margins. Do not reserve header whitespace or outer padding in coordinates; the renderer fits the map into the available post-header content frame.',
      'Spread genuinely different lanes and clusters across the relative x/y range. Leave breathing room between nodes and groups, not around the outside of the whole canvas.',
      'Classify edges as flow, supervision, evidence, contrast, or constraint so the renderer can distinguish logical roles.',
      'Give edges in one continuous process the same edgeGroup. A group shares one dashed-line color and rhythm even if a later node represents failure.',
      'Use pathStyle curve with a signed bend when a curved arrow makes a turn, branch, or long jump easier to follow. Do not curve every edge decoratively.',
      'Use edge via points in semantic-map to route around nodes, group labels, and other edges. Do not allow edge crossings or text-line overlap.',
      'Treat edge labels as scarce annotations. Use an empty label when direction, relation style, node copy, or group headings already explain the transition.',
      'Set labelPriority to essential only when removing that edge label would make the argument ambiguous; otherwise set it to optional. The adaptive renderer may hide optional labels when no collision-free position exists.',
      'Never put article-utility or meta-writing terms in any visible title, headline, node label, node caption, edge label, group label, or page-level text: takeaway, TL;DR, references, bibliography, sources, further reading, appendix, table of contents, abstract, introduction, related work, conclusion, summary, overview, discussion, limitation, future work, this article, this post, blog post, section, chapter, figure, table, metadata, front matter, SEO, author note, read more, comments, newsletter.',
      'Choose the node count from the content relationship. Use 2 for a direct contrast or transformation, 3 for a simple chain, 4 or 5 for a real multi-stage process, and 6 only when every node is essential.',
      'Each page must contain 2 to 6 nodes. Six is a hard ceiling, not a target. Never pad a page with decorative nodes and never force every page to use the same count.',
      'When more than 6 essential ideas belong together, split them into two pages at the strongest semantic boundary.',
      `Choose a semantic visual for every node. Prefer concrete domain visuals before abstract ones: ${CONCRETE_ICON_HINTS}.`,
      'Use agent only for an agentic system, planner, tool-using assistant, or explicit autonomous actor. Use schema, graph, chat-bubbles, or idea only when that exact abstraction is the visible subject. Do not use idea as a generic fallback when a concrete object, signal, constraint, product surface, or process visual fits. Use person only for an actual human actor, user, reader, customer, or operator mentioned in the source. Never add a mascot or permanent guide.',
      'Treat every visual as a wordless monoline glyph. Never choose a visual that needs a visible letter, acronym, flag, emoji, mascot, or language character to make sense.',
      'Use illustration for distinctive actors or objects, pill for compact process steps, and card when a caption needs explanatory space. Mix shapes when meaning benefits from it.',
      'Node labels must be at most 28 characters. Captions must be one compact idea, ideally 18-45 Chinese characters or 8-22 English words, and never repeat the label.',
      'The renderer selects one shared maximum feasible body font size per page. If one caption is much longer, shorten or merge its idea rather than forcing every caption to shrink.',
      'If a concept does not fit, split it into another node or page. Do not rely on ellipses.',
      'Set headline to the article-specific transformation, question, or conclusion shown on that page.',
      'Copy the global character and recurring metaphor into visualDirection, but treat character as optional art direction rather than a mandatory on-page figure.',
      'Avoid repeating the article title or the same background context on every page.',
      'Use pageLabel as a local section page number such as 1, 2, or 3.'
    ].join('\n'),
    input: `GLOBAL PLAN\n\n${JSON.stringify(plan, null, 2)}`
  });
  const storyboardPath = path.join(outputDir, 'storyboard.json');
  await fs.writeFile(storyboardPath, JSON.stringify(storyboard, null, 2));
  await writeManifest(outputDir, {
    pipeline: 'ai-gif-pipeline-3',
    source: path.basename(inputPath),
    assetSlug,
    title: storyboard.title,
    version: storyboard.version,
    mode: args.series ? 'series' : 'single',
    outputs: {
      plan: 'plan.json',
      storyboard: 'storyboard.json',
      gifs: []
    },
    pages: []
  });
  console.log(`Saved ${storyboardPath}`);
  if (args.noRender) return;

  console.log('[3/3] Rendering GIFs locally...');
  await render(storyboardPath, outputDir);
  const renderedManifestPath = path.join(outputDir, 'manifest.json');
  const renderedManifest = JSON.parse(await fs.readFile(renderedManifestPath, 'utf8'));
  await writeManifest(outputDir, {
    ...renderedManifest,
    source: path.basename(inputPath),
    assetSlug,
    mode: args.series ? 'series' : 'single',
    outputs: {
      plan: 'plan.json',
      storyboard: 'storyboard.json',
      gifs: renderedManifest.outputs?.gifs || renderedManifest.pages || []
    }
  });
}

main().catch(error => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
