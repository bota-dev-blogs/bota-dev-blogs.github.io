# Pipeline 1: Article To Comic GIFs

This folder contains the implementation for the comic-style explainer GIF generator.

For normal blog work, run it from the repository root:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx
```

First-time setup from the repository root:

```bash
npm run gif:setup:1
```

Standalone setup inside this folder:

```bash
npm install
cp .env.example .env
```

Fill in `.env`, then run standalone commands only when needed:

```bash
npm run generate -- --input article.md
npm run local -- --input article.md
npm run plan -- --input article.md
npm run storyboard -- --input article.md
```

Quick local render without LLM:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx --local
```

Default output:

```text
public/media/gifs/<asset-slug>/pipeline-1/
```

Standalone output defaults to:

```text
output/<input-name>/
```

## What It Produces

- `plan.json`: optional LLM article plan
- `storyboard.json`: structured visual pages
- `manifest.json`: source and output file list
- `01-*.gif`, `02-*.gif`, ...: blog-ready animated GIFs

`manifest.json` is written for final renders and for intermediate `--plan-only` / `--no-render` runs.

## Environment

The root wrapper reads this folder's `.env` and passes values into the generator. See `AI/README.md` for provider variables.

Prefer the root `npm run gif` command for blog work. Use standalone mode only when this folder is copied, tested, or maintained by itself.
