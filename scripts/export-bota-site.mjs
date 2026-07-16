import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const exportDir = path.join(rootDir, ".exports", "bota-site");
const filesDir = path.join(exportDir, "files");

function relFromRoot(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function copyPath(relativePath, copied) {
  const source = path.join(rootDir, relativePath);
  if (!fs.existsSync(source)) return;
  const destination = path.join(filesDir, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
  copied.push(relativePath);
}

function writeSanitizedPackage(copied) {
  const sourcePackage = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
  const sanitized = {
    name: sourcePackage.name,
    version: sourcePackage.version,
    private: true,
    type: sourcePackage.type,
    scripts: {
      dev: sourcePackage.scripts.dev,
      build: sourcePackage.scripts.build,
      preview: sourcePackage.scripts.preview
    },
    dependencies: sourcePackage.dependencies || {},
    devDependencies: sourcePackage.devDependencies || {}
  };
  const destination = path.join(filesDir, "package.json");
  fs.writeFileSync(destination, `${JSON.stringify(sanitized, null, 2)}\n`);
  copied.push("package.json");
}

function writeGuide(copied) {
  const guide = `# Bota Blog Source Bundle

This bundle contains the deployable Astro blog source without the local AI asset-generation workspace.

## Included

${copied.sort().map((item) => `- \`${item}\``).join("\n")}

## Not Included

- \`AI/\`
- \`.tmp/\`
- \`.exports/\`
- \`node_modules/\`
- GIF pipeline setup scripts
- local generator secrets

## Install

\`\`\`bash
npm ci
\`\`\`

## Develop

\`\`\`bash
npm run dev
\`\`\`

## Build For Bota.dev

\`\`\`bash
SITE_URL=https://bota.dev npm run build
\`\`\`

The generated static output will be written to \`dist/\`.
`;

  fs.writeFileSync(path.join(exportDir, "COPY_TO_BOTA_SITE.md"), guide);
}

function main() {
  fs.rmSync(exportDir, { recursive: true, force: true });
  fs.mkdirSync(filesDir, { recursive: true });

  const copied = [];
  copyPath("src", copied);
  copyPath("public", copied);
  copyPath("astro.config.mjs", copied);
  copyPath("package-lock.json", copied);
  writeSanitizedPackage(copied);

  const manifest = {
    output: relFromRoot(exportDir),
    copied: copied.sort(),
    excluded: ["AI/", ".tmp/", ".exports/", "node_modules/", "GIF pipeline scripts", "local generator secrets"]
  };

  fs.writeFileSync(path.join(exportDir, "MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeGuide(copied);
  console.log(`Exported clean blog source -> ${relFromRoot(exportDir)}`);
}

main();
