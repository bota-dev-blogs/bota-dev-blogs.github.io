# AI Asset Generator Guidelines

This folder is a local generator workspace. Keep the publishable blog independent from it.

Use root commands instead of direct subfolder commands:

```bash
npm run gif:doctor
npm run gif -- 1 --input src/content/blog/<slug>.mdx
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
```

Standalone mode is also supported:

```bash
cd AI/ai-gif-pipeline-1
npm run generate -- --input article.md
```

```bash
cd AI/ai-gif-pipeline-2
npm run generate -- --input paper.pdf
```

When updating these pipelines:

- Keep generated assets under `public/media/gifs/<slug>/`.
- Keep temporary inputs and frames under `.tmp/`.
- Never print, copy, or commit `.env` values.
- Prefer editing the root wrapper when improving the user workflow.
- Keep subfolder README files short and point users back to root commands.
- Preserve the ability to rerender from existing JSON without another LLM call.
