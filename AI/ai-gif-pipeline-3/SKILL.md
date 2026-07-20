---
name: article-to-visual-story
description: Convert long-form articles, technical explanations, reports, and Markdown drafts into concise animated visual-story storyboards for this project. Use when planning or reviewing article-to-GIF output, choosing semantic layouts, generating storyboard v2 JSON, preventing text overflow, replacing generic template copy, or checking whether nodes, arrows, metaphors, and animation communicate the source argument faithfully.
---

# Article to Visual Story

Turn an article into a semantic visual narrative rather than a collection of summary cards. Preserve the source's argument while giving every page a visible relationship and reading path.

Default to `single-canvas synthesis`: one graphical abstract for the complete article. Use multi-page `series` mode only when the user explicitly wants section-by-section teaching detail or when one page cannot preserve the central argument legibly.

## Workflow

1. Read the complete source before composing pages.
2. Extract the thesis, audience, causal chain, sequence, contrasts, alternatives, temporal changes, and repeated concepts.
3. Merge repetition and divide dense claims by meaning, not paragraph boundaries.
4. Decide whether the deliverable is the default single-canvas synthesis or an explicitly requested series.
5. Select one semantic layout per page using `references/visual-grammar.md`.
6. Write storyboard v2 JSON using `references/storyboard-v2.md`.
7. Validate every page against the content budget and graph rules below.
8. Render with `node comic_pipeline.js <storyboard.json> <output-dir>` and inspect the generated GIFs.
9. Revise the storyboard when layout or copy is weak; do not patch important meaning into decorative renderer text.

## Composition rules

- Treat explanatory typography as a page-level system. All node captions share the largest size that fits every node; shorten the longest caption before allowing it to reduce the whole page.
- Give every page one claim, transformation, comparison, decision, or loop.
- For a single-canvas synthesis, reduce the article to one thesis, one main path, and at most one meaningful detour or contrast. Use 4–6 compound nodes and fold tools or implementation details into captions.
- Choose 2–6 nodes from the actual relationship: 2 for direct contrast, 3 for a simple chain, 4–5 for a genuine multi-stage process, and 6 only when all nodes are essential. Treat 6 as a ceiling, not a target.
- Split at a semantic boundary when more than 6 essential ideas belong together. Never force every page to use the same count.
- Make `headline` specific to the current article and page. Never use generic filler such as “AI turns ideas into a visual story.”
- Use the recurring metaphor to guide object and relationship choices; do not print it as decorative footer copy.
- Treat people as semantic nodes, never permanent mascots. Use a person only when the source contains a real human actor, user, customer, reader, or operator.
- Choose a distinct visual and shape for each node. Prefer recognizable objects over generic cards.
- Keep node labels at most 28 characters.
- Keep Chinese captions near 18–45 characters and English captions near 8–22 words. Put only one idea in each caption.
- Split a node or page before shrinking copy into unreadable text.
- Do not use ellipses to conceal missing content.
- Prefer an explicit example node when the source uses an example to make an abstract claim understandable.
- Vary layouts when the source relationship changes, but do not vary them merely for decoration.
- Avoid single-row compression: use a staged two-row flow when four or more substantial sequential nodes would create tiny arrows and large unused areas.

## Validation checklist

- Confirm all important claims trace back to the source.
- Confirm a single-canvas result summarizes the whole article rather than merely illustrating its opening section.
- Confirm the page can be understood by following nodes and arrows without reading the source.
- Confirm each edge label explains a transition rather than repeating a node label.
- Confirm essential edge labels are genuinely required; allow the renderer to omit optional labels when the layout has no safe annotation space.
- Confirm every referenced edge endpoint exists and all node IDs are unique.
- Confirm edges in the same continuous process share an `edgeGroup`, and use curved paths only where they clarify a turn, branch, or jump.
- Confirm no node repeats the page title or headline.
- Confirm removing every person would not harm a page that has no human role; if it would not, remove the person.
- Confirm captions fit their budgets without trailing ellipses.
- Confirm the shared caption size is visually comfortable and group labels remain inside their group boundaries.
- Confirm the first GIF frame already communicates the complete structure; animation should guide attention, not hide required content.

## References

- Read `references/visual-grammar.md` when selecting or evaluating a layout.
- Read `references/storyboard-v2.md` when generating, editing, or validating storyboard JSON.
