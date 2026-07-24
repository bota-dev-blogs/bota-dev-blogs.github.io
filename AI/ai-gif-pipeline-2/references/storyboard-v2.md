# Storyboard v2 contract

```json
{
  "version": 2,
  "style": "pastel-handdrawn",
  "title": "Series title",
  "visualDirection": {
    "character": "optional art direction",
    "recurringMetaphor": "article-specific metaphor"
  },
  "pages": [
    {
      "title": "Page title",
      "section": "section-slug",
      "format": "wide",
      "layout": "semantic-map",
      "headline": "Page-specific claim",
      "nodes": [
        {
          "id": "source",
          "type": "input",
          "label": "Source",
          "caption": "One concise idea.",
          "visual": "document",
          "shape": "illustration",
          "position": { "x": 0.2, "y": 0.55 }
        },
        {
          "id": "result",
          "type": "result",
          "label": "Result",
          "caption": "The visible outcome.",
          "visual": "graph",
          "shape": "illustration",
          "position": { "x": 0.8, "y": 0.55 }
        }
      ],
      "edges": [
        { "from": "source", "to": "result", "label": "becomes", "labelPriority": "essential", "relation": "flow", "edgeGroup": "main-flow", "pathStyle": "curve", "bend": 0.2 }
      ],
      "groups": [
        { "id": "input-lane", "label": "Input", "nodeIds": ["source"], "color": "teal" }
      ]
    }
  ]
}
```

Allowed layouts: `linear-flow`, `staged-flow`, `branching`, `before-after`,
`cycle`, `hub-spoke`, `cause-effect`, `timeline`, `semantic-map`, `converging`,
`diverging`, `parallel-lanes`, `swimlanes`, `matrix`, `funnel`,
`layered-stack`, `bridge`, `decision-tree`, `constellation`, `relay-board`,
`trust-stack`, `signal-path`, `control-loop`, `schema-rail`, `retrieval-loop`,
`scatter-gather`, `hourglass`, and `spiral`.

Allowed node types: `input`, `process`, `decision`, `evidence`, `result`, `context`.

Allowed visuals are the canonical icon names exported by
`AI/shared/semantic-icons.cjs`. Do not maintain a second icon list here.

Allowed shapes: `illustration`, `card`, `pill`.

Allowed formats: `square`, `wide`. Every layout supports both formats. Wide is
useful for left-to-right systems and parallel tracks; square is useful for
radial, layered, and balanced arguments.

Constraints:

- A normal article storyboard should contain 2-3 candidate pages selected for complementary explanatory value. Do not mirror the article section list.
- MDX may reference any approved subset of those candidates. A generated page does not have to appear in the article, but every retained GIF must remain listed in the storyboard and manifest.
- Use one page only when the source genuinely offers a single useful visual argument. Use more than three only for a renderer canary, layout development, or an explicit user request.
- Use 2-6 nodes and at most 12 edges per page. Six is a hard ceiling.
- Require `position` on every `semantic-map` node. Use normalized x coordinates from 0.08 to 0.92 and y coordinates from 0.28 to 0.86.
- Treat `semantic-map` positions as relative anchors. The renderer fits those anchors into the available content frame after the title and headline, so do not use coordinates to reserve header space or outer padding.
- Do not use article-utility or internal editorial labels such as "takeaway", "TL;DR", "references", "appendix", "table of contents", "abstract", "introduction", "related work", "conclusion", "summary", "overview", "discussion", "limitations", "future work", "this article", "blog post", "section", "chapter", "figure", "table", "metadata", "read more", or "comments" in any visible text field. This includes `title`, `headline`, node `label`, node `caption`, edge `label`, and group `label`.
- Use IDs matching `^[a-z][a-z0-9-]*$` and keep them unique per page.
- Reference only IDs declared on the same page.
- Keep labels within 28 characters, captions within 90 characters, and edge labels within 18 characters.
- In single-canvas mode, target 6–10 English words or 12–24 Chinese characters per caption and keep group labels under 20 characters when possible. Captions share one page-level font size.
- Use edge relations `flow`, `supervision`, `evidence`, `contrast`, or `constraint`.
- Use optional edge `endShape`: `auto`, `arrow`, `chevron`, `diamond`, `circle`, `bar`, or `none`. `auto` maps the relation to a compact endpoint shape.
- Use optional `edgeGroup` IDs to unify the color, dash rhythm, and weight of one continuous logical path.
- Use optional `pathStyle` (`straight` or `curve`) and `bend` (-0.7 to 0.7) to route structural curves. Positive and negative bends curve to opposite sides.
- Set `labelPriority` to `essential` only when the relationship becomes ambiguous without the label; use `optional` otherwise. The layout bridge may hide a label when no collision-free position exists.
- Use optional edge `via` points to route around nodes, group headings, and other edges. Reject layouts with edge crossings or labels on top of lines.
- Use groups only for meaningful lanes or subsystems; group colors are `teal`, `blue`, `purple`, `orange`, or `green`. Use `labelAlign` to keep a group heading away from routed edges.

Layout ordering contracts:

- `schema-rail`: put the 1-2 schema, policy, or contract nodes first; place the process stages after them.
- `retrieval-loop`: put the three main-path nodes first and the memory or retrieval nodes last.
- `scatter-gather`: put the source first, parallel workers in the middle, and the merged result last.
- `hourglass`: put broad inputs first, the bottleneck next, and narrowed outcomes last.
- `spiral`: order nodes from the broad outer state toward the refined inner state.
