import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const pipelines = [
  { id: "1", name: "Pipeline 1 compact explainer GIFs" },
  { id: "2", name: "Pipeline 2 animated research maps" }
].map((pipeline) => ({
  ...pipeline,
  dir: path.join(rootDir, "AI", `ai-gif-pipeline-${pipeline.id}`),
  setup: `npm run gif:setup:${pipeline.id}`
}));

function status(ok, label, detail = "") {
  console.log(`${ok ? "OK  " : "MISS"} ${label}${detail ? ` - ${detail}` : ""}`);
  return ok;
}

let hasMiss = false;
console.log("GIF pipeline doctor\n");

for (const pipeline of pipelines) {
  console.log(pipeline.name);
  hasMiss = !status(fs.existsSync(pipeline.dir), "folder", path.relative(rootDir, pipeline.dir)) || hasMiss;
  hasMiss = !status(fs.existsSync(path.join(pipeline.dir, "package.json")), "package.json") || hasMiss;
  hasMiss = !status(fs.existsSync(path.join(pipeline.dir, "SKILL.md")), "agent skill") || hasMiss;
  hasMiss = !status(fs.existsSync(path.join(pipeline.dir, "comic_pipeline.js")), "renderer") || hasMiss;
  hasMiss = !status(fs.existsSync(path.join(pipeline.dir, "node_modules")), "dependencies", pipeline.setup) || hasMiss;
  console.log("");
}

console.log("\nIntegrated commands:");
console.log("  npm run gif -- 1 --input public/media/gifs/<slug>/pipeline-1/storyboard.json");
console.log("  npm run gif -- 2 --input public/media/gifs/<slug>/pipeline-2/storyboard.json");

if (hasMiss) {
  console.log("\nSome required pieces are missing. Run npm run gif:setup or the per-pipeline setup command shown above.");
  process.exitCode = 1;
}
