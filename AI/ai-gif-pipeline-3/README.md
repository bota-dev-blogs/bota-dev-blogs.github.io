# Pipeline 3: Article To One Animated Summary

Pipeline 3 reads a Markdown/MDX article and produces one animated graphical abstract by default. It is intended for concise article-wide summaries rather than the section-by-section GIF sequence already covered by pipeline 1.

## Standalone setup

```bash
cd AI/ai-gif-pipeline-3
npm install
cp .env.example .env
```

Fill in `.env`, then generate one summary GIF:

```bash
npm run generate -- --input ../../src/content/blog/<slug>.mdx
```

Default output:

```text
output/<input-name>/
  plan.json
  storyboard.json
  manifest.json
  01-article-summary.gif
```

Use a custom output folder:

```bash
npm run generate -- --input article.mdx --out output/my-summary
```

Generate a multi-page explainer only when explicitly needed:

```bash
npm run series -- --input article.mdx
```

Render an existing storyboard without another LLM call:

```bash
npm run local -- --input storyboard.json --out output/rerendered
npm run local -- --input storyboard.json --out output/rerendered --page 1
```

Planning and storyboard-only commands:

```bash
npm run plan -- --input article.mdx
npm run storyboard -- --input article.mdx
```

## Final-version behavior

- Default schema enforces exactly one page; `--series` enables multiple pages.
- Uses 4–6 compound nodes, one main reading path, and at most one key detour.
- Supports square and wide semantic layouts, straight and curved arrows, and staged two-row flows.
- Fits semantic-map positions into the available post-header content frame so output uses the canvas instead of preserving storyboard margin.
- Uses larger node bounds and adaptive text spacing so cards feel less cramped without needing longer captions.
- `edgeGroup` keeps related dashed lines consistent.
- Optional edge labels are removed when no collision-free position exists.
- Captions share one page-level maximum feasible font size.
- Group frames expand to contain their measured headings.
- Semantic icons animate at 20 FPS in a seamless two-second loop, with voice
  and product-specific visuals such as ASR, TTS, microphone, waveform, phone,
  edge device, chip, GPU, server, router, dataset, embedding, model, room,
  speaker, subtitle, sliders, network, bot, cloud, lock, ear, video, target,
  branch, filter, merge, globe, translate, document, search, alert, check,
  music, mask, and latency available when they fit the source. The shared
  fallback list intentionally excludes weak abstract icons. Canvas glyphs come
  from `AI/shared/semantic-icons.cjs`; update that shared module rather than
  copying icon code into this pipeline.
- Visible canvas text never uses article-utility or internal editorial labels
  such as "takeaway", "TL;DR", "references", "appendix", "table of contents",
  "abstract", "introduction", "related work", "conclusion", "summary",
  "overview", "discussion", "limitations", "future work", "this article",
  "blog post", "metadata", "read more", or "comments"; use the actual concept
  label instead.
- Local storyboard renders support `--page <n>` and clean stale `.gif` files after a successful render.

Content and layout rules are documented in `SKILL.md` and `references/`.

This folder contains only the final pipeline-3 behavior. Historical pipeline evolution remains in pipeline 1 and is intentionally not repeated here.
