import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "src", "content", "blog");
const publicDir = path.join(rootDir, "public");
const defaultExportRoot = path.join(rootDir, ".exports", "bota");

function usage() {
  console.log(`Usage:
  npm run export:bota -- <post-slug>
  npm run export:bota -- --slug <post-slug>
  npm run export:bota:all

Options:
  --slug <slug>      Export one post by frontmatter slug or filename.
  --all              Export every post under src/content/blog/.
  --out <dir>        Optional. Defaults to .exports/bota.

Output:
  .exports/bota/<slug>/files/src/content/blog/<post>.mdx
  .exports/bota/<slug>/files/public/media/...
  .exports/bota/<slug>/COPY_TO_BOTA.md
  .exports/bota/<slug>/MANIFEST.json`);
}

function parseArgs(argv) {
  const args = { all: false };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--all") args.all = true;
    else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      args[key] = argv[index + 1];
      index += 1;
    } else {
      positional.push(arg);
    }
  }
  if (!args.slug && positional[0]) args.slug = positional[0];
  return args;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return {};
  const frontmatter = raw.slice(3, end).trim();
  const data = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return data;
}

function slashPath(value) {
  return value.split(path.sep).join("/");
}

function relFromRoot(filePath) {
  return slashPath(path.relative(rootDir, filePath));
}

function readPosts() {
  if (!fs.existsSync(blogDir)) return [];
  return fs.readdirSync(blogDir)
    .filter((fileName) => /\.mdx?$/.test(fileName))
    .map((fileName) => {
      const filePath = path.join(blogDir, fileName);
      const raw = fs.readFileSync(filePath, "utf8");
      const frontmatter = parseFrontmatter(raw);
      const fileSlug = fileName.replace(/\.mdx?$/, "");
      return {
        fileName,
        filePath,
        raw,
        slug: frontmatter.slug || fileSlug,
        title: frontmatter.title || frontmatter.slug || fileSlug
      };
    });
}

function assetSlugFor(value) {
  return String(value || "blog-gif")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72) || "blog-gif";
}

function collectMediaRefs(raw, slug) {
  const refs = new Set();
  const quoted = /["'](\/media\/[^"']+)["']/g;
  const markdown = /\]\((\/media\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  const addRef = (value) => {
    const clean = value.split("#")[0].split("?")[0];
    if (clean.startsWith("/media/")) refs.add(clean);
  };

  for (const match of raw.matchAll(quoted)) addRef(match[1]);
  for (const match of raw.matchAll(markdown)) addRef(match[1]);

  const generatedGifDir = path.join(publicDir, "media", "gifs", slug);
  if (fs.existsSync(generatedGifDir)) refs.add(`/media/gifs/${slug}/`);
  const assetSlug = assetSlugFor(slug);
  const generatedAssetGifDir = path.join(publicDir, "media", "gifs", assetSlug);
  if (fs.existsSync(generatedAssetGifDir)) refs.add(`/media/gifs/${assetSlug}/`);

  const allRefs = [...refs].sort();
  const directoryRefs = allRefs.filter((ref) => ref.endsWith("/"));
  return allRefs.filter((ref) => {
    if (ref.endsWith("/")) return true;
    return !directoryRefs.some((directoryRef) => ref.startsWith(directoryRef));
  });
}

function publicPathFor(mediaRef) {
  const relative = mediaRef.replace(/^\/+/, "");
  if (!relative.startsWith("media/")) {
    throw new Error(`Refusing to export non-media path: ${mediaRef}`);
  }
  return path.join(publicDir, relative.replace(/^media\//, "media/"));
}

function copyIntoBundle(sourcePath, bundleFilesDir) {
  if (!fs.existsSync(sourcePath)) return null;
  const destination = path.join(bundleFilesDir, relFromRoot(sourcePath));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(sourcePath, destination, { recursive: true });
  return relFromRoot(sourcePath);
}

function writeCopyGuide({ bundleDir, post, copiedFiles, missingRefs }) {
  const copyLines = copiedFiles.map((item) => `- \`${item}\``).join("\n");
  const missingLines = missingRefs.length
    ? `\nMissing media refs to fix before deployment:\n\n${missingRefs.map((item) => `- \`${item}\``).join("\n")}\n`
    : "";
  const body = `# Copy To Bota

Post: ${post.title}

Slug: \`${post.slug}\`

Copy the contents of \`files/\` into the production blog repo or CMS export workspace for \`https://bota.dev/blogs/\`.

## Files Included

${copyLines || "- No files copied."}
${missingLines}
## Production Build

When building the production site for \`bota.dev\`, use:

\`\`\`bash
SITE_URL=https://bota.dev npm run build
\`\`\`

## Do Not Copy

- \`AI/\`
- \`.tmp/\`
- \`node_modules/\`
- \`.exports/\`
- pipeline frame directories
`;

  fs.writeFileSync(path.join(bundleDir, "COPY_TO_BOTA.md"), body);
}

function exportPost(post, exportRoot) {
  const bundleDir = path.join(exportRoot, post.slug);
  const bundleFilesDir = path.join(bundleDir, "files");
  fs.rmSync(bundleDir, { recursive: true, force: true });
  fs.mkdirSync(bundleFilesDir, { recursive: true });

  const copiedFiles = [];
  const missingRefs = [];

  copiedFiles.push(copyIntoBundle(post.filePath, bundleFilesDir));

  for (const mediaRef of collectMediaRefs(post.raw, post.slug)) {
    const sourcePath = publicPathFor(mediaRef);
    const copied = copyIntoBundle(sourcePath, bundleFilesDir);
    if (copied) copiedFiles.push(copied);
    else missingRefs.push(mediaRef);
  }

  const manifest = {
    slug: post.slug,
    title: post.title,
    post: relFromRoot(post.filePath),
    copiedFiles: copiedFiles.filter(Boolean).sort(),
    missingRefs,
    excluded: ["AI/", ".tmp/", "node_modules/", ".exports/", "frame directories"]
  };

  fs.writeFileSync(path.join(bundleDir, "MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeCopyGuide({ bundleDir, post, copiedFiles: manifest.copiedFiles, missingRefs });

  if (missingRefs.length > 0) {
    console.warn(`Exported ${post.slug} with missing media refs: ${missingRefs.join(", ")}`);
  } else {
    console.log(`Exported ${post.slug} -> ${relFromRoot(bundleDir)}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const posts = readPosts();
  const exportRoot = path.resolve(rootDir, args.out || defaultExportRoot);
  const selected = args.all
    ? posts
    : posts.filter((post) => post.slug === args.slug || post.fileName.replace(/\.mdx?$/, "") === args.slug);

  if (selected.length === 0) {
    usage();
    throw new Error(args.slug ? `No post found for slug: ${args.slug}` : "Provide a slug or use --all.");
  }

  for (const post of selected) exportPost(post, exportRoot);
}

main();
