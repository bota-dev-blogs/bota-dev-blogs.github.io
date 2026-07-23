# Pipeline 2: Paper To Diagram GIF

This folder contains the implementation for the paper/method diagram GIF generator.
The layout keeps a compact header, a tighter vertical frame, and capped wide
canvases so method diagrams use the available area without feeling cramped.
Connectors use animated dashed lines without triangular arrowheads, keeping
attention on the method nodes and edge labels. Nodes use shared semantic
matching and compact SVG line glyphs, so ASR, TTS, datasets, embeddings,
models, phones, edge devices, chips, GPUs, servers, routers, sensors, gates,
filters, and outputs can be distinguished without becoming icon-heavy.

Visible diagram text must be publication-ready. Never render the word
"takeaway" or article-utility labels such as "TL;DR", "references",
"abstract", "introduction", "related work", "summary", "overview",
"discussion", "limitations", "future work", "figure", "table", "metadata", or
"read more" in titles, subtitles, nodes, edges, or evidence-derived labels; use
the exact method concept instead.

Node icons are wordless monoline glyphs. Avoid relying on visible acronyms,
letters, flags, emoji, language characters, or mascots as visual symbols.
Published `diagram.json` nodes must define a canonical `node.icon` from
`AI/shared/semantic-icons.cjs`. `src/layout-diagram.js` preserves valid explicit
choices and uses semantic matching plus `input -> document`, `method -> layers`,
and `output -> check` fallbacks only for missing or unknown draft values. The
HTML template must keep a small SVG drawing case for every shared icon name.

For normal blog work, run it from the repository root:

```bash
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug my-post
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug my-post --keep-frames
```

First-time setup from the repository root:

```bash
npm run gif:setup:2
```

Standalone setup inside this folder:

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

The renderer also needs `ffmpeg` on your shell path.

Fill in `.env`, then run standalone commands only when needed:

```bash
npm run generate -- --input paper.pdf
npm run generate -- --input note.md --out output/my-diagram
npm run generate -- --input diagram.json
```

Use an existing diagram JSON:

```bash
npm run gif -- 2 --input AI/ai-gif-pipeline-2/diagram.json --slug my-post
```

Default output:

```text
public/media/gifs/<asset-slug>/pipeline-2/
```

Standalone output defaults to:

```text
output/<input-name>/01-<diagram-title>.gif
```

## What It Produces

- `diagram.json`: LLM or hand-authored diagram structure
- `diagram.html`: browser preview
- `01-*.gif`: blog-ready animated GIF named from the diagram title
- `manifest.json`: source and output file list

Intermediate PNG frames are written under `.tmp/gif-frames/` by the root wrapper, not under `public/`. Successful root renders remove those frames automatically; use `--keep-frames` only when debugging.

Existing hand-authored `diagram.json` files are sanitized before rendering, so
old internal labels are rewritten in the copied output diagram as well as in
the final GIF.

## Environment

The root wrapper reads this folder's `.env` and passes values into the generator. See `AI/README.md` for provider variables.

Prefer the root `npm run gif` command for blog work. Use standalone mode only when this folder is copied, tested, or maintained by itself.
