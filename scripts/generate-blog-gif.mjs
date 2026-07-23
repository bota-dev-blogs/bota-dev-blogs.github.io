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
  npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json
  npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json
  npm run gif -- 1 --input .tmp/storyboard.json --slug <slug> [--page 1]

Options:
  --pipeline 1|2   Optional if the first positional argument is 1 or 2.
  --input <path>   Required agent-authored storyboard.json.
  --slug <slug>    Required only when the input path does not identify an asset folder.
  --out <dir>      Optional explicit output directory.
  --page <n>       Render one storyboard page.

Pipeline 1 creates compact tile-board explainers. Pipeline 2 creates research maps
and graphical abstracts. Follow each pipeline's SKILL.md to author the storyboard.`);
}

function parseArgs(argv) {
  const args = {};
  const positional = [];
  const valueFlags = new Set(["--pipeline", "--input", "--slug", "--out", "--page"]);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg.startsWith("--")) {
      if (!valueFlags.has(arg)) throw new Error(`Unknown option: ${arg}`);
      const value = argv[++index];
      if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
      args[arg.slice(2)] = value;
    } else positional.push(arg);
  }
  if (!args.pipeline && ["1", "2"].includes(positional[0])) args.pipeline = positional.shift();
  if (!args.input && positional[0]) args.input = positional.shift();
  if (positional.length) throw new Error(`Unexpected argument: ${positional[0]}`);
  return args;
}

function assetSlug(value) {
  return String(value || "blog-gif")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72) || "blog-gif";
}

function inferredSlug(inputPath, explicitSlug) {
  if (explicitSlug) return assetSlug(explicitSlug);
  const parent = path.basename(path.dirname(inputPath));
  if (/^pipeline-[12]$/.test(parent)) return assetSlug(path.basename(path.dirname(path.dirname(inputPath))));
  return assetSlug(path.basename(inputPath, path.extname(inputPath)));
}

function outputDirFor(args, inputPath) {
  if (args.out) return path.resolve(rootDir, args.out);
  if (path.basename(path.dirname(inputPath)) === `pipeline-${args.pipeline}`) return path.dirname(inputPath);
  return path.join(rootDir, "public", "media", "gifs", inferredSlug(inputPath, args.slug), `pipeline-${args.pipeline}`);
}

function run(command, commandArgs, options) {
  const result = spawnSync(command, commandArgs, { stdio: "inherit", shell: false, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${commandArgs.join(" ")} exited with code ${result.status}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.pipeline || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }
  if (!pipelines[args.pipeline]) throw new Error("--pipeline must be 1 or 2");
  const inputPath = path.resolve(rootDir, args.input);
  if (!fs.existsSync(inputPath)) throw new Error(`Input not found: ${args.input}`);
  if (path.extname(inputPath).toLowerCase() !== ".json") throw new Error("GIF pipelines require an agent-authored storyboard.json input.");
  const pipelineDir = pipelines[args.pipeline];
  if (!fs.existsSync(path.join(pipelineDir, "node_modules"))) {
    throw new Error(`Missing dependencies for pipeline ${args.pipeline}. Run npm run gif:setup:${args.pipeline}.`);
  }
  const outDir = outputDirFor(args, inputPath);
  fs.mkdirSync(outDir, { recursive: true });
  const commandArgs = ["comic_pipeline.js", inputPath, outDir];
  if (args.page) commandArgs.push("--page", args.page);
  run(process.execPath, commandArgs, { cwd: pipelineDir });
}

main();
