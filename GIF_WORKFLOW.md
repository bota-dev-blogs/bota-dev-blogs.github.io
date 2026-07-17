# GIF Workflow

`AI/` is a local asset-generation toolbox for this blog repo. It is not part of the runtime website. The deployable blog is the Astro output plus files under `public/`.

Generated GIFs should land in:

```text
public/media/gifs/<asset-slug>/pipeline-1/
public/media/gifs/<asset-slug>/pipeline-2/
```

Those files are served by Astro at:

```text
/media/gifs/<asset-slug>/pipeline-1/...
/media/gifs/<asset-slug>/pipeline-2/...
```

The asset slug is a filesystem-safe version of the post slug. For example, the post slug `how-otter.ai-handles-in-person-meetings` uses `how-otter-ai-handles-in-person-meetings`.

## Pick A Pipeline

Use pipeline 1 for article-to-comic explainers. It reads a blog draft or Markdown note, asks the LLM for a plan/storyboard, then renders several square cartoon explainer GIFs.

Use pipeline 2 for paper-to-technical-diagram GIFs. It reads a paper, Markdown note, or diagram JSON, asks the LLM for a compact method diagram, then renders one animated architecture/method GIF.

For audio AI paper blogs, the default flow is:

```text
Paper PDF -> pipeline 2 -> one method GIF -> MDX blog media
Blog draft -> pipeline 1 -> optional explainer GIF sequence
```

Both pipelines write a `manifest.json` so output folders are easy to inspect or copy.

A post does not need both pipeline folders. If only pipeline 2 has been generated, the asset folder should contain only `pipeline-2/`; if only pipeline 1 has been generated, it should contain only `pipeline-1/`. Do not add empty pipeline folders just for symmetry.

## Root Commands

Use one root command. The first argument selects the pipeline:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug my-post
npm run gif:check
```

Useful options:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx --local
npm run gif -- 1 --input src/content/blog/my-post.mdx --plan-only
npm run gif -- 1 --input src/content/blog/my-post.mdx --no-render
npm run gif -- 2 --input AI/ai-gif-pipeline-2/diagram.json --slug my-post
```

`--local` is pipeline 1 only. It skips the LLM and renders a quick heuristic storyboard.

`--no-render` keeps intermediate JSON/HTML without making the final GIF.

## First-Time Setup

Install the blog dependencies from the repo root:

```bash
npm install
```

Install both GIF generators from the repo root:

```bash
npm run gif:setup
npm run gif:doctor
```

This installs pipeline 1, pipeline 2, and Playwright Chromium for pipeline 2.

Pipeline 2 also needs `ffmpeg` available on your shell path.

## Standalone Mode

Integrated mode is preferred for blog work because it writes directly to `public/media/gifs/<asset-slug>/`.

Standalone mode is available when a pipeline needs to be copied or tested by itself.

Pipeline 1:

```bash
cd AI/ai-gif-pipeline-1
npm run generate -- --input article.md
npm run local -- --input article.md
```

Pipeline 2:

```bash
cd AI/ai-gif-pipeline-2
npm run generate -- --input paper.pdf
npm run generate -- --input diagram.json
```

Standalone outputs stay inside that pipeline's `output/` folder. Move only final assets you want to publish into `public/media/gifs/<asset-slug>/`.

## Environment

The root wrapper loads `.env` from the selected pipeline folder and passes it to that pipeline without printing secret values.

Create a local `.env` from the safe template:

```bash
cp AI/ai-gif-pipeline-1/.env.example AI/ai-gif-pipeline-1/.env
cp AI/ai-gif-pipeline-2/.env.example AI/ai-gif-pipeline-2/.env
```

For ccswitch/OpenAI-compatible routing:

```text
LLM_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_URL=https://YOUR-OPENAI-PROVIDER
OPENAI_MODEL=gpt-5.5
```

For DeepSeek:

```text
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=...
DEEPSEEK_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-pro
```

Shell environment variables override values from `.env`.

For standalone details, see `AI/README.md`.

## Use GIFs In MDX

Frontmatter media panel:

```yaml
media:
  - title: "emotion2vec method diagram"
    src: "/media/gifs/emotion2vec-self-supervised-speech-emotion-representation/pipeline-2/diagram.gif"
    type: "image"
    note: "Animated method overview"
```

## Output Contents

Pipeline 1 output:

```text
plan.json          optional LLM plan for full-article runs
storyboard.json    structured comic pages
manifest.json      source and publishable GIF list
01-*.gif           blog-ready comic/explainer GIFs
```

Pipeline 2 output:

```text
diagram.json       structured method diagram
diagram.html       browser preview
diagram.gif        blog-ready method GIF
manifest.json      source and publishable file list
```

With `--plan-only` or `--no-render`, `manifest.json` still exists and records which final files have not been rendered yet.

Inline MDX:

```mdx
![emotion2vec method diagram](/media/gifs/emotion2vec-self-supervised-speech-emotion-representation/pipeline-2/diagram.gif)
```

## Deployable Output

For GitHub Pages, commit the MDX post and selected files under `public/media/`.

For copying content to `https://bota.dev/blogs/`, the portable pieces are:

```text
src/content/blog/<post>.mdx
public/media/gifs/<asset-slug>/
public/media/<post-slug>/<other-assets>
```

Do not copy `AI/`, `.tmp/`, `node_modules/`, or generated frame folders. The AI folder is only for producing assets before publishing.

The easiest way to create a clean handoff bundle is:

```bash
npm run export:bota -- <post-slug>
```

Copy only `.exports/bota/<post-slug>/files/` into the production blog workspace.

When building the copied site for `bota.dev`, set `SITE_URL=https://bota.dev` so canonical URLs, RSS, robots, and sitemap point at the production domain.
