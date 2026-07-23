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
      "pageLabel": "1",
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
`layered-stack`, `bridge`, `decision-tree`, and `constellation`.

Allowed node types: `input`, `process`, `decision`, `evidence`, `result`, `context`.

Allowed visuals: `person`, `chat-bubbles`, `agent`, `document`, `database`, `dataset`, `embedding`, `model`, `search`, `merge`, `schema`, `graph`, `link`, `clock`, `latency`, `alert`, `idea`, `gear`, `waveform`, `microphone`, `asr`, `tts`, `headphones`, `music`, `globe`, `shield`, `layers`, `mask`, `phone`, `edge-device`, `server`, `gpu`, `router`, `sensor`, `camera`, `room`, `speaker`, `subtitle`, `sliders`, `network`, `bot`, `cloud`, `chip`, `lock`, `ear`, `video`, `target`, `branch`, `filter`.

Allowed shapes: `illustration`, `card`, `pill`.

Allowed formats: `square`, `wide`. Every layout supports both formats. Wide is
useful for left-to-right systems and parallel tracks; square is useful for
radial, layered, and balanced arguments.

Constraints:

- Prefer one page for a graphical abstract. Add pages only when the central argument cannot remain legible on one canvas.
- Use 2-6 nodes and at most 12 edges per page. Six is a hard ceiling.
- Require `position` on every `semantic-map` node. Use normalized x coordinates from 0.08 to 0.92 and y coordinates from 0.28 to 0.86.
- Treat `semantic-map` positions as relative anchors. The renderer fits those anchors into the available content frame after the title and headline, so do not use coordinates to reserve header space or outer padding.
- Do not use article-utility or internal editorial labels such as "takeaway", "TL;DR", "references", "appendix", "table of contents", "abstract", "introduction", "related work", "conclusion", "summary", "overview", "discussion", "limitations", "future work", "this article", "blog post", "section", "chapter", "figure", "table", "metadata", "read more", or "comments" in any visible text field. This includes `title`, `headline`, node `label`, node `caption`, edge `label`, and group `label`.
- Use IDs matching `^[a-z][a-z0-9-]*$` and keep them unique per page.
- Reference only IDs declared on the same page.
- Keep labels within 28 characters, captions within 90 characters, and edge labels within 18 characters.
- In single-canvas mode, target 6–10 English words or 12–24 Chinese characters per caption and keep group labels under 20 characters when possible. Captions share one page-level font size.
- Use edge relations `flow`, `supervision`, `evidence`, `contrast`, or `constraint`.
- Use optional `edgeGroup` IDs to unify the color, dash rhythm, and weight of one continuous logical path.
- Use optional `pathStyle` (`straight` or `curve`) and `bend` (-0.7 to 0.7) to route structural curves. Positive and negative bends curve to opposite sides.
- Set `labelPriority` to `essential` only when the relationship becomes ambiguous without the label; use `optional` otherwise. The layout bridge may hide a label when no collision-free position exists.
- Use optional edge `via` points to route around nodes, group headings, and other edges. Reject layouts with edge crossings or labels on top of lines.
- Use groups only for meaningful lanes or subsystems; group colors are `teal`, `blue`, `purple`, `orange`, or `green`. Use `labelAlign` to keep a group heading away from routed edges.
