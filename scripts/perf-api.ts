import { performance } from "node:perf_hooks";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { DEMO_RACE_INPUT, simulateRace, type RaceInput } from "../packages/shared/src/index.js";

const cycles = numberArg("--cycles", 100);
const reportPath = stringArg("--report", "reports/perf/api-runtime.md");
const jsonPath = stringArg("--json", reportPath.replace(/\.md$/, ".json"));
const input = DEMO_RACE_INPUT as RaceInput;
const durations: number[] = [];
const sizes: number[] = [];

if (globalThis.gc) globalThis.gc();
const before = process.memoryUsage();

for (let index = 0; index < cycles; index += 1) {
  const started = performance.now();
  const result = simulateRace({ ...input, seed: `${input.seed}-perf-${index}` });
  durations.push(performance.now() - started);
  sizes.push(Buffer.byteLength(JSON.stringify(result)));
}

if (globalThis.gc) globalThis.gc();
const after = process.memoryUsage();
const payload = {
  cycles,
  durationMs: {
    avg: round(avg(durations)),
    p95: round(percentile(durations, 0.95)),
    max: round(Math.max(...durations))
  },
  responseKb: {
    avg: round(avg(sizes) / 1024),
    max: round(Math.max(...sizes) / 1024)
  },
  memoryMb: {
    heapDelta: mb(after.heapUsed - before.heapUsed),
    rssDelta: mb(after.rss - before.rss),
    beforeHeap: mb(before.heapUsed),
    afterHeap: mb(after.heapUsed),
    beforeRss: mb(before.rss),
    afterRss: mb(after.rss)
  }
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(
  reportPath,
  [
    "# API Perf",
    "",
    `- Cycles: ${cycles}`,
    `- Avg resolve: ${payload.durationMs.avg} ms`,
    `- P95 resolve: ${payload.durationMs.p95} ms`,
    `- Max resolve: ${payload.durationMs.max} ms`,
    `- Avg result JSON: ${payload.responseKb.avg} KB`,
    `- Heap delta after GC: ${payload.memoryMb.heapDelta} MB`,
    `- RSS delta after GC: ${payload.memoryMb.rssDelta} MB`,
    ""
  ].join("\n")
);

console.log(`API perf report written to ${reportPath}`);
console.log(`API perf data written to ${jsonPath}`);

function numberArg(name: string, fallback: number) {
  const index = process.argv.lastIndexOf(name);
  const value = index >= 0 ? Number(process.argv[index + 1]) : fallback;
  return Number.isFinite(value) ? value : fallback;
}

function stringArg(name: string, fallback: string) {
  const index = process.argv.lastIndexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1]! : fallback;
}

function avg(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function percentile(values: number[], pct: number) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * pct))] ?? 0;
}

function mb(bytes: number) {
  return round(bytes / 1024 / 1024);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
