import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const gifsDir = path.join(rootDir, "public", "media", "gifs");
const allowedPipelineDirs = new Set(["pipeline-1", "pipeline-2"]);

function fail(message, errors) {
  errors.push(message);
}

function readJson(filePath, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${path.relative(rootDir, filePath)} is not valid JSON: ${error.message}`, errors);
    return null;
  }
}

function checkPipelineDir(assetSlug, pipelineDirName, pipelineDir, errors) {
  const expectedPipeline = pipelineDirName === "pipeline-1" ? "ai-gif-pipeline-1" : "ai-gif-pipeline-2";
  const manifestPath = path.join(pipelineDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    fail(`${path.relative(rootDir, pipelineDir)} is missing manifest.json`, errors);
    return;
  }

  const manifest = readJson(manifestPath, errors);
  if (!manifest) return;

  if (manifest.assetSlug !== assetSlug) {
    fail(`${path.relative(rootDir, manifestPath)} has assetSlug "${manifest.assetSlug}", expected "${assetSlug}"`, errors);
  }

  if (manifest.pipeline !== expectedPipeline) {
    fail(`${path.relative(rootDir, manifestPath)} has pipeline "${manifest.pipeline}", expected "${expectedPipeline}"`, errors);
  }

  if (pipelineDirName === "pipeline-1") {
    if (!fs.existsSync(path.join(pipelineDir, "storyboard.json"))) {
      fail(`${path.relative(rootDir, pipelineDir)} is missing storyboard.json`, errors);
    }
    const gifs = fs.readdirSync(pipelineDir).filter((fileName) => fileName.endsWith(".gif"));
    if (gifs.length === 0) fail(`${path.relative(rootDir, pipelineDir)} has no .gif files`, errors);
  }

  if (pipelineDirName === "pipeline-2") {
    for (const fileName of ["diagram.json", "diagram.html"]) {
      if (!fs.existsSync(path.join(pipelineDir, fileName))) {
        fail(`${path.relative(rootDir, pipelineDir)} is missing ${fileName}`, errors);
      }
    }
  }
}

function main() {
  const errors = [];
  if (!fs.existsSync(gifsDir)) {
    console.log("No public/media/gifs directory yet.");
    return;
  }

  for (const assetSlug of fs.readdirSync(gifsDir).sort()) {
    const assetDir = path.join(gifsDir, assetSlug);
    const assetStat = fs.statSync(assetDir);
    if (!assetStat.isDirectory()) {
      fail(`${path.relative(rootDir, assetDir)} must be a directory`, errors);
      continue;
    }

    const children = fs.readdirSync(assetDir).sort();
    if (children.length === 0) fail(`${path.relative(rootDir, assetDir)} is empty`, errors);

    for (const childName of children) {
      const childPath = path.join(assetDir, childName);
      const childStat = fs.statSync(childPath);
      if (!childStat.isDirectory()) {
        fail(`${path.relative(rootDir, childPath)} should be inside pipeline-1/ or pipeline-2/`, errors);
        continue;
      }
      if (!allowedPipelineDirs.has(childName)) {
        fail(`${path.relative(rootDir, childPath)} is not an allowed pipeline directory`, errors);
        continue;
      }
      checkPipelineDir(assetSlug, childName, childPath, errors);
    }
  }

  if (errors.length > 0) {
    console.error("GIF asset structure check failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("GIF asset structure is valid.");
}

main();
