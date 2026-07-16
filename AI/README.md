# AI GIF Generators

This folder contains local tools for producing GIF assets for Bota blog posts.

For normal blog work, use the repository root commands. Standalone mode is available when you want to copy one pipeline elsewhere or test it without the Astro blog.

## Choose A Mode

Use integrated mode when writing posts in this repo:

```bash
npm run gif -- 1 --input src/content/blog/<slug>.mdx
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
```

Use standalone mode only when working inside a pipeline folder:

```bash
cd AI/ai-gif-pipeline-1
npm run generate -- --input article.md
```

```bash
cd AI/ai-gif-pipeline-2
npm run generate -- --input paper.pdf
```

## First-Time Setup

From the repository root:

```bash
npm run gif:setup
```

Or install one pipeline:

```bash
npm run gif:setup:1
npm run gif:setup:2
```

Pipeline 2 also needs `ffmpeg` on your shell path.

## Environment

Copy the safe templates and fill in your provider keys:

```bash
cp AI/ai-gif-pipeline-1/.env.example AI/ai-gif-pipeline-1/.env
cp AI/ai-gif-pipeline-2/.env.example AI/ai-gif-pipeline-2/.env
```

Do not commit `.env`.

Check readiness without printing secrets:

```bash
npm run gif:doctor
```

## Pipeline 1: Article To Comic GIFs

Best for article explainers and optional visual sequences after a blog draft exists.

Integrated:

```bash
npm run gif -- 1 --input src/content/blog/<slug>.mdx
```

Standalone:

```bash
cd AI/ai-gif-pipeline-1
npm run generate -- --input article.md
npm run local -- --input article.md
npm run plan -- --input article.md
npm run storyboard -- --input article.md
```

Standalone output defaults to:

```text
AI/ai-gif-pipeline-1/output/<input-name>/
```

## Pipeline 2: Paper To Diagram GIFs

Best for audio AI papers, architecture diagrams, and method-overview animations.

Integrated:

```bash
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
```

Standalone:

```bash
cd AI/ai-gif-pipeline-2
npm run generate -- --input paper.pdf
npm run generate -- --input diagram.json
npm run generate -- --input paper.pdf --no-render
```

Standalone output defaults to:

```text
AI/ai-gif-pipeline-2/output/<input-name>/
```

## Publishable Output

For the blog, publish only selected assets under:

```text
public/media/gifs/<post-slug>/
```

Do not publish:

```text
AI/
.tmp/
node_modules/
output/
frames/
```
