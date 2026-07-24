# Pipeline 1: Compact Explainer GIFs

Pipeline 1 deterministically renders agent-authored storyboards as compact,
arrow-free tile-board GIFs. It does not call an LLM API and has no `.env`.
For a normal blog article, select one best-fit layout, author one page, and
generate one Pipeline 1 candidate GIF. The article may omit it after curation.
Multi-page files are for canary testing only unless the user explicitly
requests otherwise.

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

The renderer writes `manifest.json`, `storyboard.json`, and the numbered GIF.
It removes stale GIFs from the selected output directory after a successful
render. `--page <n>` is intended only for multi-page maintenance storyboards.

Read `SKILL.md` for the authoring workflow and `references/` for the complete
storyboard and layout contracts. Shared wordless icons live in
`../shared/semantic-icons.cjs`.
