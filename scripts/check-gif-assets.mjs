import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ICON_NAMES, FALLBACK_ICON_NAMES, CANVAS_ICON_MOTION, VISUAL_COLORS } = require("../AI/shared/semantic-icons.cjs");
const { LAYOUTS: pipeline1LayoutList } = require("../AI/ai-gif-pipeline-1/comic_pipeline.js");
const { LAYOUTS: pipeline2LayoutList, EDGE_END_SHAPES: pipeline2EndShapeList } = require("../AI/ai-gif-pipeline-2/comic_pipeline.js");
const rootDir = process.cwd();
const gifsDir = path.join(rootDir, "public", "media", "gifs");
const blogDir = path.join(rootDir, "src", "content", "blog");
const allowedPipelineDirs = new Set(["pipeline-1", "pipeline-2"]);
const allowedIconNames = new Set(ICON_NAMES);
const pipeline1Layouts = new Set(pipeline1LayoutList);
const pipeline2Layouts = new Set(pipeline2LayoutList);
const pipeline2EndShapes = new Set(pipeline2EndShapeList);
const sharedIconsPath = path.join(rootDir, "AI", "shared", "semantic-icons.cjs");

function fail(message, errors) { errors.push(message); }

function readJson(filePath, errors) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch (error) { fail(`${path.relative(rootDir, filePath)} is not valid JSON: ${error.message}`, errors); return null; }
}

function isSafeRelativeOutput(fileName) {
  return typeof fileName === "string" && fileName.length > 0 && !path.isAbsolute(fileName) && !fileName.split(/[\\/]/).includes("..");
}

function checkIconValue(value, location, errors) {
  if (typeof value !== "string" || !value.trim()) fail(`${location} must define an explicit semantic icon`, errors);
  else if (!allowedIconNames.has(value)) fail(`${location} uses unknown icon "${value}"`, errors);
}

function rendererIconNames(source) {
  const names = new Set();
  for (const match of source.matchAll(/iconName\s*===\s*'([^']+)'/g)) names.add(match[1]);
  for (const match of source.matchAll(/\[([^\]]+)\]\.includes\(iconName\)/g)) {
    for (const nameMatch of match[1].matchAll(/'([^']+)'/g)) names.add(nameMatch[1]);
  }
  return names;
}

function checkSharedIconCoverage(errors) {
  if (!CANVAS_ICON_MOTION || CANVAS_ICON_MOTION.scaleAmplitude < 0.025) fail("Canvas icons must have a perceptible global scale animation", errors);
  if (!CANVAS_ICON_MOTION || CANVAS_ICON_MOTION.driftPx < 0.8) fail("Canvas icons must have a perceptible global drift animation", errors);
  for (const iconName of ICON_NAMES) if (!Object.hasOwn(VISUAL_COLORS, iconName)) fail(`semantic icon "${iconName}" is missing a visual color`, errors);
  for (const iconName of FALLBACK_ICON_NAMES) if (!allowedIconNames.has(iconName)) fail(`fallback icon "${iconName}" is not canonical`, errors);
  const covered = rendererIconNames(fs.readFileSync(sharedIconsPath, "utf8"));
  for (const iconName of ICON_NAMES) if (!covered.has(iconName)) fail(`Canvas renderer does not implement semantic icon "${iconName}"`, errors);
}

function checkStoryboard(pipelineDirName, pipelineDir, errors) {
  const filePath = path.join(pipelineDir, "storyboard.json");
  if (!fs.existsSync(filePath)) { fail(`${path.relative(rootDir, pipelineDir)} is missing storyboard.json`, errors); return; }
  const storyboard = readJson(filePath, errors);
  if (!storyboard) return;
  const relativePath = path.relative(rootDir, filePath);
  for (const [pageIndex, page] of (storyboard.pages || []).entries()) {
    if (pipelineDirName === "pipeline-1") {
      if (!pipeline1Layouts.has(page.layout)) fail(`${relativePath} page ${pageIndex + 1} must select a supported pipeline-1 layout`, errors);
      if (!Array.isArray(page.cards) || page.cards.length < 1 || page.cards.length > 4) fail(`${relativePath} page ${pageIndex + 1} must contain 1-4 cards`, errors);
      for (const [cardIndex, card] of (page.cards || []).entries()) checkIconValue(card.icon, `${relativePath} page ${pageIndex + 1}, card ${cardIndex + 1}`, errors);
    } else {
      if (!pipeline2Layouts.has(page.layout)) fail(`${relativePath} page ${pageIndex + 1} must select a supported pipeline-2 layout`, errors);
      if (!Array.isArray(page.nodes) || page.nodes.length < 2 || page.nodes.length > 6) fail(`${relativePath} page ${pageIndex + 1} must contain 2-6 nodes`, errors);
      if (page.layout === "semantic-map" && (page.nodes || []).some((node) => !node.position)) fail(`${relativePath} page ${pageIndex + 1} semantic-map nodes require normalized positions`, errors);
      const ids = new Set((page.nodes || []).map((node) => node.id));
      for (const edge of page.edges || []) {
        if (!ids.has(edge.from) || !ids.has(edge.to)) fail(`${relativePath} page ${pageIndex + 1} edge references an unknown node`, errors);
        if (edge.endShape && !pipeline2EndShapes.has(edge.endShape)) fail(`${relativePath} page ${pageIndex + 1} edge uses unsupported endShape "${edge.endShape}"`, errors);
      }
      for (const [nodeIndex, node] of (page.nodes || []).entries()) checkIconValue(node.visual, `${relativePath} page ${pageIndex + 1}, node ${nodeIndex + 1}`, errors);
    }
  }
}

