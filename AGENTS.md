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
npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json
npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json
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
- GIF pipelines do not read `.env`; only `scripts/.env` is used by the separate featured-image generator.

## Content Rules

- Blog posts should remain in the Markdown family, preferably `.mdx`.
- Permanent non-GIF assets should usually be under `public/media/<slug>/`.
- Generated GIF assets should be under `public/media/gifs/<asset-slug>/`, using a filesystem-safe slug with punctuation converted to hyphens.
- Each generated GIF asset folder should contain only the pipeline folders that actually have outputs. Do not add empty `pipeline-1/` or `pipeline-2/` folders for symmetry.
- Posts should reference media as `/media/...`, never as filesystem paths.
- Generated GIF artwork must not show internal editorial labels such as "takeaway". Use reader-facing labels such as "key idea", "design rule", "checklist", or a specific concept label instead.
- Generated GIF icons should use the shared semantic vocabulary in `AI/shared/semantic-icons.cjs`, with concrete AI/audio/mobile/edge/computing glyphs preferred over generic idea/agent/schema fallbacks. Keep `FALLBACK_ICON_NAMES` concrete and narrow; do not let fallback selection choose `person`, `bot`, `idea`, `agent`, `schema`, `graph`, or `chat-bubbles`.
- Every retained Pipeline 1 card and Pipeline 2 node must define an explicit canonical `icon` or `visual`, whether or not MDX selects its GIF. `npm run gif:check` enforces this contract.
- For a normal article, generate exactly one best-fit Pipeline 1 candidate and 2-3 complementary Pipeline 2 candidates. Do not generate one GIF per section. Larger storyboards are reserved for canary testing, renderer development, or an explicit user request.
- Treat generated GIFs as a candidate set. The article may reference only the user-approved subset, including just one Pipeline 2 GIF or no GIF from one pipeline. Keep unselected candidates when they remain listed in `storyboard.json` and `manifest.json`; do not force every generated output into MDX or delete rejected candidates unless requested.
- When asked to modify an existing GIF, use its current text intermediates as the starting point. Edit only the relevant `storyboard.json` page, cards, nodes, edges, icons, or layout fields, then rerun the deterministic pipeline renderer. Do not re-read the article to recreate the storyboard from scratch, invoke another LLM, or directly edit the GIF binary unless the user explicitly asks for a new concept.
- Treat `storyboard.json` as the editable source of truth and `manifest.json` as renderer-generated output. Normally do not hand-edit the manifest; let the pipeline JavaScript rebuild it after rendering. Preserve stable `section` and `fileSlug` values unless an output rename is intentional.
- Use `--page <n>` when only one page changed. It must preserve the complete storyboard, untouched GIFs, and existing manifest entries for files still present. Run a full storyboard render only when shared renderer code, global visual grammar, page ordering, or multiple pages changed.
- During every GIF task, assess whether the current layout, icon, motion, spacing, or text-fitting vocabulary expresses the source well. When it does not, improve the reusable pipeline code and its documentation proactively instead of applying an article-specific workaround. Add layouts or canonical icons when they fill a recurring semantic gap, not merely for novelty.
- A reusable layout change must update the renderer registry, geometry, motion grammar, relevant `SKILL.md` and reference contracts, and a targeted canary storyboard. A reusable icon change must update `AI/shared/semantic-icons.cjs` so both pipelines share its drawing, aliases, color semantics, and animation. Run `npm run gif:check`, `npm run gif:doctor`, and the production build after such changes.
- Treat user feedback that a GIF is good or bad as both curation and pipeline evidence. Preserve accepted outputs, regenerate only affected candidates, update MDX to the selected subset, and generalize recurring feedback into renderer or icon improvements when appropriate.
- Every post should have SEO frontmatter: `title`, `slug`, `description`, `authors`, `date`, `modifiedDate`, `keywords`, and `cover` metadata.
- Paper posts should use `contentType: "paper"`, visible `tags`, and a `paper:` attribution block.
- Survey-style posts from reports, notes, or multiple Markdown sources should use `contentType: "research-digest"`, visible research/topic tags, inline links for difficult concepts, and a references section with official sources or representative papers. Treat `research-digest` as metadata, not a title formula; vary public titles with reader-facing phrases such as "explained", "field guide", "visual guide", "practical map", "frontier review", or a direct question.
- Dense research digests should generate 2-3 carefully selected Pipeline 2 candidates when helpful, then embed only the strongest approved subset. Pipeline 2 is appropriate for article summaries, research maps, operating-point diagrams, comparison maps, and practical checklists.
- Paper posts and most editorial posts should avoid explicit site-brand mentions in the article body.
