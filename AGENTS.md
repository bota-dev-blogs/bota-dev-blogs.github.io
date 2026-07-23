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
npm run gif:clean
npm run gif -- 1 --input src/content/blog/<slug>.mdx
npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>
npm run gif -- 3 --input src/content/blog/<slug>.mdx
npm run featured:images
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
- Use `scripts/.env.example` as the template for featured-image generation credentials.
- Use `AI/ai-gif-pipeline-1/.env.example`, `AI/ai-gif-pipeline-2/.env.example`, and `AI/ai-gif-pipeline-3/.env.example` as templates.
- Shell environment variables override `.env` values.

## Content Rules

- Blog posts should remain in the Markdown family, preferably `.mdx`.
- Permanent non-GIF assets should usually be under `public/media/<slug>/`.
- Generated GIF assets should be under `public/media/gifs/<asset-slug>/`, using a filesystem-safe slug with punctuation converted to hyphens.
- Each generated GIF asset folder should contain only the pipeline folders that actually have outputs. Do not add empty `pipeline-1/`, `pipeline-2/`, or `pipeline-3/` folders for symmetry.
- Posts should reference media as `/media/...`, never as filesystem paths.
- Generated GIF artwork must not show internal editorial labels such as "takeaway". Use reader-facing labels such as "key idea", "design rule", "checklist", or a specific concept label instead.
- Generated GIF icons should use the shared semantic vocabulary in `AI/shared/semantic-icons.cjs`, with concrete AI/audio/mobile/edge/computing glyphs preferred over generic idea/agent/schema fallbacks. Keep `FALLBACK_ICON_NAMES` concrete and narrow; do not let fallback selection choose `person`, `bot`, `idea`, `agent`, `schema`, `graph`, or `chat-bubbles`.
- Published Pipeline 1 cards, Pipeline 2 nodes, and Pipeline 3 nodes must define an explicit canonical `icon` or `visual`. Valid explicit choices are authoritative; semantic inference is only for missing or unknown values during draft generation. `npm run gif:check` enforces this contract.
- Every post should have SEO frontmatter: `title`, `slug`, `description`, `authors`, `date`, `modifiedDate`, `keywords`, and `cover` metadata.
- Paper posts should use `contentType: "paper"`, visible `tags`, and a `paper:` attribution block.
- Survey-style posts from reports, notes, or multiple Markdown sources should use `contentType: "research-digest"`, visible research/topic tags, inline links for difficult concepts, and a references section with official sources or representative papers. Treat `research-digest` as metadata, not a title formula; vary public titles with reader-facing phrases such as "explained", "field guide", "visual guide", "practical map", "frontier review", or a direct question.
- Dense research digests should use multiple visual aids when helpful. Pipeline 3 is appropriate for article summaries, research maps, operating-point diagrams, comparison maps, and practical checklists.
- Paper posts and most editorial posts should avoid explicit site-brand mentions in the article body.
