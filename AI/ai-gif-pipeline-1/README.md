# Pipeline 1: Compact Explainer GIFs

Pipeline 1 deterministically renders agent-authored storyboards as compact,
arrow-free tile-board GIFs. It does not call an LLM API and has no `.env`.
For a normal blog article, select 3-4 strong visual ideas, author 3-4 pages with
different best-fit layouts, and generate 3-4 Pipeline 1 candidate GIFs. An
uncurated first draft may use all candidates; a later human selection is the
authoritative retained set.

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

The renderer writes `manifest.json`, `storyboard.json`, and the numbered candidate GIFs.
Each page may pin its public filename with a safe `.gif` basename in
`outputFile`; the renderer persists a default when absent.
It removes stale GIFs from the selected output directory after a successful
full render. Use `--page <n>` for selective revisions to one retained candidate
page. After the human selects a strict subset, remove all other storyboard pages
and run a full render so rejected files and manifest entries are removed.

Read `SKILL.md` for the authoring workflow and `references/` for the complete
storyboard and layout contracts. Shared wordless icons live in
`../shared/semantic-icons.cjs`.
