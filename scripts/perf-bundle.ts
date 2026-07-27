import { spawnSync } from "node:child_process";
import { readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";

const distDir = stringArg("--dist", "apps/web/dist");
const reportPath = stringArg("--report", "reports/perf/bundle.md");
const jsonPath = stringArg("--json", reportPath.replace(/\.md$/, ".json"));
const skipBuild = process.argv.includes("--no-build");

if (!skipBuild && !(await exists(distDir))) {
  const build = spawnSync("npm", ["run", "build"], { stdio: "inherit" });
  if (build.status !== 0) throw new Error("Build failed.");
}

const files = (await walk(distDir)).sort((left, right) => right.bytes - left.bytes);
const byKind = summarizeByKind(files);
const payload = {
  distDir,
  totalMb: mb(files.reduce((sum, file) => sum + file.bytes, 0)),
  files: files.length,
  byKind,
  largest: files.slice(0, 30)
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(
  reportPath,
  [
    "# Bundle Perf",
    "",
    `- Dist: ${distDir}`,
    `- Total: ${payload.totalMb} MB`,
    `- Files: ${payload.files}`,
    "",
    "## By Kind",
    "",
    table(["Kind", "Files", "Size MB"], byKind.map((row) => [row.kind, row.files, row.mb])),
    "",
    "## Largest Files",
    "",
    table(["File", "Kind", "Size KB"], payload.largest.map((file) => [file.path, file.kind, Math.round(file.bytes / 1024)])),
    ""
  ].join("\n")
);

console.log(`Bundle perf report written to ${reportPath}`);
console.log(`Bundle perf data written to ${jsonPath}`);

type FileRow = {
  path: string;
  kind: string;
  bytes: number;
};

async function walk(root: string): Promise<FileRow[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const rows = await Promise.all(
    entries.map(async (entry) => {
      const path = join(root, entry.name);
      if (entry.isDirectory()) return walk(path);
      const info = await stat(path);
      return [{ path: relative(distDir, path), kind: kindFor(path), bytes: info.size }];
    })
  );
  return rows.flat();
}

function summarizeByKind(files: FileRow[]) {
  const totals = new Map<string, { kind: string; files: number; bytes: number }>();
  for (const file of files) {
    const row = totals.get(file.kind) ?? { kind: file.kind, files: 0, bytes: 0 };
    row.files += 1;
    row.bytes += file.bytes;
    totals.set(file.kind, row);
  }
  return [...totals.values()]
    .map((row) => ({ kind: row.kind, files: row.files, mb: mb(row.bytes) }))
    .sort((left, right) => right.mb - left.mb);
}

function kindFor(path: string) {
  const ext = extname(path).slice(1).toLowerCase();
  if (["js", "mjs"].includes(ext)) return "js";
  if (ext === "css") return "css";
  if (["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) return "image";
  if (["woff", "woff2", "ttf", "otf"].includes(ext)) return "font";
  if (["html", "json", "webmanifest"].includes(ext)) return "document";
  return ext || "other";
}

async function exists(path: string) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function table(headers: string[], rows: Array<Array<string | number>>) {
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
}

function stringArg(name: string, fallback: string) {
  const index = process.argv.lastIndexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1]! : fallback;
}

function mb(bytes: number) {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}
