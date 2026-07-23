# AI GIF Generators

`AI/` contains two local-only deterministic renderers. It is not part of the
deployed Astro site.

## Architecture

```text
Codex / Claude Code / OpenCode
  -> reads article and pipeline SKILL.md
  -> writes storyboard.json
  -> local Canvas renderer
  -> GIF + manifest.json
```

No GIF pipeline calls an LLM API or reads `.env`. The active coding agent is the
reasoning layer; the JavaScript renderer is the reproducible graphics layer.

## Pipelines

`ai-gif-pipeline-1` creates compact, arrow-free, aligned explainer boards. Read
its `SKILL.md` and `references/` for the storyboard v1 contract and 20 layouts.

`ai-gif-pipeline-2` is the renamed former pipeline 3. It creates research maps,
graphical abstracts, systems diagrams, comparisons, and relationship-heavy
visuals. Read its `SKILL.md` and `references/` for storyboard v2 and 19 layouts.

The former PDF-to-diagram pipeline 2 was deleted.

## Root Commands

```bash
npm run gif:setup
npm run gif:doctor
npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json
npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json
npm run gif:check
```

Use `--page <n>` to render one page. The root wrapper infers the output folder
when the input is already under `public/media/gifs/<slug>/pipeline-<n>/`.

Standalone maintenance:

```bash
cd AI/ai-gif-pipeline-1
npm install
npm run render -- --input ../../public/media/gifs/<slug>/pipeline-1/storyboard.json
```

```bash
cd AI/ai-gif-pipeline-2
npm install
npm run render -- --input ../../public/media/gifs/<slug>/pipeline-2/storyboard.json
```

## Shared Icons

Both renderers use `shared/semantic-icons.cjs`. Every published card or node
must name a canonical icon explicitly. Use concrete wordless AI, audio,
hardware, wearable, mobile, edge, cloud, data, privacy, and workflow glyphs.
Fallback icons remain narrow and must not select `person`, `bot`, `idea`,
`agent`, `schema`, `graph`, or `chat-bubbles`.

## Output Contract

Publish selected assets only under:

```text
public/media/gifs/<asset-slug>/pipeline-1/
public/media/gifs/<asset-slug>/pipeline-2/
```

Each folder contains `storyboard.json`, `manifest.json`, and the GIFs listed by
the manifest. Do not publish `AI/`, `.tmp/`, `node_modules/`, or standalone
`output/` directories.
