# Pipeline 2: Paper To Diagram GIF

This folder contains the implementation for the paper/method diagram GIF generator.

For normal blog work, run it from the repository root:

```bash
npm run gif -- 2 --input .tmp/papers/paper.pdf --slug my-post
```

First-time setup from the repository root:

```bash
npm run gif:setup:2
```

Standalone setup inside this folder:

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

The renderer also needs `ffmpeg` on your shell path.

Fill in `.env`, then run standalone commands only when needed:

```bash
npm run generate -- --input paper.pdf
npm run generate -- --input note.md --out output/my-diagram
npm run generate -- --input diagram.json
```

Use an existing diagram JSON:

```bash
npm run gif -- 2 --input AI/ai-gif-pipeline-2/diagram.json --slug my-post
```

Default output:

```text
public/media/gifs/<asset-slug>/pipeline-2/
```

Standalone output defaults to:

```text
output/<input-name>/diagram.gif
```

## What It Produces

- `diagram.json`: LLM or hand-authored diagram structure
- `diagram.html`: browser preview
- `diagram.gif`: blog-ready animated GIF
- `manifest.json`: source and output file list

Intermediate PNG frames are written under `.tmp/gif-frames/` by the root wrapper, not under `public/`.

## Environment

The root wrapper reads this folder's `.env` and passes values into the generator. See `AI/README.md` for provider variables.

Prefer the root `npm run gif` command for blog work. Use standalone mode only when this folder is copied, tested, or maintained by itself.
