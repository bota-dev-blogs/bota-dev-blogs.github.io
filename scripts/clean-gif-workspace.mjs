import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

function usage() {
  console.log(`Usage:
  npm run gif:clean
  npm run gif:clean -- --dry-run
  npm run gif:clean -- --all

Options:
  --dry-run   Print what would be removed.
  --all       Also remove generated GIF input drafts, smoke outputs, verification scratch folders,
              and ignored AI pipeline fixtures/standalone outputs.`);
}

function parseArgs(argv) {
  const args = { all: false, dryRun: false };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--all") args.all = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return args;
}

function existing(paths) {
  return paths
    .map((entry) => path.resolve(rootDir, entry))
    .filter((entry) => fs.existsSync(entry));
}

function scratchPaths(args) {
  const paths = [];
  if (!args.all) return existing(paths);

  const tmpDir = path.join(rootDir, ".tmp");
  const aiArtifacts = [
    "AI/.DS_Store",
    "AI/ai-gif-pipeline-1/.DS_Store",
    "AI/ai-gif-pipeline-1/linkedin_reference.gif",
    "AI/ai-gif-pipeline-2/.DS_Store",
    "AI/ai-gif-pipeline-2/output",
    "AI/ai-gif-pipeline-1/output"
  ];
  if (!fs.existsSync(tmpDir)) return existing([...paths, ...aiArtifacts]);
  const allPaths = [
    ...paths,
    ".tmp/gif-drafts",
    ".tmp/gif-test-inputs",
    ".tmp/final-visual-check",
    ".tmp/pipeline1-final-check",
    ".tmp/pipeline1-redesign",
    ".tmp/spacing-audit",
    ...fs.readdirSync(tmpDir)
      .filter((name) => /^(smoke|smoke-|style-check|verify-gifs)/.test(name))
      .map((name) => path.join(".tmp", name))
  ];
  return existing([...new Set([...allPaths, ...aiArtifacts])]);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function dirSize(entry) {
  const stat = fs.statSync(entry);
  if (!stat.isDirectory()) return stat.size;
  let total = 0;
  for (const child of fs.readdirSync(entry)) total += dirSize(path.join(entry, child));
  return total;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const targets = scratchPaths(args);
  if (targets.length === 0) {
    console.log("No GIF scratch folders to clean.");
    return;
  }

  let total = 0;
  for (const target of targets) {
    const size = dirSize(target);
    total += size;
    console.log(`${args.dryRun ? "Would remove" : "Removing"} ${path.relative(rootDir, target)} (${formatSize(size)})`);
    if (!args.dryRun) fs.rmSync(target, { recursive: true, force: true });
  }
  console.log(`${args.dryRun ? "Dry run total" : "Removed"}: ${formatSize(total)}`);
}

main();
