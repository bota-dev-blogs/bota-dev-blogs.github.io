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
its `SKILL.md` and `references/` for the storyboard v1 contract and 24 layouts.
Normal blog output is one best-fit Pipeline 1 candidate per article.

`ai-gif-pipeline-2` is the renamed former pipeline 3. It creates research maps,
graphical abstracts, systems diagrams, comparisons, and relationship-heavy
visuals. Read its `SKILL.md` and `references/` for storyboard v2 and 28 layouts.
Normal blog output is the best 2-3 complementary Pipeline 2 candidates per article.
Larger storyboards are reserved for canary testing or explicit requests.

## Continuous Evolution And Curation

The layout and icon catalogs are living infrastructure. During normal GIF work,
the active coding agent should improve a renderer, add a reusable layout, or
extend `shared/semantic-icons.cjs` whenever the existing vocabulary cannot
express the source cleanly. Changes must remain generic, be documented in the
relevant `SKILL.md` and references, and be exercised by a targeted canary.

Generated outputs are candidates, not an obligation to publish every file. MDX
should reference only the user-approved subset. Unselected candidates may stay
in the asset folder as long as `storyboard.json` and `manifest.json` continue to
list them. Preserve accepted GIFs and regenerate only candidates affected by a
pipeline or storyboard change.

Existing assets follow a storyboard-first revision loop: edit the current
structured JSON, preserve stable page identity and filenames, and rerun the
deterministic JavaScript renderer. Use `--page <n>` when one page changed so
untouched candidates remain byte-for-byte in place. `storyboard.json` is the
editable source; GIF files and `manifest.json` are renderer-generated outputs.
Do not rebuild an existing storyboard from the article or another LLM unless a
new visual argument is explicitly required.

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

Store generated candidates only under:

```text
public/media/gifs/<asset-slug>/pipeline-1/
public/media/gifs/<asset-slug>/pipeline-2/
```

Each folder contains `storyboard.json`, `manifest.json`, and the GIFs listed by
the manifest. MDX references are the source of truth for which candidates the
article actually uses. Do not publish `AI/`, `.tmp/`, `node_modules/`, or
standalone `output/` directories.
