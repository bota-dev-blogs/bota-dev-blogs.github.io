# Bota Dev Blogs

Static Astro site for `https://bota-dev-blogs.github.io`.

The deployable site is intentionally small: MDX blog posts plus static media in `public/`. The `AI/` folder is a local generator workspace for making GIF assets before publishing.

Use these paths only:

```text
src/content/blog/     blog MDX files
public/media/<slug>/  publishable audio, video, images, PDFs, transcripts
public/media/gifs/    generated blog GIFs, grouped by filesystem-safe asset slug
.exports/             temporary bota.dev handoff bundles
AI/                   local-only GIF generation
```

Do not create top-level `blogs/`, `media/`, or `assets/` folders; those are ignored to prevent accidental website-mirror clutter.

## Documentation Map

- `README.md`: common authoring commands and repo layout.
- `INSTALL.md`: setup, local development, GitHub Pages deployment.
- `BOTA_DEPLOYMENT.md`: clean copy/paste handoff to `https://bota.dev/blogs/`.
- `GIF_WORKFLOW.md`: integrated GIF generation workflow.
- `AGENT-PAPER-TO-BLOG.md`: paper-to-blog workflow with attribution rules.
- `AI/README.md`: standalone GIF generator usage.

## Everyday Workflow

```bash
npm install
npm run dev
npm run build
```

Write posts in `src/content/blog/`. Put regular media in `public/media/<post-slug>/`. Generate GIFs with the root `npm run gif` wrapper, which writes publishable files under `public/media/gifs/<asset-slug>/`.

## Write A Blog

Add posts in `src/content/blog/` as `.mdx` files. The filename can be the URL slug, or you can set `slug` in frontmatter.

```mdx
---
title: "Post title"
slug: "post-title"
description: "Short summary for the page and meta tags."
authors: ["Editorial Team"]
date: "2026-06-09"
modifiedDate: "2026-06-09"
readTime: "6 min read"
tags:
  - "Product"
keywords:
  - "meeting intelligence"
  - "voice capture"
  - "offline meetings"
cover:
  src: "/media/post-title/cover.jpg"
  alt: "Cover image description"
  width: 1200
  height: 800
media:
  - title: "Meeting audio"
    src: "/media/post-title/meeting-audio.mp3"
    type: "audio"
    tracks:
      - src: "/media/post-title/meeting-audio.vtt"
        kind: "subtitles"
        srclang: "en"
        label: "English"
    note: "Optional note"
  - title: "Demo video"
    src: "/media/post-title/demo.mp4"
    type: "video"
    poster: "/media/post-title/demo-poster.jpg"
---

## Start Writing

Your article content goes here.
```

Put audio, video, image, transcript, and PDF files in `public/media/<post-slug>/`. Reference them from MDX as `/media/<post-slug>/<filename>`.

For scientific paper posts, add `contentType: "paper"`, visible tags such as `Paper` and `Frontier Paper`, and a `paper:` block with the original title, authors, source URL, venue, year, and code link when available. The layout renders that block as a prominent third-party attribution notice.

For survey-style posts built from reports, notes, or multiple Markdown files, use `contentType: "research-digest"`. That content type does not need to appear in the public headline; vary titles around the reader's search intent, for example "Wake Word Detection Is Becoming Intent Gating", "Emotion-Aware ASR Explained", "A Field Guide To Small-Footprint Speech Models", or "How Device-Directed Speech Works". Structure the article around research questions, terminology, method families, frontier directions, limitations, practical implications, and references. Link difficult concepts inline on first use, and prefer official sources, arXiv/DOI pages, or stable concept references.

See [AGENT-PAPER-TO-BLOG.md](AGENT-PAPER-TO-BLOG.md) for the full paper-to-blog process.

For paper posts and most editorial posts, keep the article voice neutral. Avoid explicit brand mentions inside the body copy unless the post is specifically about the product or company.

## Generate Featured Images

Featured images are generated with GPT Image models and written to `public/media/<post-slug>/featured.png`. Put OpenAI credentials in `scripts/.env` using `scripts/.env.example` as the template. Use `OPENAI_IMAGE_MODEL=gpt-image-2` for image generation; `OPENAI_MODEL` is for text LLM planning and should not be set to a text model for cover images.

```bash
npm run featured:images
```

