import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const pipelineDir = process.cwd();

function usage() {
  console.log(`Usage:
  npm run render -- --input path/to/storyboard.json
  npm run render -- --input path/to/storyboard.json --out output/my-article
  npm run render -- --input path/to/storyboard.json --page 2

The coding agent authors storyboard.json by following SKILL.md. This command only
validates and renders the storyboard locally; it never calls an LLM API.`);
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--input" || arg === "--out" || arg === "--page") args[arg.slice(2)] = argv[++index];
    else if (!arg.startsWith("--") && !args.input) args.input = arg;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return args;
}

function run(command, args, options) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with code ${result.status}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }
  const inputPath = path.resolve(pipelineDir, args.input);
  if (!fs.existsSync(inputPath)) throw new Error(`Input not found: ${args.input}`);
  if (path.extname(inputPath).toLowerCase() !== ".json") throw new Error("Pipeline 1 requires an agent-authored storyboard.json input.");
  const outDir = path.resolve(pipelineDir, args.out || path.dirname(inputPath));
  fs.mkdirSync(outDir, { recursive: true });
  const commandArgs = ["comic_pipeline.js", inputPath, outDir];
  if (args.page) commandArgs.push("--page", args.page);
  run(process.execPath, commandArgs, { cwd: pipelineDir });
  console.log(`\nOutput written to: ${outDir}`);
}

main();
