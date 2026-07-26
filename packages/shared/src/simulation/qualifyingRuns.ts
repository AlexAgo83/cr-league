import type { QualifyingRun } from "../domain/race.js";

export function bestQualifyingRuns(runs: QualifyingRun[]) {
  const best = new Map<string, QualifyingRun>();
  for (const run of runs) {
    const current = best.get(run.teamId);
    if (!current || run.time < current.time) best.set(run.teamId, run);
  }
  return [...best.values()];
}
