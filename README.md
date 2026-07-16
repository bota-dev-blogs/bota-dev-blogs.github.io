# Bota Dev Blogs

Static Astro site for `https://bota-dev-blogs.github.io`.

The deployable site is intentionally small: MDX blog posts plus static media in `public/`. The `AI/` folder is a local generator workspace for making GIF assets before publishing.

Use these paths only:

```text
src/content/blog/     blog MDX files
public/media/<slug>/  publishable audio, video, images, PDFs, transcripts
public/media/gifs/    generated blog GIFs
.exports/             temporary bota.dev handoff bundles
AI/                   local-only GIF generation
```

Do not create top-level `blogs/`, `media/`, or `assets/` folders; those are ignored to prevent accidental website-mirror clutter.

## Documentation Map

- `README.md`: common authoring commands and repo layout.
- `INSTALL.md`: setup, local development, GitHub Pages deployment.
- `BOTA_DEPLOYMENT.md`: clean copy/paste handoff to `https://bota.dev/blogs/`.
- `GIF_WORKFLOW.md`: integrated GIF generation workflow.
- `AI/README.md`: standalone GIF generator usage.

## Write a Blog

Add posts in `src/content/blog/` as `.mdx` files. The filename can be the URL slug, or you can set `slug` in frontmatter.

```mdx
---
title: "Post title"
slug: "post-title"
description: "Short summary for the page and meta tags."
authors: ["Bota"]
date: "2026-06-09"
modifiedDate: "2026-06-09"
readTime: "6 min read"
keywords:
  - "meeting intelligence"
  - "voice capture"
  - "Bota"
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

Put audio, video, image, transcript, and PDF files in `public/media/<post-slug>/`. They become available at `/media/<post-slug>/<filename>`.

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
```

Use the root wrapper instead of entering the AI pipeline folders directly:

```bash
npm run gif -- 1 --input src/content/blog/my-post.mdx
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug my-post
```

Generated assets go to `public/media/gifs/<post-slug>/` and can be referenced from MDX with `/media/gifs/...`.

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

Keep each post's `description`, `keywords`, `modifiedDate`, and cover image metadata current.

Canonical URLs default to `https://bota-dev-blogs.github.io`. For a production copy under `https://bota.dev/blogs/`, build with:

```bash
SITE_URL=https://bota.dev npm run build
```

## Develop

```bash
npm install
npm run dev
```

## Deploy

The `.github/workflows/deploy.yml` workflow builds the Astro site and deploys the generated `dist/` folder to GitHub Pages on pushes to `main`.

For copying a post to `https://bota.dev/blogs/`, the portable pieces are the MDX content and the selected files under `public/media/`. The `AI/` folder is not needed on the publishing side.
