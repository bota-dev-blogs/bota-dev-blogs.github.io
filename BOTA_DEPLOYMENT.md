# Bota.dev Blog Deployment Guide

This repo has two separate responsibilities:

- Public blog source: `.mdx` posts in `src/content/blog/` and media in `public/media/`.
- Local asset generation: `AI/`, `.tmp/`, and generator dependencies.

Only the public blog source should move to `https://bota.dev/blogs/`. The AI folder is a local production tool, not part of the deployed blog.

## Source Layout

Use this layout consistently:

```text
src/content/blog/<slug>.mdx
public/media/<slug>/<asset>
public/media/gifs/<slug>/
.exports/bota/<slug>/
.exports/bota-site/
```

Do not use root-level `blogs/`, `media/`, or `assets/` folders. They are ignored because this repo is the source, not a scraped mirror of the production site.

## Recommended Publishing Flow

1. Write or edit a post in `src/content/blog/<slug>.mdx`.
2. Put permanent media under `public/media/<slug>/`.
3. If the post needs generated GIFs, run one of the root GIF commands.
4. Run a local build.
5. Export the post bundle for bota.dev.
6. Copy the exported `files/` contents into the production blog repo or CMS import workspace.

## Generate Assets

For an audio AI paper diagram:

```bash
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug post-slug
```

For an article/comic explainer sequence:

```bash
npm run gif -- 1 --input src/content/blog/post-slug.mdx
```

Generated blog-ready files land under:

```text
public/media/gifs/<post-slug>/
```

That folder is publishable. The pipeline source code in `AI/` is not.

For generator maintenance or copying a generator elsewhere, see `AI/README.md`. The standalone generator outputs stay inside each pipeline's `output/` folder until you intentionally move selected final assets into `public/media/`.

## Export One Post

Use the export command before copying to `bota.dev`:

```bash
npm run export:bota -- post-slug
```

Example:

```bash
npm run export:bota -- emotion2vec-self-supervised-speech-emotion-representation
```

The export bundle is written to:

```text
.exports/bota/<post-slug>/
```

Inside that folder:

```text
COPY_TO_BOTA.md
MANIFEST.json
files/src/content/blog/<post>.mdx
files/public/media/...
```

Copy the contents of `files/` into the production blog codebase or deployment workspace.

## Export Every Post

```bash
npm run export:bota:all
```

This creates one bundle per post under `.exports/bota/`.

## Export The Blog Source Without AI

If you want to move the whole Astro blog source into another deployment workspace, run:

```bash
npm run export:bota:site
```

The bundle is written to:

```text
.exports/bota-site/
```

Copy the contents of `.exports/bota-site/files/` into the destination repo. This bundle includes `src/`, `public/`, `astro.config.mjs`, `package-lock.json`, and a sanitized `package.json` with only `dev`, `build`, and `preview` scripts.

It does not include `AI/` or GIF generator commands.

## What The Export Includes

The export script includes:

- The selected `.mdx` file.
- Media referenced as `/media/...` in frontmatter or body content.
- The generated GIF folder at `public/media/gifs/<post-slug>/`, when it exists.

The export script does not include:

- `AI/`
- `.tmp/`
- `node_modules/`
- `.exports/`
- generated frame folders

## Production Build For Bota.dev

When the production blog is built for `bota.dev`, set:

```bash
SITE_URL=https://bota.dev npm run build
```

That makes canonical URLs, Open Graph URLs, RSS, robots, and sitemap point to:

```text
https://bota.dev/blogs/<post-slug>/
```

## SEO Checklist

Before exporting, check each post has:

- `title`: searchable and specific.
- `slug`: stable URL slug.
- `description`: clear 120-160 character summary.
- `authors`: one or more names.
- `date`: original publish date.
- `modifiedDate`: latest meaningful update date.
- `keywords`: focused topic phrases.
- `cover.src`, `cover.alt`, `cover.width`, `cover.height`: preview image metadata.

For generated diagram GIF covers, use:

```yaml
cover:
  src: "/media/gifs/post-slug/pipeline-2/diagram.gif"
  alt: "Animated method diagram"
  width: 1396
  height: 620
  fit: "contain"
```

## Media Paths

Use absolute public paths in MDX:

```yaml
src: "/media/post-slug/demo.mp3"
```

```mdx
![Method diagram](/media/gifs/post-slug/pipeline-2/diagram.gif)
```

For audio/video captions, prefer WebVTT:

```yaml
media:
  - title: "Demo"
    src: "/media/post-slug/demo.mp4"
    type: "video"
    tracks:
      - src: "/media/post-slug/demo.vtt"
        kind: "subtitles"
        srclang: "en"
        label: "English"
```

Standalone `.srt` and `.vtt` files can also be listed as media panel items. Do not reference files inside `AI/` or `.tmp/` from posts. Move permanent assets into `public/media/` first.

## Final Verification

Before copying to production:

```bash
npm run build
npm run export:bota -- post-slug
```

For a bota.dev-domain verification build:

```bash
SITE_URL=https://bota.dev npm run build
```

Then inspect `.exports/bota/<post-slug>/COPY_TO_BOTA.md` and confirm there are no missing media refs.
