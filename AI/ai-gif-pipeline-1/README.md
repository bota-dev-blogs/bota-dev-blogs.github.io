# Pipeline 1: Article To Comic GIFs

This folder contains the implementation for the comic-style explainer GIF generator.
Pipeline 1 is meant to produce a varied section-level visual sequence, not a
single repeated template. The renderer uses aligned pastel information blocks,
semantic icon tiles, compact key-idea bands, and light card zoom motion. Its
default grammar is a compact tile board: large rectangular blocks, square-ish
rhythm, clear alignment, and little dead space. It does not rely on arrows,
scattered node maps, or guide-character scenes for structure.

For normal blog work, run it from the repository root:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx
```

First-time setup from the repository root:

```bash
npm run gif:setup:1
```

Standalone setup inside this folder:

```bash
npm install
cp .env.example .env
```

Fill in `.env`, then run standalone commands only when needed:

```bash
npm run generate -- --input article.md
npm run local -- --input article.md
npm run plan -- --input article.md
npm run storyboard -- --input article.md
```

Quick local render without LLM:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx --local
```

Default output:

```text
public/media/gifs/<asset-slug>/pipeline-1/
```

Standalone output defaults to:

```text
output/<input-name>/
```

## What It Produces

- `plan.json`: optional LLM article plan
- `storyboard.json`: structured visual pages
- `manifest.json`: source and output file list
- `01-*.gif`, `02-*.gif`, ...: blog-ready animated GIFs

`manifest.json` is written for final renders and for intermediate `--plan-only` / `--no-render` runs.

## Storyboard Style

Each page may choose:

- `composition`: `flow`, `comparison`, `checklist`, `system-map`,
  `failure-map`, `evidence-map`, `compact-grid`, or `spotlight`
- `layout`: `row`, `timeline`, `spotlight`, `stacked`, `grid`, `mosaic`,
  `compare`, `lanes`, or `checklist`
- `introStyle`: `guide`, `badge`, `ribbon`, `split`, or `quiet`
- `titleTreatment`: `underline`, `corner-tag`, or `none`
- `kicker`: a short page-level key idea
- `icon`: a semantic visual such as `asr`, `tts`, `microphone`, `waveform`,
  `headphones`, `speaker`, `subtitle`, `phone`, `edge-device`, `chip`, `gpu`,
  `server`, `router`, `sensor`, `camera`, `cloud`, `network`, `database`,
  `dataset`, `embedding`, `model`, `shield`, `lock`, `gate`, `filter`,
  `target`, `sliders`, `latency`, `translate`, `globe`, `document`, `search`,
  `check`, `alert`, `gear`, `link`, `layers`, `merge`, `room`, `bot`, `ear`,
  `video`, `branch`, `music`, `mask`, `person`, `schema`, `graph`, `agent`,
  `chat-bubbles`, or `idea`

Avoid making every page a guide character, arrow, subtitle box, scattered node
map, or three disconnected cards. Do not render article-utility or meta-writing
labels such as "takeaway", "TL;DR", "references", "appendix", "table of
contents", "abstract", "introduction", "related work", "conclusion",
"summary", "overview", "discussion", "limitations", "future work", "this
article", "blog post", "section", "chapter", "figure", "table", "metadata",
"read more", or "comments". Do not render page numbers, section numbers, or
file-like labels such as `What is Otter.ai 01`; `pageLabel` is ordering
metadata only. Prefer the actual concept name over generic visible labels. Use
composition and icon diversity inside the same aligned tile grammar, so the
sequence feels varied without becoming visually noisy. Prefer concrete domain
icons before abstract icons; reserve `idea`, `schema`, `graph`, `agent`, and
`chat-bubbles` for pages where that abstraction is the subject. The shared
fallback list intentionally excludes weak abstract icons. Canvas glyphs come
from `AI/shared/semantic-icons.cjs`; update that shared module rather than
copying icon code into this pipeline.

## Environment

The root wrapper reads this folder's `.env` and passes values into the generator. See `AI/README.md` for provider variables.

Prefer the root `npm run gif` command for blog work. Use standalone mode only when this folder is copied, tested, or maintained by itself.
