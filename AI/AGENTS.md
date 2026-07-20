# AI Generator Notes

This folder is a local generator workspace. Keep the publishable blog independent from it.

Use root commands for blog work:

```bash
npm run gif:doctor
npm run gif -- 1 --input src/content/blog/<slug>.mdx
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
```

Use standalone mode only when maintaining or copying one pipeline:

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

When updating these pipelines:

- Keep publishable generated assets under `public/media/gifs/<asset-slug>/`.
- Keep temporary inputs and frames under `.tmp/`.
- Never print, copy, or commit `.env` values.
- Prefer editing the root wrapper when improving the user workflow.
- Keep subfolder README files short and point users back to root commands.
- Preserve the ability to rerender from existing JSON without another LLM call.
- Pipeline 3 currently remains standalone; do not modify repository-root wrappers unless that broader integration is explicitly requested.
