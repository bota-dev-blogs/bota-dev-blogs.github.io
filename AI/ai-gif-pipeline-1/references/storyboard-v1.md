# Storyboard v1 Contract

```json
{
  "version": 1,
  "style": "pastel-handdrawn",
  "title": "Article title",
  "pages": [
    {
      "title": "Short page title",
      "section": "stable-section-slug",
      "fileSlug": "short-output-slug",
      "outputFile": "02-stable-public-name.gif",
      "layout": "bento",
      "composition": "compact-grid",
      "introStyle": "quiet",
      "titleTreatment": "underline",
      "kicker": "One precise reader-facing claim",
      "cards": [
        {
          "title": "Concrete concept",
          "body": "One concise explanation that fits without truncation.",
          "icon": "microphone"
        }
      ]
    }
  ]
}
```

Required per page: `title`, `section`, and 1-4 `cards`. Every card requires
`title`, `body`, and a valid shared `icon`.

`outputFile` is an optional stable public filename. It must be a safe basename
ending in `.gif`. When omitted, the renderer assigns and persists a numbered
default. Keep it when reordering or pruning pages so selected public URLs do not
change.

Candidate contract: a normal blog storyboard contains 3-4 pages using distinct,
best-fit layouts and therefore produces 3-4 Pipeline 1 candidate GIFs. Use
fewer only when the source cannot support three useful visuals without filler;
use more than four only for canaries, layout development, or an explicit user
request. An initial draft may reference all candidates. After the human names a
retained subset, remove unselected pages and run a full render so stale GIFs are
deleted and the manifest contains only selected outputs.

Allowed `composition` values: `flow`, `comparison`, `checklist`, `system-map`,
`failure-map`, `evidence-map`, `compact-grid`, `spotlight`. Composition is
semantic metadata and helps choose defaults; explicit `layout` controls the
actual renderer.

Allowed `introStyle`: `guide`, `badge`, `ribbon`, `split`, `quiet`.

Allowed `titleTreatment`: `underline`, `corner-tag`, `side-note`, `none`.

Allowed layouts are documented in `layout-catalog.md`. Use only icon names
declared by `AI/shared/semantic-icons.cjs`.
