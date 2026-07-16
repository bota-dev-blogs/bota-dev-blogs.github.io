import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const pipelineDir = process.cwd();

function usage() {
  console.log(`Usage:
  npm run generate -- --input paper.pdf
  npm run generate -- --input note.md --out output/my-diagram
  npm run generate -- --input diagram.json

Options:
  --input <path>    Required. PDF, MD, TXT, or existing diagram JSON.
  --out <dir>       Optional. Defaults to output/<input-name>.
  --no-render       Save diagram.json and diagram.html without GIF rendering.
  --keep-frames     Keep temporary PNG frames under <out>/.frames.`);
}

function parseArgs(argv) {
  const args = { noRender: false, keepFrames: false };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--no-render") args.noRender = true;
    else if (arg === "--keep-frames") args.keepFrames = true;
    else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      args[key] = argv[index + 1];
      index += 1;
    } else {
      positional.push(arg);
    }
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
  const diagramPath = path.join(outDir, "diagram.json");
  const htmlPath = path.join(outDir, "diagram.html");
  const framesDir = path.join(outDir, ".frames");
  const gifPath = path.join(outDir, "diagram.gif");

  if (path.extname(inputPath).toLowerCase() === ".json") {
    fs.copyFileSync(inputPath, diagramPath);
  } else {
    run(process.execPath, ["src/extract-diagram.js", inputPath, diagramPath], { cwd: pipelineDir, env });
  }

  run(process.execPath, ["src/build-html.js", diagramPath, htmlPath], { cwd: pipelineDir, env });

  if (!args.noRender) {
    run(process.execPath, ["src/render-gif.js", diagramPath, htmlPath, framesDir, gifPath], { cwd: pipelineDir, env });
    if (!args.keepFrames) fs.rmSync(framesDir, { recursive: true, force: true });
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

  console.log(`\nOutput written to: ${outDir}`);
  console.log(`Preview: ${htmlPath}`);
  if (!args.noRender) console.log(`GIF: ${gifPath}`);
}

main();
