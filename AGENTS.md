# Agent Notes

This repository is an Astro static blog plus local-only AI asset generators.

## Boundaries

- Public website source lives in `src/content/blog/`, `src/`, and `public/media/`.
- `AI/` is only for generating GIF assets before publishing.
- Do not copy `AI/`, `.tmp/`, `.exports/`, `node_modules/`, pipeline `output/`, or frame directories into a production `bota.dev` deployment.
- Do not create root-level `blogs/`, `media/`, or `assets/` folders. Use `src/content/blog/` and `public/media/`.

## Main Commands

Use root commands:

```bash
npm run dev
npm run build
npm run gif:doctor
npm run gif:check
npm run gif -- 1 --input src/content/blog/<slug>.mdx
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
npm run export:bota -- <slug>
npm run export:bota:site
```

Use direct commands inside `AI/ai-gif-pipeline-*` only for standalone maintenance or debugging.

## Bota.dev Handoff

To package one post for `https://bota.dev/blogs/`:

```bash
npm run export:bota -- <slug>
```

Copy only:

```text
.exports/bota/<slug>/files/
```

To package the whole Astro blog source without `AI/`:

```bash
npm run export:bota:site
```

Copy only:

```text
.exports/bota-site/files/
```

For production-domain SEO output:

```bash
SITE_URL=https://bota.dev npm run build
```

## Secrets

- Do not print or commit `.env` values.
- Use `AI/ai-gif-pipeline-1/.env.example` and `AI/ai-gif-pipeline-2/.env.example` as templates.
- Shell environment variables override `.env` values.

## Content Rules

- Blog posts should remain in the Markdown family, preferably `.mdx`.
- Permanent non-GIF assets should usually be under `public/media/<slug>/`.
- Generated GIF assets should be under `public/media/gifs/<asset-slug>/`, using a filesystem-safe slug with punctuation converted to hyphens.
- Each generated GIF asset folder should contain only the pipeline folders that actually have outputs. Do not add empty `pipeline-1/` or `pipeline-2/` folders for symmetry.
- Posts should reference media as `/media/...`, never as filesystem paths.
- Every post should have SEO frontmatter: `title`, `slug`, `description`, `authors`, `date`, `modifiedDate`, `keywords`, and `cover` metadata.
- Paper posts should use `contentType: "paper"`, visible `tags`, and a `paper:` attribution block.
- Paper posts and most editorial posts should avoid explicit site-brand mentions in the article body.
