# AI Generator Notes

`AI/` contains local-only GIF renderers. Keep publishable content in
`src/content/blog/` and `public/media/`; do not deploy this folder.

There are exactly two pipelines:

- `ai-gif-pipeline-1`: compact arrow-free article explainers.
- `ai-gif-pipeline-2`: the renamed former pipeline 3, for research maps and graphical abstracts.

Before authoring a storyboard, read the selected pipeline's `SKILL.md` and its
references. Codex, Claude Code, or OpenCode writes the intermediate
`storyboard.json`; JavaScript only validates and renders it. Neither pipeline
reads `.env`, calls a third-party LLM, or generates text plans.

Root commands:

```bash
npm run gif:doctor
npm run gif:check
npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json
npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json
```

Use `npm run gif:setup`, `npm run gif:setup:1`, or `npm run gif:setup:2` for
dependencies. Do not print or commit secrets used by unrelated scripts such as
featured-image generation.

Generated GIFs must use the shared semantic vocabulary in
`AI/shared/semantic-icons.cjs`. Prefer concrete, wordless AI/audio/hardware/data
glyphs and keep visible labels reader-facing. Do not add page numbers or
internal editorial words such as `takeaway` to artwork.
