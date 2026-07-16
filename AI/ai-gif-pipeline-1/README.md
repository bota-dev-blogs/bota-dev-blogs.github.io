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

Fill in `.env`, then run:

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
public/media/gifs/<post-slug>/pipeline-1/
```

Standalone output defaults to:

```text
output/<input-name>/
```

## What It Produces

- `plan.json`: LLM article plan
- `storyboard.json`: structured visual pages
- `manifest.json`: generated GIF list
- `01-*.gif`, `02-*.gif`, ...: blog-ready animated GIFs

## Environment

The root wrapper reads this folder's `.env` and passes values into the generator.

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

Prefer the root `npm run gif` command for blog work. Use standalone mode only when this folder is copied or tested by itself.
