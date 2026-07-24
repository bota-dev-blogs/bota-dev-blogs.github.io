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

Candidate contract: a normal blog storyboard contains exactly one page and
therefore produces exactly one Pipeline 1 candidate GIF. The article may omit
that candidate after curation. Multiple pages are allowed only for renderer
canaries, layout development, or an explicit user request.

Allowed `composition` values: `flow`, `comparison`, `checklist`, `system-map`,
`failure-map`, `evidence-map`, `compact-grid`, `spotlight`. Composition is
semantic metadata and helps choose defaults; explicit `layout` controls the
actual renderer.

Allowed `introStyle`: `guide`, `badge`, `ribbon`, `split`, `quiet`.

Allowed `titleTreatment`: `underline`, `corner-tag`, `side-note`, `none`.

Allowed layouts are documented in `layout-catalog.md`. Use only icon names
declared by `AI/shared/semantic-icons.cjs`.
