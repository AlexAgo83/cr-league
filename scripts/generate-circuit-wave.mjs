#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const args = parseArgs(process.argv.slice(2));
const specs = readSpecs();
const reportPath = args.report ?? ".cache/circuit-wave-report.json";
const overpassTimeout = args.overpassTimeout ?? "18";
const fetchTimeoutMs = args.fetchTimeoutMs ?? "30000";
const candidates = args.candidates ?? "70";
const attemptTimeoutMs = Number(args.attemptTimeoutMs ?? 90_000);
const importReady = [];
const report = [];

if (!specs.length) {
  die("Usage: node scripts/generate-circuit-wave.mjs --spec circuits.json OR --json '[...]'");
}

for (const spec of specs) {
  const attempts = buildAttempts(spec);
  let accepted = null;
  const failures = [];
  for (const attempt of attempts) {
    const result = runGenerator(spec, attempt);
    if (result.status === 0) {
      accepted = { ...attempt, summary: result.output.trim().split("\n").at(-1) };
      break;
    }
    failures.push({ ...attempt, error: result.output.trim().split("\n").slice(-8).join("\n") });
  }
  if (accepted) {
    importReady.push(stripGenerationFields(spec));
    report.push({ layoutKey: spec.layoutKey, status: "generated", accepted, failures });
  } else {
    report.push({ layoutKey: spec.layoutKey, status: "failed", failures });
  }
}

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Circuit wave report written to ${reportPath}`);

if (importReady.length && args.import !== "false") {
  execFileSync(process.execPath, ["scripts/import-generated-circuits.mjs", "--json", JSON.stringify(importReady)], { stdio: "inherit" });
}

if (report.some((entry) => entry.status === "failed")) process.exitCode = 1;

function buildAttempts(spec) {
  if (Array.isArray(spec.attempts) && spec.attempts.length) return spec.attempts;
  const targetKm = String(spec.targetKm ?? 5.8);
  const lat = String(spec.lat);
  const lng = String(spec.lng);
  return [
    { lat, lng, targetKm, radiusMeters: String(spec.radiusMeters ?? 1800), highways: spec.highways ?? "all", candidates },
    { lat, lng, targetKm, radiusMeters: String(Math.round(Number(spec.radiusMeters ?? 1800) * 0.7)), highways: spec.highways ?? "all", candidates: "50" },
    { lat, lng, targetKm, radiusMeters: String(spec.majorRadiusMeters ?? spec.radiusMeters ?? 2200), highways: "major", candidates: "70" },
    { lat, lng, targetKm: String(Math.max(4.4, Number(spec.targetKm ?? 5.8) - 0.4)), radiusMeters: String(Math.round(Number(spec.majorRadiusMeters ?? spec.radiusMeters ?? 1800) * 0.75)), highways: "major", candidates: "50" }
  ];
}

function runGenerator(spec, attempt) {
  const commandArgs = [
    "scripts/generate-circuit.mjs",
    "--lat", String(attempt.lat ?? spec.lat),
    "--lng", String(attempt.lng ?? spec.lng),
    "--layout-key", spec.layoutKey,
    "--target-km", String(attempt.targetKm ?? spec.targetKm ?? 5.8),
    "--radiusMeters", String(attempt.radiusMeters ?? spec.radiusMeters ?? 1800),
    "--overpassTimeout", String(attempt.overpassTimeout ?? overpassTimeout),
    "--fetchTimeoutMs", String(attempt.fetchTimeoutMs ?? fetchTimeoutMs),
    "--candidates", String(attempt.candidates ?? candidates),
    "--write-index", "0",
    "--quiet", "true"
  ];
  if ((attempt.highways ?? spec.highways) === "major") commandArgs.push("--highways", "major");
  if (attempt.candidateRadii) commandArgs.push("--candidate-radii", String(attempt.candidateRadii));
  const result = spawnSync(process.execPath, commandArgs, { encoding: "utf8", timeout: attemptTimeoutMs });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.error?.code === "ETIMEDOUT") return { status: 124, output: `${output}\nAttempt timed out after ${attemptTimeoutMs}ms` };
  return { status: result.status ?? 1, output };
}

function stripGenerationFields(spec) {
  const { lat, lng, targetKm, radiusMeters, majorRadiusMeters, highways, attempts, ...importSpec } = spec;
  void lat;
  void lng;
  void targetKm;
  void radiusMeters;
  void majorRadiusMeters;
  void highways;
  void attempts;
  return importSpec;
}

function readSpecs() {
  if (!args.spec && !args.json) return [];
  const value = args.json ?? readFileSync(args.spec, "utf8");
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;
    parsed[arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = rawArgs[index + 1]?.startsWith("--") ? "true" : rawArgs[++index];
  }
  return parsed;
}

function die(message) {
  console.error(message);
  process.exit(1);
}
