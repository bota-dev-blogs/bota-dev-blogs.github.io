# GIF Workflow

The repository has two local-only, deterministic GIF renderers. Coding agents
author `storyboard.json`; JavaScript validates and renders it. The pipelines do
not call LLM APIs, read provider keys, or use `.env`.

## Output Paths

```text
public/media/gifs/<asset-slug>/pipeline-1/
public/media/gifs/<asset-slug>/pipeline-2/
```

Create only folders that contain real outputs. Every published pipeline folder
contains `storyboard.json`, `manifest.json`, and the GIFs listed in the manifest.

## Choose A Pipeline

Pipeline 1 creates compact, arrow-free tile-board explainers. Use it for section
summaries, comparisons, checklists, evidence boards, failure focus, and practical
concepts. It supports 20 layouts with 1-4 cards per page.

Pipeline 2 is the renamed former pipeline 3. Use it for article-wide graphical
abstracts, systems maps, AI/audio architectures, process diagrams, timelines,
parallel tracks, convergence/divergence, decisions, and research landscapes. It
supports fixed and semantic layouts with 2-6 nodes per page.

The old PDF/diagram/Playwright pipeline was removed.

## Agent Workflow

1. Read the source article or paper completely.
2. Read `AI/ai-gif-pipeline-1/SKILL.md` or `AI/ai-gif-pipeline-2/SKILL.md`.
3. Use the selected pipeline's `references/` to choose a layout and write valid JSON.
4. Save it under the publishable pipeline folder.
5. Render it with the root command.
6. Run the asset checker and site build.

```bash
npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json
npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json
npm run gif:check
npm run build
```

Use `--page <n>` to render one selected page. When the input already lives in a
`pipeline-1/` or `pipeline-2/` folder, output is written back to that folder. For
a storyboard elsewhere, pass `--slug <slug>` or `--out <dir>`.

## Setup And Maintenance

```bash
npm run gif:setup
npm run gif:doctor
npm run gif:clean -- --dry-run
```

Standalone rendering is available for maintenance:

```bash
cd AI/ai-gif-pipeline-1
npm run render -- --input ../../public/media/gifs/<slug>/pipeline-1/storyboard.json
```

```bash
cd AI/ai-gif-pipeline-2
npm run render -- --input ../../public/media/gifs/<slug>/pipeline-2/storyboard.json
```

No FFmpeg, Playwright, Chromium, provider SDK, or API credentials are required.

## Storyboard Rules

- Use English for all public blog artwork.
- Use reader-facing concepts, not editorial labels such as `takeaway`, `TL;DR`, `references`, `summary`, page numbers, or filenames.
- Use explicit canonical icons from `AI/shared/semantic-icons.cjs` for every card or node.
- Prefer concrete wordless audio, model, hardware, mobile, edge, cloud, data, privacy, and workflow icons.
- Keep essential structure present in every frame. Motion guides attention and must not hide required content.
- Match the layout to the relationship. Do not randomize merely to create superficial variety.
- Do not reproduce or closely trace a paper's original figures.

## Use In MDX

```yaml
media:
  - title: "Streaming ASR research map"
    src: "/media/gifs/real-time-asr-2026-streaming-recognition/pipeline-2/01-article-summary.gif"
    type: "image"
    note: "Animated map of latency, accuracy, and endpointing trade-offs."
```

```mdx
![Streaming ASR research map](/media/gifs/real-time-asr-2026-streaming-recognition/pipeline-2/01-article-summary.gif)
```

Do not reference files under `AI/`, `.tmp/`, `node_modules/`, or pipeline
`output/` folders from published MDX.
