# Blog GIF Asset Skill

Use this folder only to generate visual assets for Bota blog posts. The public blog lives in `src/content/blog/` and `public/media/`.

## Default Commands

From the repo root:

```bash
npm run gif -- 1 --input src/content/blog/<slug>.mdx
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
```

Readiness check:

```bash
npm run gif:doctor
```

## Pipeline Choice

Use pipeline 1 for article-based comic/explainer GIF sequences.

Use pipeline 2 for audio AI paper diagrams and method/architecture GIFs.

## Output Rule

Generated blog assets must go under:

```text
public/media/gifs/<post-slug>/pipeline-1/
public/media/gifs/<post-slug>/pipeline-2/
```

Do not put generated frames under `public/`; temporary frames belong in `.tmp/gif-frames/`.

## Secrets

Do not print or commit `.env` values. The root wrapper reads the selected pipeline's `.env` and passes it to the process.

For ccswitch/OpenAI-compatible providers, use `OPENAI_URL` as the base URL.
