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

Allowed layouts: `linear-flow`, `staged-flow`, `branching`, `before-after`, `cycle`, `hub-spoke`, `cause-effect`, `timeline`, `semantic-map`.

Allowed node types: `input`, `process`, `decision`, `evidence`, `result`, `context`.

Allowed visuals: `person`, `chat-bubbles`, `agent`, `document`, `database`, `search`, `merge`, `schema`, `graph`, `link`, `clock`, `alert`, `idea`, `gear`, `waveform`, `microphone`, `headphones`, `music`, `globe`, `shield`, `layers`, `mask`.

Allowed shapes: `illustration`, `card`, `pill`.

Allowed formats: `square`, `wide`. Wide format requires `semantic-map` and is useful for a single-canvas graphical abstract with one main path and a parallel lane or detour.

Constraints:

- The default single-canvas mode uses exactly one page; pass `--series` to the LLM generator only when section-level detail is desired.
- Use 2-6 nodes and at most 12 edges per page. Six is a hard ceiling.
- Require `position` on every `semantic-map` node. Use normalized x coordinates from 0.08 to 0.92 and y coordinates from 0.28 to 0.86.
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