function checkGifList(pipelineDirName, pipelineDir, manifest, errors) {
  const listed = Array.isArray(manifest.outputs?.gifs) ? manifest.outputs.gifs : Array.isArray(manifest.pages) ? manifest.pages : [];
  if (!listed.length) fail(`${path.relative(rootDir, path.join(pipelineDir, "manifest.json"))} must list at least one GIF`, errors);
  const listedSet = new Set(listed);
  for (const fileName of listed) {
    if (!isSafeRelativeOutput(fileName)) fail(`${pipelineDirName} output path "${fileName}" must be a safe relative path`, errors);
    else if (!fs.existsSync(path.join(pipelineDir, fileName))) fail(`${path.relative(rootDir, pipelineDir)} is missing listed output ${fileName}`, errors);
  }
  for (const fileName of fs.readdirSync(pipelineDir).filter((name) => name.endsWith(".gif"))) {
    if (!listedSet.has(fileName)) fail(`${path.relative(rootDir, path.join(pipelineDir, fileName))} is not listed in manifest.json`, errors);
  }
}

function checkPipelineDir(assetSlug, pipelineDirName, pipelineDir, errors) {
  const manifestPath = path.join(pipelineDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) { fail(`${path.relative(rootDir, pipelineDir)} is missing manifest.json`, errors); return; }
  const manifest = readJson(manifestPath, errors);
  if (!manifest) return;
  const expectedPipeline = `ai-gif-pipeline-${pipelineDirName.at(-1)}`;
  if (manifest.assetSlug !== assetSlug) fail(`${path.relative(rootDir, manifestPath)} has assetSlug "${manifest.assetSlug}", expected "${assetSlug}"`, errors);
  if (manifest.pipeline !== expectedPipeline) fail(`${path.relative(rootDir, manifestPath)} has pipeline "${manifest.pipeline}", expected "${expectedPipeline}"`, errors);
  for (const fileName of fs.readdirSync(pipelineDir)) {
    const filePath = path.join(pipelineDir, fileName);
    if (fs.statSync(filePath).isDirectory()) fail(`${path.relative(rootDir, filePath)} should not be committed inside a published pipeline folder`, errors);
  }
  checkStoryboard(pipelineDirName, pipelineDir, errors);
  checkGifList(pipelineDirName, pipelineDir, manifest, errors);
}

function checkBlogGifReferences(errors) {
  if (!fs.existsSync(blogDir)) return;
  for (const fileName of fs.readdirSync(blogDir).filter((name) => /\.(md|mdx)$/.test(name))) {
    const filePath = path.join(blogDir, fileName);
    const references = fs.readFileSync(filePath, "utf8").match(/\/media\/gifs\/[^)"'\s]+\.gif/g) || [];
    for (const reference of references) if (!fs.existsSync(path.join(rootDir, "public", reference.replace(/^\//, "")))) fail(`${path.relative(rootDir, filePath)} references missing GIF ${reference}`, errors);
  }
}

function main() {
  const errors = [];
  checkSharedIconCoverage(errors);
  if (fs.existsSync(gifsDir)) {
    for (const assetSlug of fs.readdirSync(gifsDir).sort()) {
      const assetDir = path.join(gifsDir, assetSlug);
      if (!fs.statSync(assetDir).isDirectory()) { fail(`${path.relative(rootDir, assetDir)} must be a directory`, errors); continue; }
      const children = fs.readdirSync(assetDir).sort();
      if (!children.length) fail(`${path.relative(rootDir, assetDir)} is empty`, errors);
      for (const childName of children) {
        const childPath = path.join(assetDir, childName);
        if (!fs.statSync(childPath).isDirectory() || !allowedPipelineDirs.has(childName)) {
          fail(`${path.relative(rootDir, childPath)} must be pipeline-1/ or pipeline-2/`, errors);
          continue;
        }
        checkPipelineDir(assetSlug, childName, childPath, errors);
      }
    }
  }
  checkBlogGifReferences(errors);
  if (errors.length) {
    console.error("GIF asset structure check failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else console.log("GIF asset structure is valid.");
}

main();
