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
const Icon = z.enum(sharedIcons.ICON_NAMES);
const ABSTRACT_ICON_NAMES = new Set(['person', 'bot', 'idea', 'agent', 'schema', 'graph', 'chat-bubbles']);
const CONCRETE_ICON_HINTS = sharedIcons.ICON_NAMES.filter((name) => !ABSTRACT_ICON_NAMES.has(name)).join(', ');
const Layout = z.enum(['row', 'timeline', 'spotlight', 'stacked', 'grid', 'mosaic', 'compare', 'lanes', 'checklist']);
const Composition = z.enum(['flow', 'comparison', 'checklist', 'system-map', 'failure-map', 'evidence-map', 'compact-grid', 'spotlight']);
const IntroStyle = z.enum(['guide', 'badge', 'ribbon', 'split', 'quiet']);
const TitleTreatment = z.enum(['underline', 'corner-tag', 'none']);
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
  version: z.literal(1),
  style: z.literal('pastel-handdrawn'),
  title: z.string().min(1),
  pages: z.array(z.object({
    title: z.string().min(1),
    section: z.string().min(1),
    pageLabel: z.string().min(1),
    kicker: z.string().min(1).max(120),
    composition: Composition,
    layout: Layout,
    introStyle: IntroStyle,
    titleTreatment: TitleTreatment,
    cards: z.array(z.object({
      title: z.string().min(1).max(60),
      body: z.string().min(1).max(320),
      icon: Icon
    })).min(1).max(4)
  })).min(1).max(36)
});

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

function usage() {
  console.log('Usage: node generate_with_llm.mjs <article.md|txt> [output-dir]');
  console.log('Environment: DEEPSEEK_API_KEY or OPENAI_API_KEY (one required)');
  console.log('Optional: LLM_PROVIDER, LLM_MODEL, DEEPSEEK_MODEL, DEEPSEEK_BASE_URL, OPENAI_MODEL, OPENAI_URL');
}

function parseArgs(argv) {
  const positional = argv.filter(v => !v.startsWith('--'));
  return {
    input: positional[0],
    output: positional[1] || 'output/llm-result',
    planOnly: argv.includes('--plan-only'),
    noRender: argv.includes('--no-render')
  };
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
      return schema.parse(JSON.parse(content));
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

async function render(storyboardPath, outputDir) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['comic_pipeline.js', storyboardPath, outputDir], {
      cwd: process.cwd(), stdio: 'inherit', shell: false
    });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Renderer exited with code ${code}`)));
  });
}

async function writeManifest(outputDir, manifest) {
  await fs.writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
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
      'Ignore article utility sections such as references, bibliography, sources, further reading, appendix, footnotes, table of contents, acknowledgments, citation notes, metadata, front matter, SEO, changelog, author notes, read-more blocks, comments, and newsletter prompts.',
      'Treat visual_style.character as "none" unless a real human actor is essential. Prefer systems, evidence, tools, and product surfaces over guide characters.',
      'Keep each key point concise enough to become one visual card later.'
    ].join('\n'),
    input: `SOURCE ARTICLE\n\n${article}`
  });
  const planPath = path.join(outputDir, 'plan.json');
  await fs.writeFile(planPath, JSON.stringify(plan, null, 2));
  await writeManifest(outputDir, {
    pipeline: 'ai-gif-pipeline-1',
    source: path.basename(inputPath),
    assetSlug,
    title: plan.title,
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
  const storyboard = await parsedResponse(client, {
    model, schema: Storyboard, name: 'comic_storyboard',
    instructions: [
      'You compose a sequence of square, clean pastel technical infographic pages.',
      'Use the supplied global plan as the single source of truth.',
      'Create one or more pages per section and keep the section order.',
      'Each page must have 1 to 4 cards. Prefer 2 to 4; use 1 only for a strong conclusion or spotlight claim.',
      'The preferred visual grammar is a compact tile board: large rectangular information blocks, square-ish rhythm, clear alignment, and little dead space. Think editorial Win8-style tiles softened into the existing hand-drawn pastel style.',
      'Choose a page composition before choosing a layout: flow for staged processes, comparison for two options or trade-offs, checklist for design rules or decision criteria, system-map for gates or interacting subsystems, failure-map for bottlenecks or negative results, evidence-map for signal/evidence collection, compact-grid for ordinary grouped points, and spotlight for one dominant claim.',
      'Use composition diversity across an article. Do not make every page a compact-grid or card table.',
      'Choose a varied fallback layout for each page: row, timeline, spotlight, stacked, grid, mosaic, compare, lanes, or checklist.',
      'Choose a varied introStyle for each page: guide, badge, ribbon, split, or quiet. Treat guide as a compact key-idea card, not a character scene.',
      'Choose a varied titleTreatment: underline, corner-tag, or none. Do not expose internal composition labels in the artwork.',
      'Use kicker as the page-level key idea. It should be specific, not a generic subtitle.',
      'Never put article-utility or meta-writing terms in any visible title, label, card, caption, badge, or subtitle: takeaway, TL;DR, references, bibliography, sources, further reading, appendix, table of contents, abstract, introduction, related work, conclusion, summary, overview, discussion, limitation, future work, this article, this post, blog post, section, chapter, figure, table, metadata, front matter, SEO, author note, read more, comments, newsletter.',
      'Rewrite those ideas into the actual concept name whenever possible. If a generic replacement is unavoidable, use a reader-facing phrase such as design rule, evidence, map, short version, or what it means.',
      'Avoid repeating the same layout or introStyle on adjacent pages unless the section truly needs continuity.',
      'Do not plan arrows, arrow labels, scattered node maps, or person-arrow-subtitle compositions. Flow pages should use stacked or tiled process blocks, not isolated islands.',
      'Card titles must be short. Card bodies must be self-contained and readable, not fragments.',
      'Avoid repeating the article title or the same background context on every page.',
      `Use a diverse semantic icon set. Prefer concrete domain icons before abstract icons: ${CONCRETE_ICON_HINTS}.`,
      'Use agent only for an agentic system, planner, tool-using assistant, or explicit autonomous actor. Use graph, schema, chat-bubbles, or idea only when that exact abstraction is the visible subject. Do not use idea as a generic fallback when a concrete object, signal, constraint, product surface, or process icon fits.',
      'Treat every icon as a wordless monoline glyph. Never choose an icon that needs a visible letter, acronym, flag, emoji, mascot, or language character to make sense.',
      'Use pageLabel only as ordering metadata such as 1, 2, or 3. Do not repeat pageLabel, section numbers, or file-like labels in any visible copy.'
    ].join('\n'),
    input: `GLOBAL PLAN\n\n${JSON.stringify(plan, null, 2)}`
  });
  const storyboardPath = path.join(outputDir, 'storyboard.json');
  await fs.writeFile(storyboardPath, JSON.stringify(storyboard, null, 2));
  await writeManifest(outputDir, {
    pipeline: 'ai-gif-pipeline-1',
    source: path.basename(inputPath),
    assetSlug,
    title: storyboard.title,
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
