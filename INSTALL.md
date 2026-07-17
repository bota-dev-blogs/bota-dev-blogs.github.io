# Install, Run, Deploy

This repo is an Astro static site for `https://bota-dev-blogs.github.io`.

Blog content lives in the Markdown family: use `.mdx` files in `src/content/blog/`. Astro builds those files into static HTML for GitHub Pages.

Permanent non-GIF assets should live under `public/media/<post-slug>/`. Generated GIF assets live under `public/media/gifs/<asset-slug>/`, where the asset slug is filesystem-safe. Do not use root-level `media/`, `assets/`, or `blogs/` folders.

## Requirements

- Node.js `22.12.0` or newer
- npm
- Git

The GitHub Actions workflow already uses Node 22.

## Fresh Clone

```bash
git clone git@github.com:bota-dev-blogs/bota-dev-blogs.github.io.git
cd bota-dev-blogs.github.io
npm ci
```

Use `npm ci` for normal setup because this repo includes `package-lock.json`.

## Local Development

```bash
npm run dev
```

Astro will print a local URL, usually:

```text
http://localhost:4321/
```

The root page and `/blogs/` both render the blog index directly.

## Build Locally

```bash
npm run build
```

The generated static site is written to `dist/`.

Canonical URLs default to `https://bota-dev-blogs.github.io`. If you are building a copy for `https://bota.dev/blogs/`, use:

```bash
SITE_URL=https://bota.dev npm run build
```

To preview the built output:

```bash
npm run preview
```

## Add A Blog Post

Create a new `.mdx` file in `src/content/blog/`.

Example:

```mdx
---
title: "Post title"
slug: "post-title"
description: "Short summary for SEO and the blog index."
authors: ["Author One", "Author Two"]
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

The final URL is:

```text
/blogs/post-title/
```

For paper posts, also include:

```yaml
contentType: "paper"
tags:
  - "Paper"
  - "Frontier Paper"
paper:
  title: "Original paper title"
  url: "https://arxiv.org/abs/..."
  authors:
    - "Original Author"
  venue: "arXiv"
  year: "2023"
  code: "https://github.com/..."
```

The `paper:` block renders a visible attribution notice saying the paper is third-party work. Use `AGENT-PAPER-TO-BLOG.md` when converting a paper into a blog post.

For paper posts and most editorial posts, use a neutral editorial voice. Avoid explicit brand mentions in the article body unless the post is specifically about the product or company.

## SEO Checklist

Every post should include:

- `title`: clear, searchable title
- `slug`: stable URL slug
- `description`: 120-160 character summary for search and social previews
- `authors`: one or more author names
- `date`: original publish date
- `modifiedDate`: latest meaningful content update date
- `keywords`: focused topic phrases, not a long keyword dump
- `tags`: visible post categories such as `Paper`, `Frontier Paper`, `Audio AI`, or `Product`
- `cover.src`, `cover.alt`, `cover.width`, `cover.height`: social preview image metadata

The site automatically generates:

- Canonical URLs
- Open Graph and Twitter card metadata
- `BlogPosting` structured data
- Breadcrumb structured data
- `/sitemap.xml`
- `/robots.txt`
- `/rss.xml`

## Add Media

Put permanent media files in `public/media/<post-slug>/`.

Examples:

```text
public/media/post-title/demo.mp4
public/media/post-title/meeting-audio.mp3
public/media/post-title/meeting-audio.vtt
public/media/post-title/cover.jpg
```

Reference those files from MDX frontmatter as:

```yaml
src: "/media/post-title/demo.mp4"
```

Supported preview types:

- Audio: `mp3`, `wav`, `m4a`, `aac`, `ogg`, `flac`
- Video: `mp4`, `mov`, `webm`, `m4v`
- Images: `jpg`, `jpeg`, `png`, `webp`, `gif`
- Transcripts/subtitles: `srt`, `vtt`
- PDF: `pdf`

The media panel also has an `Add` button for temporary local preview in the browser. That does not upload files or change the repo.

## Generate Blog GIFs

The `AI/` folder contains local-only GIF generators. Install those generator dependencies once:

```bash
npm run gif:setup
npm run gif:doctor
```

That installs both pipelines and downloads Playwright Chromium for pipeline 2. Pipeline 2 also needs `ffmpeg` available on your shell path.

Create local generator environment files from the safe templates:

```bash
cp AI/ai-gif-pipeline-1/.env.example AI/ai-gif-pipeline-1/.env
cp AI/ai-gif-pipeline-2/.env.example AI/ai-gif-pipeline-2/.env
```

Fill in the provider and key you want to use. Do not commit `.env`.

Use the root wrapper for daily work:

```bash
npm run gif -- 1 --input src/content/blog/post-title.mdx
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug post-title
```

Pipeline 1 creates article/comic explainer GIFs. Pipeline 2 creates paper/method diagram GIFs. Outputs under `public/media/gifs/` are publishable; `AI/`, `.tmp/`, `node_modules/`, and frame folders are not part of the public website.

See `GIF_WORKFLOW.md` for setup and environment details.

## Export For Bota.dev

To prepare a clean copy/paste bundle for `https://bota.dev/blogs/`, run:

```bash
npm run export:bota -- post-title
```

The bundle is written to:

```text
.exports/bota/post-title/
```

Copy only the contents of that bundle's `files/` folder into the production blog workspace. The bundle excludes `AI/`, `.tmp/`, `node_modules/`, and generated frames.

To export every post:

```bash
npm run export:bota:all
```

To export the whole blog source without `AI/`:

```bash
npm run export:bota:site
```

See `BOTA_DEPLOYMENT.md` for the full production handoff flow.

## GitHub Pages Deployment

This repo includes:

```text
.github/workflows/deploy.yml
```

That workflow builds the Astro site and deploys `dist/` to GitHub Pages on every push to `main`.

In GitHub:

1. Open the repository settings.
2. Go to **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`.

If a Pages run shows `GitHub Pages: jekyll` in the logs, GitHub is still using the default branch/Jekyll builder instead of this Astro workflow. Switch **Settings -> Pages -> Build and deployment -> Source** to **GitHub Actions**, then rerun the `Deploy to GitHub Pages` workflow.

Because this is the user/organization Pages repo `bota-dev-blogs.github.io`, Astro does not need a `base` path.

## Common Issues

If install fails with a Node version warning, upgrade Node to `22.12.0` or newer.

If Pages does not update, check the latest run under **Actions**. The deploy workflow must complete successfully.

Do not commit `node_modules/` or `dist/`; both are ignored.
