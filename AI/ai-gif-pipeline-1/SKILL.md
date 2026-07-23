---
name: compact-explainer-gif
description: Author and render compact, arrow-free animated storyboard pages for technical blog explanations. Use for section explainers, comparisons, checklists, evidence boards, system summaries, and practical concept maps that should use aligned rectangular blocks, concrete semantic icons, restrained motion, and no API-based LLM call.
---

# Compact Explainer GIF

Read the source article yourself, write a pipeline-1 `storyboard.json`, then run
the deterministic renderer. Do not call a model API from this folder.

## Workflow

1. Read the complete MDX and identify 1-4 visually useful claims per page.
2. Skip references, SEO copy, publishing metadata, and headings that do not add a visual idea.
3. Give each page one reader-facing point and select a layout from `references/layout-catalog.md`.
4. Select concrete icons from `../shared/semantic-icons.cjs`; do not invent icon names.
5. Write JSON that follows `references/storyboard-v1.md` to `public/media/gifs/<slug>/pipeline-1/storyboard.json`.
6. Render with `npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json` from the repository root.
7. Validate using JSON, manifest, command logs, and `npm run gif:check`. Visual inspection is optional and must follow the current user's tool constraints.

## Authoring Rules

- Use Pipeline 1 for compact explanation, not relationship-heavy architecture.
- Keep 1-4 cards per page. Prefer 3 only when there are truly three ideas.
- Keep card titles under 34 characters and bodies near 8-22 English words.
- Use actual concept names. Never show editorial labels such as `takeaway`, `TL;DR`, `references`, `summary`, `conclusion`, `section`, or page numbers.
- Prefer concrete audio, hardware, mobile, edge, cloud, model, data, privacy, and workflow icons. Generic `person`, `bot`, `agent`, `idea`, `schema`, `graph`, and `chat-bubbles` are not fallbacks.
- Vary layouts according to meaning across a post. Do not repeat one composition merely because it rendered successfully before.
- Keep cards and text stable. Let icons and block scale provide restrained continuous motion.
- Pipeline 1 has no arrows. Use ordering, alignment, rails, bands, grouping, and hierarchy to communicate structure.

## References

- `references/storyboard-v1.md`: JSON fields and constraints.
- `references/layout-catalog.md`: layout selection and card-count guidance.
