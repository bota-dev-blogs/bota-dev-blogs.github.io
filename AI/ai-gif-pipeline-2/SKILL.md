---
name: animated-research-map
description: Author and render animated research maps and graphical abstracts for technical articles. Use for AI/audio architectures, evidence convergence, branching decisions, parallel systems, causal maps, timelines, comparisons, feedback loops, and article-wide synthesis requiring typed nodes and meaningful relationships without any API-based LLM call.
---

# Animated Research Map

Read the source yourself, author storyboard v2 JSON, and run the deterministic
renderer. Do not call a model API from this folder.

## Workflow

1. Read the complete source and extract its thesis, actors, evidence, constraints, transformations, and outcomes.
2. Decide whether one graphical abstract is enough. Add pages only when one map cannot remain legible.
3. Choose the relationship-first layout from `references/visual-grammar.md`.
4. Select concrete shared icons and decide which nodes need `illustration`, `card`, or `pill` shapes.
5. Write JSON following `references/storyboard-v2.md` to `public/media/gifs/<slug>/pipeline-2/storyboard.json`.
6. Render with `npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json`.
7. Validate JSON, endpoints, manifests, command logs, and `npm run gif:check`. Visual inspection is optional and must follow the current user's tool constraints.

## Composition Rules

- Give each page one claim, transformation, comparison, decision, convergence, divergence, or loop.
- Use 2-6 nodes. Four or five is usually enough for an article-wide synthesis.
- Keep labels under 28 characters and English captions near 6-12 words.
- Use one dominant reading path and at most one meaningful detour.
- Make every edge encode a real relationship. Remove decorative edges and redundant labels.
- Use `semantic-map` only when fixed layouts cannot express the structure cleanly.
- Use normalized coordinates for semantic maps. The renderer fits them into the available content frame.
- Prefer concrete AI/audio/hardware/cloud/data/privacy icons. Generic actor or abstraction icons are valid only when that actor or abstraction is the actual subject.
- Never show editorial labels such as `takeaway`, `TL;DR`, `references`, `summary`, `conclusion`, `section`, or page numbers.
- Keep essential structure visible in every frame. Animation guides attention; it does not reveal hidden content.

## References

- `references/visual-grammar.md`: relationship-to-layout guide.
- `references/storyboard-v2.md`: JSON contract, edge routing, and groups.
