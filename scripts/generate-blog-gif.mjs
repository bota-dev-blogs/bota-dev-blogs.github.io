import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const pipelines = {
  "1": path.join(rootDir, "AI", "ai-gif-pipeline-1"),
  "2": path.join(rootDir, "AI", "ai-gif-pipeline-2")
};

function usage() {
  console.log(`Usage:
  npm run gif -- 1 --input src/content/blog/post.mdx
  npm run gif -- 1 --input src/content/blog/post.mdx --local
  npm run gif -- 2 --input path/to/paper.pdf --slug post-slug

Options:
  --pipeline 1|2     Optional if the first positional arg is 1 or 2.
  --input <path>     Required. MD/MDX/TXT for pipeline 1; PDF/MD/TXT/JSON for pipeline 2.
  --slug <slug>      Optional. Defaults to MDX frontmatter slug or input filename.
  --out <dir>        Optional. Defaults to public/media/gifs/<slug>/pipeline-<n>.
  --local            Pipeline 1 only. Skip LLM and use heuristic renderer.
  --plan-only        Pipeline 1 only. Save LLM plan without storyboard/render.
  --no-render        Pipeline 1 or 2. Save intermediate JSON/HTML without final GIF render.`);
}

function parseArgs(argv) {
  const args = { local: false, planOnly: false, noRender: false };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--local") args.local = true;
    else if (arg === "--plan-only") args.planOnly = true;
    else if (arg === "--no-render") args.noRender = true;
    else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      args[key] = argv[index + 1];
      index += 1;
    } else {
      positional.push(arg);
    }
  }
  if (!args.pipeline && ["1", "2"].includes(positional[0])) args.pipeline = positional.shift();
  if (!args.input && positional[0]) args.input = positional[0];
  return args;
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

function slugify(value) {
  return String(value || "blog-gif")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72) || "blog-gif";
}

function prepareTextInput(inputPath, explicitSlug) {
  const ext = path.extname(inputPath).toLowerCase();
  const raw = fs.readFileSync(inputPath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const slug = slugify(explicitSlug || data.slug || path.basename(inputPath, ext));
  const title = data.title || slug;
  const normalized = ext === ".mdx" || ext === ".md"
    ? `# ${title}\n\n${body}`
    : raw;
  const tmpDir = path.join(rootDir, ".tmp", "gif-inputs");
  fs.mkdirSync(tmpDir, { recursive: true });
  const tmpPath = path.join(tmpDir, `${slug}.md`);
  fs.writeFileSync(tmpPath, normalized);
  return { slug, inputPath: tmpPath };
}

function resolveInput(input) {
  const resolved = path.resolve(rootDir, input);
  if (!fs.existsSync(resolved)) throw new Error(`Input not found: ${input}`);
  return resolved;
}

function ensurePipelineReady(pipelineDir) {
  if (!fs.existsSync(path.join(pipelineDir, "node_modules"))) {
    const relative = path.relative(rootDir, pipelineDir);
    const pipeline = relative.endsWith("ai-gif-pipeline-1") ? "1" : "2";
    throw new Error(`Missing dependencies in ${relative}. Run npm run gif:setup:${pipeline} from the repo root, or npm run gif:setup for both pipelines.`);
  }
}

function run(command, args, options) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with code ${result.status}`);
}

function outputDirFor({ slug, pipeline, out }) {
  return path.resolve(rootDir, out || path.join("public", "media", "gifs", slug, `pipeline-${pipeline}`));
}

function envFor(pipelineDir) {
  return {
    ...readEnvFile(path.join(pipelineDir, ".env")),
    ...process.env
  };
}

function runPipeline1(args, inputPath, outDir) {
  const pipelineDir = pipelines["1"];
  ensurePipelineReady(pipelineDir);
  fs.mkdirSync(outDir, { recursive: true });
  const commandArgs = args.local
    ? ["comic_pipeline.js", inputPath, outDir]
    : ["generate_with_llm.mjs", inputPath, outDir];
  if (!args.local && args.planOnly) commandArgs.push("--plan-only");
  if (!args.local && args.noRender) commandArgs.push("--no-render");
  run(process.execPath, commandArgs, { cwd: pipelineDir, env: envFor(pipelineDir) });
}

function runPipeline2(args, inputPath, outDir) {
  const pipelineDir = pipelines["2"];
  ensurePipelineReady(pipelineDir);
  fs.mkdirSync(outDir, { recursive: true });
  const diagramPath = path.join(outDir, "diagram.json");
  const htmlPath = path.join(outDir, "diagram.html");
  const framesDir = path.join(rootDir, ".tmp", "gif-frames", `${path.basename(outDir)}-${Date.now()}`);
  const gifPath = path.join(outDir, "diagram.gif");
  if (path.extname(inputPath).toLowerCase() === ".json") {
    fs.copyFileSync(inputPath, diagramPath);
  } else {
    run(process.execPath, ["src/extract-diagram.js", inputPath, diagramPath], { cwd: pipelineDir, env: envFor(pipelineDir) });
  }
  run(process.execPath, ["src/build-html.js", diagramPath, htmlPath], { cwd: pipelineDir, env: envFor(pipelineDir) });
  if (!args.noRender) {
    run(process.execPath, ["src/render-gif.js", diagramPath, htmlPath, framesDir, gifPath], { cwd: pipelineDir, env: envFor(pipelineDir) });
  }
  fs.writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify({
    pipeline: "ai-gif-pipeline-2",
    source: path.basename(inputPath),
    outputs: {
      diagram: "diagram.json",
      preview: "diagram.html",
      gif: args.noRender ? null : "diagram.gif"
    }
  }, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.pipeline || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }
  if (!pipelines[args.pipeline]) throw new Error("--pipeline must be 1 or 2");

  const originalInput = resolveInput(args.input);
  const textLike = [".md", ".mdx", ".txt"].includes(path.extname(originalInput).toLowerCase());
  const prepared = textLike
    ? prepareTextInput(originalInput, args.slug)
    : { slug: slugify(args.slug || path.basename(originalInput, path.extname(originalInput))), inputPath: originalInput };
  const outDir = outputDirFor({ slug: prepared.slug, pipeline: args.pipeline, out: args.out });

  if (args.pipeline === "1") runPipeline1(args, prepared.inputPath, outDir);
  else runPipeline2(args, prepared.inputPath, outDir);

  const publicDir = path.join(rootDir, "public");
  const isPublicOutput = outDir === publicDir || outDir.startsWith(`${publicDir}${path.sep}`);
  console.log(`\nGIF assets written to: ${outDir}`);
  if (isPublicOutput) {
    const publicPath = `/${path.relative(publicDir, outDir).split(path.sep).join("/")}`;
    console.log(`Blog URL prefix: ${publicPath}`);
  } else {
    console.log("Output is outside public/, so it is for local review only.");
  }
}

main();
