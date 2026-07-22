# AI GIF Generators

This folder contains local tools for producing GIF assets for Bota blog posts.

For normal blog work, use the repository root commands. Standalone mode is only for maintaining, copying, or testing one pipeline without the Astro blog.

## Choose A Mode

Use integrated mode when writing posts in this repo:

```bash
npm run gif -- 1 --input src/content/blog/<slug>.mdx
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
npm run gif -- 3 --input src/content/blog/<slug>.mdx
```

Use standalone mode only inside a pipeline folder:

```bash
cd AI/ai-gif-pipeline-1
npm run generate -- --input article.md
```

```bash
cd AI/ai-gif-pipeline-2
npm run generate -- --input paper.pdf
```

```bash
cd AI/ai-gif-pipeline-3
npm run generate -- --input ../../src/content/blog/<slug>.mdx
```

## First-Time Setup

From the repository root:

```bash
npm run gif:setup
```

Or install one pipeline:

```bash
npm run gif:setup:1
npm run gif:setup:2
npm run gif:setup:3
```

Pipeline 2 also needs `ffmpeg` on your shell path.

## Environment

Copy the safe templates and fill in your provider keys:

```bash
cp AI/ai-gif-pipeline-1/.env.example AI/ai-gif-pipeline-1/.env
cp AI/ai-gif-pipeline-2/.env.example AI/ai-gif-pipeline-2/.env
cp AI/ai-gif-pipeline-3/.env.example AI/ai-gif-pipeline-3/.env
```

Do not commit `.env`.

Provider variables:

```text
LLM_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_URL=https://YOUR-OPENAI-COMPATIBLE-PROVIDER
OPENAI_MODEL=gpt-5.5
```

```text
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=...
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-pro
LLM_MODEL=deepseek-v4-pro
```

Shell environment variables override `.env` values.

Check readiness without printing secrets:

```bash
npm run gif:doctor
npm run gif:clean -- --dry-run
```

## Icon System

Pipeline 1 and pipeline 3 share their Canvas glyphs through
`AI/shared/semantic-icons.cjs`. Update semantic matching, colors, and Canvas
glyphs there instead of copying icon code into individual pipelines.

All GIF icons should be wordless monoline semantic glyphs. Avoid visible
letters, acronyms, language characters, flags, emoji, mascots, and generic
fallback symbols when a concrete domain icon fits. The shared vocabulary is
biased toward AI/audio/product-system articles: ASR, TTS, waveform,
microphone, speaker, subtitles, phone, edge device, chip, GPU, server, router,
sensor, dataset, embedding, model, cloud, lock, gate, filter, and latency.
`FALLBACK_ICON_NAMES` is intentionally smaller and more concrete than the full
icon list, so weak text does not randomly become a person, mascot-like bot, or
abstract idea icon. Pipeline 2 uses the same shared semantic matching, then
draws compact SVG glyphs for every shared icon name in its template.

## Pipeline 1: Article To Comic GIFs

Best for article explainers and optional visual sequences after a blog draft exists. Pipeline 1 now uses a compact tile-board grammar: aligned pastel information blocks, square-ish rectangular rhythm, semantic icon tiles, and subtle card zoom motion, without relying on arrows, scattered node maps, or guide-character scenes.

Visible GIF text must be reader-facing. Do not render internal editorial labels such as "takeaway"; use "key idea", "design rule", "checklist", or the concrete concept being explained.

Integrated:

```bash
npm run gif -- 1 --input src/content/blog/<slug>.mdx
npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json --slug <slug> --local --page 1
```

Standalone:

```bash
cd AI/ai-gif-pipeline-1
npm run generate -- --input article.md
npm run local -- --input article.md
npm run plan -- --input article.md
npm run storyboard -- --input article.md
```

Standalone output defaults to:

```text
AI/ai-gif-pipeline-1/output/<input-name>/
```

Use `--page <n>` when rerendering an existing storyboard and the article publishes only one selected page. Pipeline 1 cleans stale `.gif` files after a successful render, so old GIFs that are no longer in the manifest do not remain in the output folder.

## Pipeline 2: Paper To Diagram GIFs

Best for audio AI papers, architecture diagrams, and method-overview animations.

Pipeline 2 must also keep visible labels publication-ready: no internal editorial words such as "takeaway" in titles, subtitles, node text, or edge labels.

Integrated:

```bash
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug> --keep-frames
```

Standalone:

```bash
cd AI/ai-gif-pipeline-2
npm run generate -- --input paper.pdf
npm run generate -- --input diagram.json
npm run generate -- --input paper.pdf --no-render
```

Standalone output defaults to:

```text
AI/ai-gif-pipeline-2/output/<input-name>/
```

The root wrapper writes pipeline-2 PNG frames under `.tmp/gif-frames/` while rendering and removes them after a successful render. Use `--keep-frames` only when debugging animation frames.

## Pipeline 3: Article To One Animated Summary

Best for one concise article-wide graphical abstract. It defaults to exactly one GIF and uses shared typography, semantic groups, curved paths, and collision-aware labels.

Pipeline 3 should rewrite article headings or section summaries that say "takeaway" into reader-facing language before they reach the canvas.

Integrated:

```bash
npm run gif -- 3 --input src/content/blog/<slug>.mdx
npm run gif -- 3 --input src/content/blog/<slug>.mdx --series
npm run gif -- 3 --input public/media/gifs/<slug>/pipeline-3/storyboard.json --slug <slug> --local --page 1
```

Standalone:

```bash
cd AI/ai-gif-pipeline-3
npm run generate -- --input ../../src/content/blog/<slug>.mdx
npm run series -- --input article.mdx
npm run local -- --input storyboard.json --page 1
```

Standalone output defaults to:

```text
AI/ai-gif-pipeline-3/output/<input-name>/
```

## Output Contract

For the blog, publish only selected assets under:

```text
public/media/gifs/<asset-slug>/
```

Use the filesystem-safe asset slug for this folder. If a post slug contains dots or other punctuation, convert them to hyphens.

Integrated output folders should be consistent:

```text
pipeline-1/manifest.json
pipeline-1/storyboard.json
pipeline-1/*.gif
pipeline-2/manifest.json
pipeline-2/diagram.json
pipeline-2/diagram.html
pipeline-2/01-*.gif
pipeline-3/manifest.json
pipeline-3/storyboard.json
pipeline-3/01-article-summary.gif
```

Pipeline 1 may also include `plan.json` when the LLM planner is used.
Pipeline 1 and pipeline 3 remove stale `.gif` files that are not part of the latest render manifest.
Root `--plan-only` and `--no-render` commands default to `.tmp/gif-drafts/` so incomplete outputs do not pollute `public/media/gifs/`.
Use `npm run gif:clean` for root frame cleanup, or `npm run gif:clean -- --all` for root draft, smoke, visual-audit, verification scratch folders, and ignored AI pipeline fixtures/standalone outputs. It does not remove `.env` files or `node_modules/`.

Do not publish:

```text
AI/
.tmp/
node_modules/
output/
frames/
```
