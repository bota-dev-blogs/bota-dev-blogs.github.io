---
name: animated-research-map
description: Author and render animated research maps and graphical abstracts for technical articles. Use for AI/audio architectures, evidence convergence, branching decisions, parallel systems, causal maps, timelines, comparisons, feedback loops, and article-wide synthesis requiring typed nodes and meaningful relationships without any API-based LLM call.
---

# Animated Research Map

Read the source yourself, author storyboard v2 JSON, and run the deterministic
renderer. Do not call a model API from this folder.

For normal blog publishing, select the best two or three complementary visual
arguments and generate 2-3 Pipeline 2 candidate GIFs. The article may embed
only the user-approved subset. More pages are for renderer canaries or an
explicit user request, not section-by-section illustration.

## Workflow

1. Read the complete source and extract its thesis, actors, evidence, constraints, transformations, and outcomes.
2. Rank possible visual arguments and keep the best 2-3. Use one page only when the source genuinely has a single useful visual argument.
3. Choose a relationship-first layout from `references/visual-grammar.md` for each selected argument; use distinct, complementary visual families.
4. Select concrete shared icons and decide which nodes need `illustration`, `card`, or `pill` shapes.
5. Write JSON following `references/storyboard-v2.md` to `public/media/gifs/<slug>/pipeline-2/storyboard.json`.
6. Render with `npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json`.
7. Reference only the approved subset from MDX. Keep unselected candidates when they remain in the storyboard and manifest; do not force all outputs into the article.
8. Validate JSON, endpoints, manifests, command logs, and `npm run gif:check`. Visual inspection is optional and must follow the current user's tool constraints.

## Composition Rules

- A normal article gets 2-3 Pipeline 2 pages and candidate GIFs. Do not make one page for every article section or assume every candidate must be embedded.
- Each selected page must add a different kind of understanding, such as an article map, architecture, trade-off, lifecycle, comparison, or operating model.
- Use more than three pages only for a layout canary, renderer development, or an explicit user request.
- Give each page one claim, transformation, comparison, decision, convergence, divergence, or loop.
- Use 2-6 nodes. Four or five is usually enough for an article-wide synthesis.
- Keep labels under 28 characters and English captions near 6-12 words.
- Use one dominant reading path and at most one meaningful detour.
- Make every edge encode a real relationship. Remove decorative edges and redundant labels.
- Treat edge direction as a moving relay pulse plus a compact endpoint. Flow edges may use small triangle arrowheads; other relations can use diamonds, circles, chevrons, or gate bars.
- Use `semantic-map` only when fixed layouts cannot express the structure cleanly.
- Use normalized coordinates for semantic maps. The renderer fits them into the available content frame.
- Prefer concrete AI/audio/hardware/cloud/data/privacy icons. Generic actor or abstraction icons are valid only when that actor or abstraction is the actual subject.
- Never show editorial labels such as `takeaway`, `TL;DR`, `references`, `summary`, `conclusion`, `section`, or page numbers.
- Keep essential structure visible in every frame. Animation guides attention; it does not reveal hidden content.
- Pick one page rhythm: route pulses, lane scanning, funnel gates, timeline ticks, matrix scanning, orbit motion, schema rails, retrieval feedback, scatter/gather, hourglass filtering, or spiral refinement.

## Revising Existing GIFs

- Start from the existing `public/media/gifs/<slug>/pipeline-2/storyboard.json`. It is the editable source of truth; GIFs and `manifest.json` are derived outputs.
- Modify only the affected page's text fields, nodes, edges, icons, endpoint shapes, layout, or routing. Do not regenerate the storyboard from the article or call another LLM unless the user asks for a genuinely new visual argument.
- Preserve page order and `section` values so approved GIF filenames remain stable unless a rename is intentional.
- Use `npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json --page <n>` when one candidate changed. The renderer retains the complete storyboard, untouched GIFs, and manifest entries for files still present.
- Run the full storyboard only when several pages changed or shared renderer behavior affects all candidates.
- Do not directly edit GIF bytes. Do not normally hand-edit `manifest.json`; let the renderer regenerate it after reading the edited storyboard.
- If feedback reveals a reusable layout, motion, spacing, fitting, or icon issue, improve the shared pipeline first and rerender only affected candidates.

## Pipeline Evolution

- During every GIF task, test the article's relationships against the existing layout catalog instead of treating the catalog as fixed.
- If no layout expresses the relationship cleanly, add or refine a generic reusable layout. Do not encode one article's labels, node IDs, or coordinates in renderer logic.
- Register a new layout in `comic_pipeline.js`; implement its positioning, backdrop, edge behavior, and motion rhythm; document its use and ordering contract in `references/visual-grammar.md` and `references/storyboard-v2.md`; then exercise it in a targeted canary storyboard.
- If the best available icon is vague or semantically wrong, improve `../shared/semantic-icons.cjs` so both pipelines receive the canonical drawing, aliases, colors, and animation.
- Treat accepted and rejected GIFs as curation feedback. Preserve accepted outputs, regenerate only affected candidates, and turn repeated concerns about spacing, motion, icons, or topology into reusable pipeline improvements.

## References

- `references/visual-grammar.md`: relationship-to-layout guide.
- `references/storyboard-v2.md`: JSON contract, edge routing, and groups.
