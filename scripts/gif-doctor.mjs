import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const pipelines = [
  {
    id: "1",
    name: "Pipeline 1 article/comic GIFs",
    dir: path.join(rootDir, "AI", "ai-gif-pipeline-1"),
    setup: "npm run gif:setup:1",
    needsFfmpeg: false
  },
  {
    id: "2",
    name: "Pipeline 2 paper/diagram GIFs",
    dir: path.join(rootDir, "AI", "ai-gif-pipeline-2"),
    setup: "npm run gif:setup:2",
    needsFfmpeg: true
  }
];

function readEnvKeys(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  const keys = new Set();
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equals = trimmed.indexOf("=");
    if (equals > 0) keys.add(trimmed.slice(0, equals).trim());
  }
  return keys;
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function status(ok, label, detail = "") {
  console.log(`${ok ? "OK  " : "MISS"} ${label}${detail ? ` - ${detail}` : ""}`);
  return ok;
}

function commandExists(command, args = ["--version"]) {
  const result = spawnSync(command, args, { stdio: "ignore", shell: false });
  return result.status === 0;
}

let hasMiss = false;

console.log("GIF pipeline doctor\n");

for (const pipeline of pipelines) {
  console.log(`${pipeline.name}`);
  hasMiss = !status(exists(pipeline.dir), "folder", path.relative(rootDir, pipeline.dir)) || hasMiss;
  hasMiss = !status(exists(path.join(pipeline.dir, "package.json")), "package.json") || hasMiss;
  hasMiss = !status(exists(path.join(pipeline.dir, "node_modules")), "dependencies", pipeline.setup) || hasMiss;
  status(exists(path.join(pipeline.dir, ".env.example")), ".env.example");

  const envPath = path.join(pipeline.dir, ".env");
  const envKeys = readEnvKeys(envPath);
  const hasOpenAI = envKeys.has("OPENAI_API_KEY") || Boolean(process.env.OPENAI_API_KEY);
  const hasDeepSeek = envKeys.has("DEEPSEEK_API_KEY") || Boolean(process.env.DEEPSEEK_API_KEY);
  status(exists(envPath), ".env", exists(envPath) ? "present, values hidden" : "optional until you call an LLM");
  status(hasOpenAI || hasDeepSeek, "LLM key", "OPENAI_API_KEY or DEEPSEEK_API_KEY");

  if (pipeline.id === "2") {
    hasMiss = !status(commandExists("ffmpeg", ["-version"]), "ffmpeg", "required for rendering diagram GIFs") || hasMiss;
    hasMiss = !status(exists(path.join(pipeline.dir, "node_modules", "playwright")), "playwright package", pipeline.setup) || hasMiss;
  }
  console.log("");
}

console.log("Integrated commands:");
console.log("  npm run gif -- 1 --input src/content/blog/<slug>.mdx");
console.log("  npm run gif -- 2 --input .tmp/papers/<paper>.pdf --slug <slug>");
console.log("\nStandalone commands:");
console.log("  cd AI/ai-gif-pipeline-1 && npm run generate -- --input article.md");
console.log("  cd AI/ai-gif-pipeline-2 && npm run generate -- --input paper.pdf");

if (hasMiss) {
  console.log("\nSome required pieces are missing. Run npm run gif:setup, or the per-pipeline setup command shown above.");
  process.exitCode = 1;
}
