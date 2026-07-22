# GIF Workflow

`AI/` is a local asset-generation toolbox for this blog repo. It is not part of the runtime website. The deployable blog is the Astro output plus files under `public/`.

Generated GIFs should land in:

```text
public/media/gifs/<asset-slug>/pipeline-1/
public/media/gifs/<asset-slug>/pipeline-2/
public/media/gifs/<asset-slug>/pipeline-3/
```

Those files are served by Astro at:

```text
/media/gifs/<asset-slug>/pipeline-1/...
/media/gifs/<asset-slug>/pipeline-2/...
/media/gifs/<asset-slug>/pipeline-3/...
```

The asset slug is a filesystem-safe version of the post slug. For example, the post slug `how-otter.ai-handles-in-person-meetings` uses `how-otter-ai-handles-in-person-meetings`.

## Pick A Pipeline

Use pipeline 1 for section-level article explainers. It reads a blog draft or Markdown note, asks the LLM for a plan/storyboard, then renders square animated compact tile-board GIFs with aligned pastel rectangles, semantic icon tiles, varied card compositions, and subtle block zoom motion. Pipeline 1 should not depend on arrows, scattered node maps, or guide-character scenes.

Use pipeline 2 for paper-to-technical-diagram GIFs. It reads a paper, Markdown note, or diagram JSON, asks the LLM for a compact method diagram, then renders one animated architecture/method GIF.

Pipeline 1 and pipeline 2 should both use the canvas deliberately: avoid large accidental blank quadrants, keep intro-to-content gaps tight, and let pipeline 2 cap very wide method flows before they become mostly horizontal padding.

Use pipeline 3 for article-wide animated graphical abstracts, research maps, comparison maps, and practical checklists. It defaults to one concise GIF; use `--series` only when a multi-page visual digest is useful.

For audio AI paper blogs, the default flow is:

```text
Paper PDF -> pipeline 2 -> one method GIF -> MDX blog media
Blog draft -> pipeline 1 -> optional explainer GIF sequence
Blog draft -> pipeline 3 -> optional article-wide summary or research map
```

All pipelines write a `manifest.json` so output folders are easy to inspect or copy.

Visible GIF text should read like finished publication copy. Do not let any pipeline render internal editorial labels such as "takeaway"; use "key idea", "design rule", "checklist", "summary", or the concrete concept name instead.

A post does not need every pipeline folder. If only pipeline 2 has been generated, the asset folder should contain only `pipeline-2/`; if only pipeline 1 has been generated, it should contain only `pipeline-1/`. Do not add empty pipeline folders just for symmetry.

## Root Commands

Use one root command. The first argument selects the pipeline:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug my-post
npm run gif -- 3 --input src/content/blog/my-post.mdx
npm run gif:check
npm run gif:clean -- --dry-run
```

Useful options:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx --local
npm run gif -- 1 --input src/content/blog/my-post.mdx --plan-only
npm run gif -- 1 --input src/content/blog/my-post.mdx --no-render
npm run gif -- 2 --input AI/ai-gif-pipeline-2/diagram.json --slug my-post
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug my-post --keep-frames
npm run gif -- 3 --input src/content/blog/my-post.mdx --series
npm run gif -- 3 --input public/media/gifs/my-post/pipeline-3/storyboard.json --slug my-post --local --page 1
```

`--local` is supported by pipeline 1 and pipeline 3. It skips the LLM and renders a quick heuristic storyboard or an existing storyboard JSON.

`--no-render` keeps intermediate JSON/HTML without making the final GIF.

When `--plan-only` or `--no-render` is used without `--out`, root commands write to `.tmp/gif-drafts/<asset-slug>/pipeline-<n>/` instead of `public/media/gifs/`.

Pipeline 2 temporary PNG frames are cleaned after successful root renders. Use `--keep-frames` only when debugging renderer output.

Use `npm run gif:clean` to remove root pipeline-2 frame scratch data. Use `npm run gif:clean -- --all` to also remove `.tmp` draft, smoke, visual-audit, and verification folders.

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

This installs pipeline 1, pipeline 2, pipeline 3, and Playwright Chromium for pipeline 2.

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

Pipeline 3:

```bash
cd AI/ai-gif-pipeline-3
npm run generate -- --input article.mdx
npm run series -- --input article.mdx
npm run local -- --input storyboard.json --page 1
```

Standalone outputs stay inside that pipeline's `output/` folder. Move only final assets you want to publish into `public/media/gifs/<asset-slug>/`.

## Environment

The root wrapper loads `.env` from the selected pipeline folder and passes it to that pipeline without printing secret values.

Create a local `.env` from the safe template:

```bash
cp AI/ai-gif-pipeline-1/.env.example AI/ai-gif-pipeline-1/.env
cp AI/ai-gif-pipeline-2/.env.example AI/ai-gif-pipeline-2/.env
cp AI/ai-gif-pipeline-3/.env.example AI/ai-gif-pipeline-3/.env
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
DEEPSEEK_MODEL=deepseek-v4-pro
LLM_MODEL=deepseek-v4-pro
```

Shell environment variables override values from `.env`.

For standalone details, see `AI/README.md`.

## Use GIFs In MDX

Frontmatter media panel:

```yaml
media:
  - title: "Affect-aware ASR stack"
    src: "/media/gifs/emotion-aware-asr-research-digest/pipeline-2/01-affect-aware-asr-stack.gif"
    type: "image"
    note: "Animated stack overview"
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
01-*.gif           blog-ready method GIF named from the diagram title
manifest.json      source and publishable file list
```

With `--plan-only` or `--no-render`, `manifest.json` still exists and records which final files have not been rendered yet. Root commands put these intermediate-only outputs under `.tmp/gif-drafts/` unless an explicit `--out` is provided.

Inline MDX:

```mdx
![Affect-aware ASR stack](/media/gifs/emotion-aware-asr-research-digest/pipeline-2/01-affect-aware-asr-stack.gif)
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
