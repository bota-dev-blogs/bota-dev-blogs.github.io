import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const pipelines = {
  "1": path.join(rootDir, "AI", "ai-gif-pipeline-1"),
  "2": path.join(rootDir, "AI", "ai-gif-pipeline-2"),
  "3": path.join(rootDir, "AI", "ai-gif-pipeline-3")
};

function usage() {
  console.log(`Usage:
  npm run gif -- 1 --input src/content/blog/post.mdx
  npm run gif -- 1 --input src/content/blog/post.mdx --local
  npm run gif -- 1 --input public/media/gifs/post/pipeline-1/storyboard.json --slug post --local --page 1
  npm run gif -- 2 --input path/to/paper.pdf --slug post-slug
  npm run gif -- 3 --input src/content/blog/post.mdx
  npm run gif -- 3 --input public/media/gifs/post/pipeline-3/storyboard.json --slug post --local --page 1

Options:
  --pipeline 1|2|3   Optional if the first positional arg is 1, 2, or 3.
  --input <path>     Required. MD/MDX/TXT for pipeline 1 or 3; PDF/MD/TXT/JSON for pipeline 2.
  --slug <slug>      Optional. Defaults to MDX frontmatter slug or input filename.
  --out <dir>        Optional. Defaults to public/media/gifs/<asset-slug>/pipeline-<n>.
                     With --plan-only or --no-render, defaults to .tmp/gif-drafts/<asset-slug>/pipeline-<n>.
  --local            Pipeline 1 or 3 only. Skip LLM and use heuristic renderer.
  --page <n>         Pipeline 1 or 3 local/storyboard renders only. Render one storyboard page and clean stale GIFs.
  --series           Pipeline 3 only. Generate a multi-page summary instead of one graphical abstract.
  --plan-only        Pipeline 1 or 3 only. Save LLM plan without storyboard/render.
  --no-render        Save intermediate JSON/HTML without final GIF render.
  --keep-frames      Pipeline 2 only. Keep temporary PNG frames for debugging.`);
}

function parseArgs(argv) {
  const args = { local: false, planOnly: false, noRender: false, series: false, keepFrames: false };
  const positional = [];
  const booleanFlags = new Set(["--local", "--plan-only", "--no-render", "--series", "--keep-frames"]);
  const valueFlags = new Set(["--pipeline", "--input", "--slug", "--out", "--page"]);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (booleanFlags.has(arg)) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      args[key] = true;
    }
    else if (arg.startsWith("--")) {
      if (!valueFlags.has(arg)) throw new Error(`Unknown option: ${arg}`);
      if (index + 1 >= argv.length || argv[index + 1].startsWith("--")) throw new Error(`${arg} requires a value`);
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      args[key] = argv[index + 1];
      index += 1;
    } else {
      positional.push(arg);
    }
  }
  if (!args.pipeline && ["1", "2", "3"].includes(positional[0])) args.pipeline = positional.shift();
  if (!args.input && positional[0]) args.input = positional[0];
  return args;
}

function validateArgs(args) {
  if (args.local && args.pipeline === "2") throw new Error("--local is only supported for pipeline 1 and pipeline 3.");
  if (args.series && args.pipeline !== "3") throw new Error("--series is only supported for pipeline 3.");
  if (args.planOnly && args.pipeline === "2") throw new Error("--plan-only is only supported for pipeline 1 and pipeline 3.");
  if (args.keepFrames && args.pipeline !== "2") throw new Error("--keep-frames is only supported for pipeline 2.");
  if (args.page && !(args.local && ["1", "3"].includes(args.pipeline))) {
    throw new Error("--page is only supported for local storyboard renders in pipeline 1 or pipeline 3.");
  }
  if (args.local && args.noRender) throw new Error("--no-render cannot be combined with --local.");
  if (args.local && args.planOnly) throw new Error("--plan-only cannot be combined with --local.");
  if (args.local && args.series) throw new Error("--series cannot be combined with --local.");
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const entries = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equals = trimmed.indexOf("=");
    if (equals < 0) continue;
    const key = trimmed.slice(0, equals).trim();
    let value = trimmed.slice(equals + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    entries[key] = value;
  }
  return entries;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return { data: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return { data: {}, body: raw };
  const frontmatter = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\r?\n/, "");
  const data = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    data[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }
  return { data, body };
}

