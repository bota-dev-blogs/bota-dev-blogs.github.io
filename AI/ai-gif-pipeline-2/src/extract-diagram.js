const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { sanitizeDiagram } = require('./sanitize-diagram');

const inputPath = process.argv[2];
const outputPath = process.argv[3] || 'diagram.json';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equals = trimmed.indexOf('=');
    if (equals < 0) continue;
    const key = trimmed.slice(0, equals).trim();
    const value = trimmed.slice(equals + 1).trim().replace(/^['"]|['"]$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), '.env'));

if (!inputPath) {
  console.error('Usage from repo root: npm run gif -- 2 --input paper.pdf --slug post-slug');
  console.error('Standalone usage: npm run generate -- --input paper.pdf');
  console.error('Low-level usage: node src/extract-diagram.js paper.pdf [diagram.json]');
  process.exit(1);
}

function chooseProvider() {
  const explicit = (process.env.LLM_PROVIDER || '').toLowerCase();
  if (explicit && !['deepseek', 'openai'].includes(explicit)) {
    throw new Error('LLM_PROVIDER must be deepseek or openai.');
  }
  const provider = explicit || (process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'openai');
  if (provider === 'deepseek') {
    return {
      provider,
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: process.env.LLM_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'
    };
  }
  return {
    provider,
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_URL || 'https://api.openai.com/v1',
    model: process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-5.5'
  };
}

const providerConfig = chooseProvider();

if (!providerConfig.apiKey) {
  console.error(`Missing ${providerConfig.provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'}`);
  process.exit(1);
}

const SYSTEM_PROMPT = `You convert research papers into compact animated technical diagrams.

Return JSON only. Never return Markdown. Extract only the paper's main method, not every detail.

Hard constraints:
- At most 6 nodes.
- Every important node must be visible from the first frame to the last frame.
- Never use reveal, fade, hide, delete, or re-appear effects.
- Animation effects may only be flow or highlight.
- Every edge must use a looping flow animation from the first frame.
- Do not animate nodes. Never use highlight effects.
- Use evidence strings such as "p.4, Method" when the input supports them.
- Use a 1080x650 canvas and a 5-8 second duration.
- Node kinds are only input, method, output.
- The renderer chooses wordless monoline node glyphs from node content. Write precise node labels and descriptions; do not rely on acronyms, emoji, flags, or language characters as visual symbols.
- Never put article-utility or meta-writing terms in any title, subtitle, node label, node description, edge label, or evidence string: takeaway, TL;DR, references, bibliography, sources, further reading, appendix, table of contents, abstract, introduction, related work, conclusion, summary, overview, discussion, limitation, future work, this article, this post, blog post, section, chapter, figure, table, metadata, front matter, SEO, author note, read more, comments, newsletter. Use the precise method concept instead.

Output this exact shape:
{
  "title": "short title",
  "subtitle": "one-sentence summary",
  "width": 1080,
  "height": 650,
  "duration": 6,
  "fps": 15,
  "theme": "light",
  "nodes": [{"id":"...","kind":"input|method|output","label":"...","description":"...","x":0,"y":0,"width":200,"height":110,"evidence":"..."}],
  "edges": [{"id":"...","from":"node-id","to":"node-id","label":"...","evidence":"..."}],
  "animation": [{"target":"node-or-edge-id","effect":"flow|highlight","at":0,"loop":true,"speed":24,"period":1.8}]
}

Layout rules:
- Use left-to-right flow when possible.
- Put parallel branches on separate rows.
- Keep nodes inside the canvas.
- Connect only nodes that are directly related by a method/data flow in the paper.
- Edge direction must follow the paper's direction: producer/input on "from", consumer/output on "to".
- Do not add an edge merely because two modules interact conceptually.
- Every edge must have direct paper evidence supporting both its existence and direction.
- If an intermediate node represents a produced artifact (for example generated data), route the flow through that node instead of skipping it.
- Do not invent metrics, modules, or causal claims.`;

const REVIEW_SYSTEM_PROMPT = `You are a strict diagram fact checker for research papers.

Review a proposed technical diagram against the paper text. Correct the diagram in place and return JSON only.

Priorities:
- Remove any edge that is not explicitly supported by the paper.
- Fix edge direction so data or artifacts flow from producer/input to consumer/output.
- Do not skip an explicit intermediate artifact or module.
- Do not infer a direct edge from a conceptual relationship.
- Keep only 3-6 nodes and the simplest faithful main method flow.
- Every retained edge must include concise evidence with a page or section reference.
- Use only input, method, and output node kinds.
- All animations must be flow animations targeting edges, starting at 0; never animate nodes.
- Node labels and descriptions must be precise enough for wordless monoline glyphs; do not use acronyms, emoji, flags, or language characters as visual symbols.
- Never put article-utility or meta-writing terms in any title, subtitle, node label, node description, edge label, or evidence string: takeaway, TL;DR, references, bibliography, sources, further reading, appendix, table of contents, abstract, introduction, related work, conclusion, summary, overview, discussion, limitation, future work, this article, this post, blog post, section, chapter, figure, table, metadata, front matter, SEO, author note, read more, comments, newsletter. Use a precise method concept instead.

Return the same exact diagram JSON shape as the draft.`;

function readPaper(file) {
  const buffer = fs.readFileSync(file);
  if (path.extname(file).toLowerCase() === '.pdf') {
    return pdfParse(buffer).then((result) => result.text);
  }
  return Promise.resolve(buffer.toString('utf8'));
}

function extractJson(text) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Model did not return a JSON object');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function requestModel(messages) {
  const endpoint = `${providerConfig.baseURL.replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${providerConfig.apiKey}` },
    body: JSON.stringify({
      model: providerConfig.model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages
    })
  });
  if (!response.ok) throw new Error(`LLM request failed: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error('LLM response did not contain message content');
  return extractJson(text);
}

function validate(diagram) {
  if (!Array.isArray(diagram.nodes) || !Array.isArray(diagram.edges)) throw new Error('Missing nodes or edges');
  diagram.nodes = diagram.nodes.slice(0, 6).map((node, index) => ({
    id: String(node.id || `node-${index + 1}`),
    kind: ['input', 'method', 'output'].includes(node.kind) ? node.kind : 'method',
    label: String(node.label || 'Module'),
    description: String(node.description || ''),
    x: Number(node.x) || 60 + (index % 3) * 330,
    y: Number(node.y) || 220 + Math.floor(index / 3) * 180,
    width: Number(node.width) || 220,
    height: Number(node.height) || 110,
    evidence: node.evidence || ''
  }));
  const ids = new Set(diagram.nodes.map((node) => node.id));
  const seenEdges = new Set();
  diagram.edges = diagram.edges.filter((edge) => {
    const key = `${edge.from}->${edge.to}`;
    if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to || seenEdges.has(key)) return false;
    seenEdges.add(key);
    return true;
  }).map((edge, index) => ({
    id: String(edge.id || `edge-${index + 1}`),
    from: edge.from,
    to: edge.to,
    label: String(edge.label || ''),
    evidence: edge.evidence || ''
  }));
  diagram.animation = diagram.edges.map((edge) => ({
    target: edge.id,
    effect: 'flow',
    at: 0,
    loop: true,
    speed: 24,
    period: 1.8
  }));
  diagram.width = 1080;
  diagram.height = 650;
  diagram.duration = Math.min(8, Math.max(5, Number(diagram.duration) || 6));
  diagram.fps = 15;
  return sanitizeDiagram(diagram);
}

(async () => {
  const paperText = (await readPaper(inputPath)).slice(0, 120000);
  const draft = await requestModel([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Paper text:\n\n${paperText}` }
  ]);
  const reviewed = await requestModel([
    { role: 'system', content: REVIEW_SYSTEM_PROMPT },
    { role: 'user', content: `Paper text:\n\n${paperText}\n\nProposed diagram JSON:\n\n${JSON.stringify(draft)}` }
  ]);
  fs.writeFileSync(outputPath, JSON.stringify(validate(reviewed), null, 2));
  console.log(`Wrote ${outputPath}`);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
