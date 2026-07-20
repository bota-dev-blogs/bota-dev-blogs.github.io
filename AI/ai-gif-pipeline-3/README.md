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
- `edgeGroup` keeps related dashed lines consistent.
- Optional edge labels are removed when no collision-free position exists.
- Captions share one page-level maximum feasible font size.
- Group frames expand to contain their measured headings.
- Semantic icons animate at 20 FPS in a seamless two-second loop.

Content and layout rules are documented in `SKILL.md` and `references/`.

This folder contains only the final pipeline-3 behavior. Historical pipeline evolution remains in pipeline 1 and is intentionally not repeated here.