function assetSlugFor(value) {
  return String(value || "blog-gif")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72) || "blog-gif";
}

function markdownForLlm(raw) {
  const withoutImports = raw
    .replace(/^\s*import\s+.*$/gm, "")
    .replace(/^\s*export\s+.*$/gm, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/^!\[[^\]]*]\([^)]+\)\s*$/gm, "")
    .replace(/<img\b[^>]*\/?>/gi, "");
  const withoutTags = withoutImports
    .replace(/<\/?(?:a|span|strong|em|code|dt|dd|li|p)\b[^>]*>/gi, "")
    .replace(/^\s*<\/?(?:dl|div|section|article|figure|figcaption|table|thead|tbody|tr|td|th)\b[^>]*>\s*$/gim, "")
    .replace(/<\/?[A-Za-z][^>]*>/g, "");
  return withoutTags
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function outputFileSlug(value, fallback = "method-diagram") {
  return String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || fallback;
}

function pipeline2GifName(diagramPath) {
  try {
    const diagram = JSON.parse(fs.readFileSync(diagramPath, "utf8"));
    return `01-${outputFileSlug(diagram.title, "method-diagram")}.gif`;
  } catch {
    return "01-method-diagram.gif";
  }
}

function prepareTextInput(inputPath, explicitSlug) {
  const ext = path.extname(inputPath).toLowerCase();
  const raw = fs.readFileSync(inputPath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const sourceSlug = explicitSlug || data.slug || path.basename(inputPath, ext);
  const assetSlug = assetSlugFor(sourceSlug);
  const title = data.title || sourceSlug;
  const cleanBody = markdownForLlm(body);
  const normalized = ext === ".mdx" || ext === ".md"
    ? `# ${title}\n\n${cleanBody}`
    : raw;
  const tmpDir = path.join(rootDir, ".tmp", "gif-inputs");
  fs.mkdirSync(tmpDir, { recursive: true });
  const tmpPath = path.join(tmpDir, `${assetSlug}.md`);
  fs.writeFileSync(tmpPath, normalized);
  return { sourceSlug, assetSlug, inputPath: tmpPath };
}

function resolveInput(input) {
  const resolved = path.resolve(rootDir, input);
  if (!fs.existsSync(resolved)) throw new Error(`Input not found: ${input}`);
  return resolved;
}

function ensurePipelineReady(pipelineDir) {
  if (!fs.existsSync(path.join(pipelineDir, "node_modules"))) {
    const relative = path.relative(rootDir, pipelineDir);
    const pipeline = relative.match(/ai-gif-pipeline-(\d)$/)?.[1] || "?";
    throw new Error(`Missing dependencies in ${relative}. Run npm run gif:setup:${pipeline} from the repo root, or npm run gif:setup for all pipelines.`);
  }
}

function run(command, args, options) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with code ${result.status}`);
}

function outputDirFor({ assetSlug, pipeline, out, draft }) {
  if (out) return path.resolve(rootDir, out);
  const baseDir = draft ? path.join(".tmp", "gif-drafts") : path.join("public", "media", "gifs");
  return path.resolve(rootDir, baseDir, assetSlug, `pipeline-${pipeline}`);
}

function envFor(pipelineDir) {
  return {
    ...readEnvFile(path.join(pipelineDir, ".env")),
    ...process.env
  };
}

function cleanStaleGifs(outDir, keepFileNames) {
  const keep = new Set(keepFileNames);
  for (const fileName of fs.readdirSync(outDir)) {
    if (fileName.endsWith(".gif") && !keep.has(fileName)) fs.unlinkSync(path.join(outDir, fileName));
  }
}

function runPipeline1(args, inputPath, outDir) {
  const pipelineDir = pipelines["1"];
  ensurePipelineReady(pipelineDir);
  fs.mkdirSync(outDir, { recursive: true });
  const commandArgs = args.local
    ? ["comic_pipeline.js", inputPath, outDir]
    : ["generate_with_llm.mjs", inputPath, outDir];
  if (args.local && args.page) commandArgs.push("--page", args.page);
  if (!args.local && args.planOnly) commandArgs.push("--plan-only");
  if (!args.local && args.noRender) commandArgs.push("--no-render");
  run(process.execPath, commandArgs, { cwd: pipelineDir, env: envFor(pipelineDir) });
}

function runPipeline3(args, inputPath, outDir) {
  const pipelineDir = pipelines["3"];
  ensurePipelineReady(pipelineDir);
  fs.mkdirSync(outDir, { recursive: true });
  const commandArgs = args.local
    ? ["comic_pipeline.js", inputPath, outDir]
    : ["generate_with_llm.mjs", inputPath, outDir];
  if (args.local && args.page) commandArgs.push("--page", args.page);
  if (!args.local && args.planOnly) commandArgs.push("--plan-only");
  if (!args.local && args.noRender) commandArgs.push("--no-render");
  if (!args.local && args.series) commandArgs.push("--series");
  run(process.execPath, commandArgs, { cwd: pipelineDir, env: envFor(pipelineDir) });
}

function runPipeline2(args, inputPath, outDir, assetSlug) {
  const pipelineDir = pipelines["2"];
  ensurePipelineReady(pipelineDir);
  fs.mkdirSync(outDir, { recursive: true });
  const diagramPath = path.join(outDir, "diagram.json");
  const htmlPath = path.join(outDir, "diagram.html");
  const framesDir = path.join(rootDir, ".tmp", "gif-frames", `${assetSlug}-pipeline-2-${Date.now()}`);
  if (path.extname(inputPath).toLowerCase() === ".json") {
    if (path.resolve(inputPath) !== path.resolve(diagramPath)) fs.copyFileSync(inputPath, diagramPath);
  } else {
    run(process.execPath, ["src/extract-diagram.js", inputPath, diagramPath], { cwd: pipelineDir, env: envFor(pipelineDir) });
  }
  run(process.execPath, ["src/sanitize-diagram.js", diagramPath, diagramPath], { cwd: pipelineDir, env: envFor(pipelineDir) });
  const gifName = pipeline2GifName(diagramPath);
  const gifPath = path.join(outDir, gifName);
  run(process.execPath, ["src/build-html.js", diagramPath, htmlPath], { cwd: pipelineDir, env: envFor(pipelineDir) });
  if (!args.noRender) {
    try {
      run(process.execPath, ["src/render-gif.js", diagramPath, htmlPath, framesDir, gifPath], { cwd: pipelineDir, env: envFor(pipelineDir) });
    } finally {
      if (!args.keepFrames) fs.rmSync(framesDir, { recursive: true, force: true });
    }
    cleanStaleGifs(outDir, [gifName]);
  }
  fs.writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify({
    pipeline: "ai-gif-pipeline-2",
    source: path.basename(inputPath),
    assetSlug,
    outputs: {
      diagram: "diagram.json",
      preview: "diagram.html",
      gif: args.noRender ? null : gifName
    },
    pages: args.noRender ? [] : [gifName]
  }, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.pipeline || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }
  if (!pipelines[args.pipeline]) throw new Error("--pipeline must be 1, 2, or 3");
  validateArgs(args);

  const originalInput = resolveInput(args.input);
  const textLike = [".md", ".mdx", ".txt"].includes(path.extname(originalInput).toLowerCase());
  const prepared = textLike
    ? prepareTextInput(originalInput, args.slug)
    : {
      sourceSlug: args.slug || path.basename(originalInput, path.extname(originalInput)),
      assetSlug: assetSlugFor(args.slug || path.basename(originalInput, path.extname(originalInput))),
      inputPath: originalInput
    };
  const outDir = outputDirFor({
    assetSlug: prepared.assetSlug,
    pipeline: args.pipeline,
    out: args.out,
    draft: args.planOnly || args.noRender
  });

  if (args.pipeline === "1") runPipeline1(args, prepared.inputPath, outDir);
  else if (args.pipeline === "3") runPipeline3(args, prepared.inputPath, outDir);
  else runPipeline2(args, prepared.inputPath, outDir, prepared.assetSlug);

  const publicDir = path.join(rootDir, "public");
  const isPublicOutput = outDir === publicDir || outDir.startsWith(`${publicDir}${path.sep}`);
  console.log(`\nGIF assets written to: ${outDir}`);
  if (isPublicOutput) {
    const publicPath = `/${path.relative(publicDir, outDir).split(path.sep).join("/")}`;
    console.log(`Asset slug: ${prepared.assetSlug}`);
    console.log(`Blog URL prefix: ${publicPath}`);
  } else {
    console.log("Output is outside public/, so it is for local review only.");
  }
}

main();
