import { readFileSync } from "node:fs";
import { validateReplayTrace, type RaceResult } from "@cr-league/shared";

const file = process.argv[2];

if (!file) {
  console.error("Usage: npm run replay:validate -- <race-result.json>");
  process.exit(2);
}

const result = JSON.parse(readFileSync(file, "utf8")) as RaceResult;
const errors = validateReplayTrace(result);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Replay trace OK");
