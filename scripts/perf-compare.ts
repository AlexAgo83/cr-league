import { readFile, writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const [beforePath, afterPath] = process.argv.filter((arg) => !arg.startsWith("--")).slice(2);
const reportPath = stringArg("--report", "");

if (!beforePath || !afterPath) {
  console.error("Usage: npm run perf:compare -- before.json after.json [--report reports/perf/compare.md]");
  process.exit(1);
}

const before = JSON.parse(await readFile(beforePath, "utf8")) as PerfReport;
const after = JSON.parse(await readFile(afterPath, "utf8")) as PerfReport;
const rows = [
  metric("Heap growth MB", before.growth.heapMb, after.growth.heapMb),
  metric("DOM node growth", before.growth.nodes, after.growth.nodes),
  metric("Listener growth", before.growth.listeners, after.growth.listeners),
  metric("Transfer growth MB", before.growth.transferMb, after.growth.transferMb),
  metric("Final heap MB", last(before).heapMb, last(after).heapMb),
  metric("Final nodes", last(before).nodes, last(after).nodes),
  metric("Final listeners", last(before).listeners, last(after).listeners),
  metric("Final long task ms", last(before).longTaskMs, last(after).longTaskMs)
];

const markdown = [
  "# Perf Compare",
  "",
  `- Before: ${beforePath}`,
  `- After: ${afterPath}`,
  `- Verdict: ${verdict(rows)}`,
  "",
  table(["Metric", "Before", "After", "Delta"], rows.map((row) => [row.label, row.before, row.after, signed(row.delta)])),
  ""
].join("\n");

if (reportPath) {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, markdown);
}

console.log(markdown);

type PerfReport = {
  growth: {
    heapMb: number;
    nodes: number;
    listeners: number;
    transferMb: number;
  };
  samples: Array<{
    heapMb: number;
    nodes: number;
    listeners: number;
    longTaskMs: number;
  }>;
};

function metric(label: string, before: number, after: number) {
  return { label, before, after, delta: roundNumber(after - before) };
}

function last(report: PerfReport) {
  const sample = report.samples.at(-1);
  if (!sample) throw new Error("Perf report has no samples.");
  return sample;
}

function verdict(rows: Array<{ label: string; delta: number }>) {
  const heap = rows.find((row) => row.label === "Heap growth MB")?.delta ?? 0;
  const nodes = rows.find((row) => row.label === "DOM node growth")?.delta ?? 0;
  const listeners = rows.find((row) => row.label === "Listener growth")?.delta ?? 0;
  if (heap <= -1 || nodes <= -50 || listeners <= -20) return "better";
  if (heap >= 1 || nodes >= 50 || listeners >= 20) return "worse";
  return "stable";
}

function table(headers: string[], rows: Array<Array<string | number>>) {
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
}

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function stringArg(name: string, fallback: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1]! : fallback;
}

function roundNumber(value: number) {
  return Math.round(value * 100) / 100;
}
