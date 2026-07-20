import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const pipelineDir = process.cwd();

function usage() {
  console.log(`Usage:
  npm run generate -- --input article.mdx
  npm run generate -- --input article.mdx --out output/my-article
  npm run series -- --input article.mdx
  npm run local -- --input storyboard.json

Options:
  --input <path>   Required. Markdown, MDX, TXT, or storyboard JSON for --local.
  --out <dir>      Optional. Defaults to output/<input-name>.
  --series         Generate a multi-page explainer instead of the default one-page summary.
  --local          Skip the LLM and render the input locally.
  --plan-only      Save plan.json only.
  --no-render      Save plan.json and storyboard.json without rendering GIFs.`);
}

function parseArgs(argv) {
  const args = { local: false, planOnly: false, noRender: false, series: false };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--local") args.local = true;
    else if (arg === "--plan-only") args.planOnly = true;
    else if (arg === "--no-render") args.noRender = true;
    else if (arg === "--series") args.series = true;
    else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      args[key] = argv[index + 1];
      index += 1;
    } else positional.push(arg);
  }
  if (!args.input && positional[0]) args.input = positional[0];
  return args;
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equals = trimmed.indexOf("=");
    if (equals < 0) continue;
    const key = trimmed.slice(0, equals).trim();
    const value = trimmed.slice(equals + 1).trim().replace(/^['"]|['"]$/g, "");
    if (process.env[key] === undefined) values[key] = value;
  }
  return values;
}

function run(command, args, options) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with code ${result.status}`);
}

function defaultOut(inputPath) {
  return path.resolve(pipelineDir, "output", path.basename(inputPath, path.extname(inputPath)));
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
  const outDir = path.resolve(pipelineDir, args.out || defaultOut(inputPath));
  fs.mkdirSync(outDir, { recursive: true });

  const env = { ...readEnvFile(path.join(pipelineDir, ".env")), ...process.env };
  const commandArgs = args.local
    ? ["comic_pipeline.js", inputPath, outDir]
    : ["generate_with_llm.mjs", inputPath, outDir];
  if (!args.local && args.planOnly) commandArgs.push("--plan-only");
  if (!args.local && args.noRender) commandArgs.push("--no-render");
  if (!args.local && args.series) commandArgs.push("--series");

  run(process.execPath, commandArgs, { cwd: pipelineDir, env });
  console.log(`\nOutput written to: ${outDir}`);
}

main();
