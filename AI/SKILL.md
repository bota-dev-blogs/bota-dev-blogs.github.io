# GIF Asset Skill

Use this folder only for local GIF asset generation. The public blog remains in
`src/content/blog/` and `public/media/`.

## Pipeline Choice

Use pipeline 1 for compact section explainers, comparisons, checklists, and
aligned concept boards without arrows.

Use pipeline 2 for article-wide graphical abstracts, research maps, AI/audio
architectures, causal structures, parallel tracks, and evidence relationships.

Both pipelines are storyboard-only deterministic renderers. A coding agent reads
the article and writes the intermediate JSON; the renderer does not call an LLM
API and does not read `.env`.

## Commands

```bash
npm run gif:doctor
npm run gif:check
npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json
npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json
```

Read `AI/ai-gif-pipeline-1/SKILL.md` or
`AI/ai-gif-pipeline-2/SKILL.md` before authoring. Use the references beside each
pipeline for JSON fields and layout selection.

## Output

Publishable assets belong under:

```text
public/media/gifs/<asset-slug>/pipeline-1/
public/media/gifs/<asset-slug>/pipeline-2/
```

Each non-empty folder contains `storyboard.json`, `manifest.json`, and the GIFs
listed by the manifest. Temporary frames and drafts belong in `.tmp/`.

## Icon Rules

Both pipelines draw wordless monoline glyphs through
`AI/shared/semantic-icons.cjs`. Prefer concrete ASR, TTS, waveform, microphone,
phone, edge-device, chip, GPU, server, router, dataset, model, cloud, lock,
gate, filter, and latency icons. Do not use abstract or mascot-like fallbacks
when a concrete icon fits.
