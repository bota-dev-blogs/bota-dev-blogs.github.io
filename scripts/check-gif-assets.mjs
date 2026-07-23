import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  ICON_NAMES,
  FALLBACK_ICON_NAMES,
  CANVAS_ICON_MOTION,
  VISUAL_COLORS
} = require("../AI/shared/semantic-icons.cjs");

const rootDir = process.cwd();
const gifsDir = path.join(rootDir, "public", "media", "gifs");
const blogDir = path.join(rootDir, "src", "content", "blog");
const allowedPipelineDirs = new Set(["pipeline-1", "pipeline-2", "pipeline-3"]);
const allowedIconNames = new Set(ICON_NAMES);
const sharedIconsPath = path.join(rootDir, "AI", "shared", "semantic-icons.cjs");
const pipeline2TemplatePath = path.join(rootDir, "AI", "ai-gif-pipeline-2", "templates", "diagram.html");

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

function isSafeRelativeOutput(fileName) {
  return typeof fileName === "string"
    && fileName.length > 0
    && !path.isAbsolute(fileName)
    && !fileName.split(/[\\/]/).includes("..");
}

function requireOutputFile(pipelineDir, fileName, label, errors) {
  if (!isSafeRelativeOutput(fileName)) {
    fail(`${label} output path "${fileName}" must be a safe relative path`, errors);
    return false;
  }
  const filePath = path.join(pipelineDir, fileName);
  if (!fs.existsSync(filePath)) {
    fail(`${path.relative(rootDir, pipelineDir)} is missing listed output ${fileName}`, errors);
    return false;
  }
  return true;
}

function checkNoFrameDirs(pipelineDir, errors) {
  for (const fileName of fs.readdirSync(pipelineDir)) {
    const filePath = path.join(pipelineDir, fileName);
    if (fs.statSync(filePath).isDirectory() && (fileName === "frames" || fileName === ".frames")) {
      fail(`${path.relative(rootDir, filePath)} should not be committed or published`, errors);
    }
  }
}

function checkGifList(pipelineDirName, pipelineDir, manifest, errors) {
  const listed = Array.isArray(manifest.outputs?.gifs)
    ? manifest.outputs.gifs
    : Array.isArray(manifest.pages)
      ? manifest.pages
      : [];
  if (listed.length === 0) {
    fail(`${path.relative(rootDir, path.join(pipelineDir, "manifest.json"))} must list at least one GIF output`, errors);
  }
  for (const fileName of listed) requireOutputFile(pipelineDir, fileName, `${pipelineDirName} GIF`, errors);

  const listedSet = new Set(listed);
  const actualGifs = fs.readdirSync(pipelineDir).filter((fileName) => fileName.endsWith(".gif")).sort();
  for (const fileName of actualGifs) {
    if (!listedSet.has(fileName)) {
      fail(`${path.relative(rootDir, path.join(pipelineDir, fileName))} is not listed in manifest.json`, errors);
    }
  }
}

