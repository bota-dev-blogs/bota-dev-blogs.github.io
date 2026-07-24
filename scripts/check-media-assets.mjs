import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const mediaDir = path.join(rootDir, "public", "media");
const blogDir = path.join(rootDir, "src", "content", "blog");
const allowedMediaEntries = new Set([".gitkeep", "assets", "featured", "gifs"]);
const errors = [];

function fail(message) {
  errors.push(message);
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

function checkMediaRoot() {
  for (const entry of fs.readdirSync(mediaDir)) {
    const filePath = path.join(mediaDir, entry);
    if (!allowedMediaEntries.has(entry)) {
      fail(`${relative(filePath)} must be moved under featured/, assets/, or gifs/`);
    } else if (entry !== ".gitkeep" && !fs.statSync(filePath).isDirectory()) {
      fail(`${relative(filePath)} must be a directory`);
    }
  }
}

function checkFeaturedReferences() {
  for (const fileName of fs.readdirSync(blogDir).filter((name) => /\.(md|mdx)$/.test(name))) {
    const filePath = path.join(blogDir, fileName);
    const source = fs.readFileSync(filePath, "utf8");
    const slug = source.match(/^slug: "([^"]+)"$/m)?.[1];
    const cover = source.match(/^cover:\s*$\n\s+src: "([^"]+)"/m)?.[1];

    if (!slug) fail(`${relative(filePath)} is missing a quoted slug`);
    if (!cover) {
      fail(`${relative(filePath)} is missing cover.src`);
      continue;
    }

    if (!cover.startsWith("/media/featured/") && !cover.startsWith("/media/gifs/")) {
      fail(`${relative(filePath)} cover.src must use /media/featured/<slug>/ or /media/gifs/<asset-slug>/`);
    }
    if (cover.startsWith("/media/featured/") && slug && !cover.startsWith(`/media/featured/${slug}/`)) {
      fail(`${relative(filePath)} featured cover folder must match slug "${slug}"`);
    }

    const references = source.match(/\/media\/featured\/[^)"'\s]+/g) || [];
    for (const reference of references) {
      const publicPath = path.join(rootDir, "public", reference.replace(/^\//, ""));
      if (!fs.existsSync(publicPath)) fail(`${relative(filePath)} references missing featured image ${reference}`);
    }
  }
}

checkMediaRoot();
checkFeaturedReferences();

if (errors.length) {
  console.error("Media asset structure check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Media asset structure is valid.");
}