If your text LLM proxy is not also an OpenAI-compatible Image API endpoint, set `OPENAI_IMAGE_URL` or `OPENAI_BASE_URL` to a verified `/v1` endpoint with a valid TLS certificate.

## Generate GIFs

First-time generator setup:

```bash
npm run gif:setup
npm run gif:doctor
```

Create local `.env` files from the templates in each pipeline folder, then fill in your provider keys:

```bash
cp AI/ai-gif-pipeline-1/.env.example AI/ai-gif-pipeline-1/.env
cp AI/ai-gif-pipeline-2/.env.example AI/ai-gif-pipeline-2/.env
cp AI/ai-gif-pipeline-3/.env.example AI/ai-gif-pipeline-3/.env
```

Use the root wrapper for blog work:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx
npm run gif -- 1 --input public/media/gifs/my-post/pipeline-1/storyboard.json --slug my-post --local --page 1
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug my-post
npm run gif -- 3 --input src/content/blog/my-post.mdx
npm run gif -- 3 --input public/media/gifs/my-post/pipeline-3/storyboard.json --slug my-post --local --page 1
npm run gif:check
npm run gif:clean -- --dry-run
```

Generated assets go to `public/media/gifs/<asset-slug>/` and can be referenced from MDX with `/media/gifs/...`. The asset slug is a filesystem-safe version of the post slug, so punctuation becomes hyphens.

Pipeline 1 creates compact, arrow-free tile-board section explainer GIFs from a blog draft, pipeline 2 creates a method or architecture diagram from a paper/PDF/Markdown source, and pipeline 3 creates one article-wide animated graphical abstract by default. Use pipeline 1 or pipeline 3 `--page <n>` when rerendering a selected local storyboard page; stale GIFs not in the latest manifest are cleaned automatically. Pipeline 2 names final GIFs from the diagram title, such as `01-affect-aware-asr-stack.gif`, and temporary PNG frames are cleaned after successful root renders unless you pass `--keep-frames`. Intermediate-only root runs with `--plan-only` or `--no-render` now default to `.tmp/gif-drafts/` instead of publishing half-finished folders. For dense research digests, use pipeline 3 for multiple publishable visuals such as a research map, trade-off diagram, frontier map, or practical checklist.

All three pipelines use the shared semantic icon vocabulary in `AI/shared/semantic-icons.cjs`, with concrete AI/audio/mobile/edge/computing icons preferred over generic idea or agent symbols. The curated fallback list is narrower than the full icon list so weak text does not randomly become a person, bot, idea, schema, graph, or chat bubble.

Generated GIF artwork should use reader-facing labels, not internal editorial labels. In particular, never render the word "takeaway" in a GIF; use "key idea", "design rule", "checklist", "summary", or the actual concept name.

See [GIF_WORKFLOW.md](GIF_WORKFLOW.md) for the full workflow.

The same generators can also run standalone from the `AI/` folder when needed. See [AI/README.md](AI/README.md).

## Export To Bota.dev

Package one post and its publishable media, without the `AI/` generator workspace:

```bash
npm run export:bota -- my-post
```

The bundle appears under `.exports/bota/my-post/`. Copy that bundle's `files/` contents into the production `bota.dev` blog workspace.

To export the whole blog source without the AI generator workspace:

```bash
npm run export:bota:site
```

See [BOTA_DEPLOYMENT.md](BOTA_DEPLOYMENT.md) for the copy/paste deployment flow.

## SEO

The site generates canonical URLs, Open Graph/Twitter card metadata, article JSON-LD, breadcrumbs, RSS, robots, and sitemap output from MDX frontmatter.

Keep each post's `description`, `keywords`, `tags`, `modifiedDate`, and cover image metadata current.

Canonical URLs default to `https://bota-dev-blogs.github.io`. For a production copy under `https://bota.dev/blogs/`, build with:

```bash
SITE_URL=https://bota.dev npm run build
```

## Deploy

The `.github/workflows/deploy.yml` workflow builds the Astro site and deploys the generated `dist/` folder to GitHub Pages on pushes to `main`.

For copying a post to `https://bota.dev/blogs/`, the portable pieces are the MDX content and the selected files under `public/media/`. The `AI/` folder is not needed on the publishing side.

Both `/` and `/blogs/` render the blog index directly. Individual posts live under `/blogs/<slug>/`.
