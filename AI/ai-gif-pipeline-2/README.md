# Pipeline 2: Animated Research Maps

Pipeline 2 is the former pipeline 3. It deterministically renders agent-authored
storyboard v2 JSON as graphical abstracts, systems maps, comparisons, research
landscapes, and process diagrams. The removed legacy diagram pipeline is not
part of this repository anymore.

For a normal blog article, select the best 2-3 complementary layouts and
generate 2-3 Pipeline 2 candidate GIFs. The article may reference only the
approved subset. More pages are reserved for canary testing or an explicit
user request; do not generate one diagram per article section.

This pipeline does not call an LLM API and has no `.env`. Ask Codex, Claude
Code, or OpenCode to follow `SKILL.md` and write:

```text
public/media/gifs/<slug>/pipeline-2/storyboard.json
```

Then render from the repository root:

```bash
npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json
```

Standalone setup and rendering:

```bash
npm install
npm run render -- --input ../../public/media/gifs/<slug>/pipeline-2/storyboard.json
```

Use `--page <n>` to render one page. Square and wide outputs are supported for
every fixed layout. Semantic maps use normalized custom positions. The renderer
writes `manifest.json`, `storyboard.json`, and numbered GIFs, then removes stale
GIF files from the output folder.

Read `SKILL.md` and `references/` before authoring. Shared wordless icons live
in `../shared/semantic-icons.cjs`.
