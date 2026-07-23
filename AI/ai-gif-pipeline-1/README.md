# Pipeline 1: Compact Explainer GIFs

Pipeline 1 deterministically renders agent-authored storyboards as compact,
arrow-free tile-board GIFs. It does not call an LLM API and has no `.env`.

For normal blog work, first ask Codex, Claude Code, or OpenCode to follow
`SKILL.md` and write:

```text
public/media/gifs/<slug>/pipeline-1/storyboard.json
```

Then render from the repository root:

```bash
npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json
```

Standalone setup and rendering:

```bash
npm install
npm run render -- --input ../../public/media/gifs/<slug>/pipeline-1/storyboard.json
```

Use `--page <n>` to render one page. The renderer writes `manifest.json`,
`storyboard.json`, and one or more numbered GIFs. It removes stale GIFs from
the selected output directory after a successful render.

Read `SKILL.md` for the authoring workflow and `references/` for the complete
storyboard and layout contracts. Shared wordless icons live in
`../shared/semantic-icons.cjs`.
