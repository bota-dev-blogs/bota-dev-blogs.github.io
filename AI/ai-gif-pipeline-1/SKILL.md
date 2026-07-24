---
name: compact-explainer-gif
description: Author and render 3-4 compact, arrow-free animated storyboard candidates for a technical blog. Use for strong section explainers, comparisons, checklists, evidence boards, system summaries, or practical concept maps that need distinct semantic layouts, structured motion, and no API-based LLM call.
---

# Compact Explainer GIF

Read the source article yourself, write a pipeline-1 `storyboard.json`, then run
the deterministic renderer. Do not call a model API from this folder.

For normal blog publishing, write 3-4 storyboard pages with meaningfully
different best-fit layouts and generate 3-4 Pipeline 1 candidate GIFs. An
uncurated first draft may use all of them; human selection later replaces that
set and triggers pruning.

## Workflow

1. Read the complete MDX and rank the strongest 3-4 compact visual ideas, each containing 1-4 useful claims.
2. Skip references, SEO copy, publishing metadata, and headings that do not add a visual idea.
3. Give each page one reader-facing point. Choose its visual grammar first, then select a distinct best-fit layout from `references/layout-catalog.md`.
4. Select concrete icons from `../shared/semantic-icons.cjs`; do not invent icon names.
5. Write JSON that follows `references/storyboard-v1.md` to `public/media/gifs/<slug>/pipeline-1/storyboard.json`.
6. Render with `npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json` from the repository root.
7. An initial uncurated draft may reference all candidates. Once the human names a retained subset, reference only those files, remove every other page from the storyboard, and run a full render to delete stale GIFs and rebuild the manifest.
8. Validate using JSON, manifest, command logs, and `npm run gif:check`. Visual inspection is optional and must follow the current user's tool constraints.

## Authoring Rules

- Use Pipeline 1 for compact explanation, not relationship-heavy architecture.
- A normal article gets 3-4 Pipeline 1 pages and candidate GIFs. Use fewer only when the source cannot support three strong ideas without filler; use more than four only for a canary, renderer development, or an explicit request.
- The 3-4 candidates should use distinct layouts that fit distinct ideas. Do not repeat a visual silhouette merely to fill the candidate quota.
- Keep 1-4 cards per page. Prefer 3 only when there are truly three ideas.
- Keep card titles under 34 characters and bodies near 8-22 English words.
- Use actual concept names. Never show editorial labels such as `takeaway`, `TL;DR`, `references`, `summary`, `conclusion`, `section`, or page numbers.
- Prefer concrete audio, hardware, mobile, edge, cloud, model, data, privacy, and workflow icons. Generic `person`, `bot`, `agent`, `idea`, `schema`, `graph`, and `chat-bubbles` are not fallbacks.
- Vary layouts according to meaning across candidates and posts. Do not repeat one composition merely because it rendered successfully before.
- Choose among spatial grammars such as radial, route, signal, console, comparison, checklist, or grid according to the article's strongest visual idea.
- Keep cards and text stable. Let icons, block scale, status markers, scan lines, and moving rails provide continuous motion.
- Use one dominant rhythm per page. A page may have a rail, pulse, scan, or orbit, but not a pile of unrelated decorations.
- Pipeline 1 has no arrows. Use ordering, alignment, rails, bands, grouping, and hierarchy to communicate structure.

## Revising An Existing GIF

- Start from the existing `public/media/gifs/<slug>/pipeline-1/storyboard.json`. It is the editable source of truth; the GIF and manifest are derived outputs.
- Make the smallest semantic text edit needed to its cards, icon, layout, composition, or treatment fields. Do not recreate the storyboard from the article or call another LLM unless the requested concept is genuinely new.
- Preserve `section`, `fileSlug`, and `outputFile` so the public GIF path remains stable unless a rename is intentional. `outputFile` must be a safe basename ending in `.gif`; the renderer adds and persists a numbered default when the field is absent.
- Run the same deterministic renderer after editing. For a maintenance storyboard with multiple pages, use `--page <n>` to replace only the affected GIF while retaining the full storyboard and untouched outputs.
- When a human selects a strict subset, remove unselected pages and run a full render. Do not use `--page` for pruning because only a full render deletes stale binaries and rebuilds the complete manifest.
- Do not directly edit GIF bytes. Do not normally hand-edit `manifest.json`; the renderer rebuilds it from the storyboard and files present.
- If the feedback exposes a reusable renderer or icon problem, improve that shared code first, then rerender only the affected candidates.

## Pipeline Evolution

- Before settling for the closest layout, ask whether its hierarchy, density, motion, and icon vocabulary actually express the article's strongest visual idea.
- If a limitation is reusable, improve the renderer or add a generic layout. Do not hardcode coordinates, labels, or behavior for one article.
- Register every new layout in `comic_pipeline.js`, document it in `references/layout-catalog.md` and `references/motion-grammar.md`, update the storyboard contract when needed, and exercise it with a targeted canary.
- When a concrete concept lacks a good canonical icon, extend `../shared/semantic-icons.cjs` for both pipelines rather than substituting a vague fallback. Include semantic aliases, color behavior, and meaningful motion.
- Use human acceptance or rejection as evidence. Preserve accepted GIFs, regenerate only affected candidates, and generalize recurring criticism into the shared renderer when appropriate.

## References

- `references/storyboard-v1.md`: JSON fields and constraints.
- `references/layout-catalog.md`: layout selection and card-count guidance.
- `references/motion-grammar.md`: layout-specific motion and density rules.