function checkIconValue(value, location, errors) {
  if (typeof value !== "string" || !value.trim()) {
    fail(`${location} must define an explicit semantic icon`, errors);
  } else if (!allowedIconNames.has(value)) {
    fail(`${location} uses unknown icon "${value}"`, errors);
  }
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
  if (!CANVAS_ICON_MOTION || CANVAS_ICON_MOTION.scaleAmplitude < 0.025) {
    fail("Canvas icons must have a perceptible global scale animation", errors);
  }
  if (!CANVAS_ICON_MOTION || CANVAS_ICON_MOTION.driftPx < 0.8) {
    fail("Canvas icons must have a perceptible global drift animation", errors);
  }

  for (const iconName of ICON_NAMES) {
    if (!Object.hasOwn(VISUAL_COLORS, iconName)) fail(`semantic icon "${iconName}" is missing a visual color`, errors);
  }
  for (const iconName of FALLBACK_ICON_NAMES) {
    if (!allowedIconNames.has(iconName)) fail(`fallback icon "${iconName}" is not canonical`, errors);
  }

  const renderers = [
    ["Canvas", sharedIconsPath],
    ["Pipeline 2 SVG", pipeline2TemplatePath]
  ];
  for (const [label, filePath] of renderers) {
    if (!fs.existsSync(filePath)) {
      fail(`${label} icon renderer is missing: ${path.relative(rootDir, filePath)}`, errors);
      continue;
    }
    const covered = rendererIconNames(fs.readFileSync(filePath, "utf8"));
    for (const iconName of ICON_NAMES) {
      if (!covered.has(iconName)) fail(`${label} renderer does not implement semantic icon "${iconName}"`, errors);
    }
  }

  const pipeline2Source = fs.readFileSync(pipeline2TemplatePath, "utf8");
  if (!pipeline2Source.includes("class: 'node-icon'")) {
    fail("Pipeline 2 must assign every icon to a node-icon animation group", errors);
  }
  if (!pipeline2Source.includes("iconGroup.style.transform =")) {
    fail("Pipeline 2 must animate each node-icon group independently", errors);
  }
  const pipeline2Motion = pipeline2Source.match(/ICON_MOTION\s*=\s*Object\.freeze\(\{\s*scaleAmplitude:\s*([\d.]+),\s*driftPx:\s*([\d.]+),[\s\S]*?targetPeriodSeconds:\s*([\d.]+)/);
  if (!pipeline2Motion || Number(pipeline2Motion[1]) < 0.025 || Number(pipeline2Motion[2]) < 0.8) {
    fail("Pipeline 2 icon motion must remain perceptible", errors);
  }
  if (!pipeline2Motion || Number(pipeline2Motion[3]) > 2.5) {
    fail("Pipeline 2 icon motion period must remain visibly active", errors);
  }
}

function checkIntermediateIcons(pipelineDirName, pipelineDir, errors) {
  const fileName = pipelineDirName === "pipeline-2" ? "diagram.json" : "storyboard.json";
  const filePath = path.join(pipelineDir, fileName);
  if (!fs.existsSync(filePath)) return;
  const intermediate = readJson(filePath, errors);
  if (!intermediate) return;
  const relativePath = path.relative(rootDir, filePath);

  if (pipelineDirName === "pipeline-1") {
    for (const [pageIndex, page] of (intermediate.pages || []).entries()) {
      for (const [cardIndex, card] of (page.cards || []).entries()) {
        checkIconValue(card.icon, `${relativePath} page ${pageIndex + 1}, card ${cardIndex + 1}`, errors);
      }
    }
  } else if (pipelineDirName === "pipeline-2") {
    for (const [nodeIndex, node] of (intermediate.nodes || []).entries()) {
      checkIconValue(node.icon, `${relativePath} node ${nodeIndex + 1}`, errors);
    }
  } else {
    for (const [pageIndex, page] of (intermediate.pages || []).entries()) {
      for (const [nodeIndex, node] of (page.nodes || []).entries()) {
        checkIconValue(node.visual, `${relativePath} page ${pageIndex + 1}, node ${nodeIndex + 1}`, errors);
      }
    }
  }
}

function checkPipelineDir(assetSlug, pipelineDirName, pipelineDir, errors) {
  const expectedPipeline = `ai-gif-pipeline-${pipelineDirName.replace("pipeline-", "")}`;
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

  checkNoFrameDirs(pipelineDir, errors);
  checkIntermediateIcons(pipelineDirName, pipelineDir, errors);

  if (pipelineDirName === "pipeline-1") {
    if (!fs.existsSync(path.join(pipelineDir, "storyboard.json"))) {
      fail(`${path.relative(rootDir, pipelineDir)} is missing storyboard.json`, errors);
    }
    checkGifList(pipelineDirName, pipelineDir, manifest, errors);
  }

  if (pipelineDirName === "pipeline-2") {
    for (const fileName of ["diagram.json", "diagram.html"]) {
      if (!fs.existsSync(path.join(pipelineDir, fileName))) {
        fail(`${path.relative(rootDir, pipelineDir)} is missing ${fileName}`, errors);
      }
    }
    const gifOutput = manifest.outputs?.gif;
    if (!gifOutput) {
      fail(`${path.relative(rootDir, manifestPath)} must list a rendered GIF for published pipeline-2 assets`, errors);
    } else {
      requireOutputFile(pipelineDir, gifOutput, "pipeline-2 GIF", errors);
      if (gifOutput === "diagram.gif") {
        fail(`${path.relative(rootDir, manifestPath)} should use a descriptive numbered GIF name, not diagram.gif`, errors);
      }
    }
    if (!Array.isArray(manifest.pages) || manifest.pages.length !== 1 || manifest.pages[0] !== gifOutput) {
      fail(`${path.relative(rootDir, manifestPath)} should list the pipeline-2 GIF in pages[0]`, errors);
    }
    const actualGifs = fs.readdirSync(pipelineDir).filter((fileName) => fileName.endsWith(".gif")).sort();
    for (const fileName of actualGifs) {
      if (fileName !== gifOutput) fail(`${path.relative(rootDir, path.join(pipelineDir, fileName))} is not listed in manifest.json`, errors);
    }
  }

  if (pipelineDirName === "pipeline-3") {
    if (!fs.existsSync(path.join(pipelineDir, "storyboard.json"))) {
      fail(`${path.relative(rootDir, pipelineDir)} is missing storyboard.json`, errors);
    }
    checkGifList(pipelineDirName, pipelineDir, manifest, errors);
  }
}

function checkBlogGifReferences(errors) {
  if (!fs.existsSync(blogDir)) return;
  for (const fileName of fs.readdirSync(blogDir).sort()) {
    if (!/\.(md|mdx)$/.test(fileName)) continue;
    const filePath = path.join(blogDir, fileName);
    const raw = fs.readFileSync(filePath, "utf8");
    const references = raw.match(/\/media\/gifs\/[^)"'\s]+\.gif/g) || [];
    for (const reference of references) {
      const publicPath = path.join(rootDir, "public", reference.replace(/^\//, ""));
      if (!fs.existsSync(publicPath)) {
        fail(`${path.relative(rootDir, filePath)} references missing GIF ${reference}`, errors);
      }
      if (reference.includes("/pipeline-2/diagram.gif")) {
        fail(`${path.relative(rootDir, filePath)} should reference the descriptive pipeline-2 GIF name, not diagram.gif`, errors);
      }
    }
  }
}

function main() {
  const errors = [];
  checkSharedIconCoverage(errors);
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
        fail(`${path.relative(rootDir, childPath)} should be inside pipeline-1/, pipeline-2/, or pipeline-3/`, errors);
        continue;
      }
      if (!allowedPipelineDirs.has(childName)) {
        fail(`${path.relative(rootDir, childPath)} is not an allowed pipeline directory`, errors);
        continue;
      }
      checkPipelineDir(assetSlug, childName, childPath, errors);
    }
  }

  checkBlogGifReferences(errors);

  if (errors.length > 0) {
    console.error("GIF asset structure check failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("GIF asset structure is valid.");
}

main();
