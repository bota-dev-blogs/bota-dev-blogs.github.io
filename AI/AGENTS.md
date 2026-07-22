# AI Generator Notes

This folder is a local generator workspace. Keep the publishable blog independent from it.

Use root commands for blog work:

```bash
npm run gif:doctor
npm run gif -- 1 --input src/content/blog/<slug>.mdx
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
npm run gif -- 3 --input src/content/blog/<slug>.mdx
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
- Pipeline 3 is available through the root wrapper and should write publishable assets under `public/media/gifs/<asset-slug>/pipeline-3/`.
- Generated GIF artwork must not display internal editorial labels such as "takeaway". Use reader-facing labels such as "key idea", "design rule", "checklist", or a concrete concept name.
- Pipeline 1 and pipeline 3 share Canvas icon drawing through `AI/shared/semantic-icons.cjs`; pipeline 2 uses the same semantic matching and draws compact SVG glyphs in its template. Do not duplicate semantic matching rules inside individual pipelines.
- Icons should be wordless monoline semantic glyphs. Prefer concrete AI/audio/mobile/edge/computing glyphs such as ASR, TTS, microphone, waveform, phone, edge device, chip, GPU, server, router, dataset, embedding, model, gate, filter, and latency before generic fallback icons. Avoid visible letters, acronyms, language characters, flags, emoji, and mascots.
- Keep `FALLBACK_ICON_NAMES` narrower than `ICON_NAMES`. Fallbacks should be concrete structural or technical objects, not `person`, `bot`, `idea`, `agent`, `schema`, `graph`, or `chat-bubbles`.
- When adding an icon name, add its color, Canvas drawing branch, pipeline-2 SVG drawing branch, semantic aliases/rules, and documentation in the same change.
