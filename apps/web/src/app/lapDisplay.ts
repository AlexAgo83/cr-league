import type { RaceResult } from "@cr-league/shared";

type RaceEvent = RaceResult["events"][number];

export function displayLapAtProgress(progress: number, laps: number) {
  return Math.max(1, Math.min(laps, Math.round(1 + Math.max(0, Math.min(1, progress)) * (laps - 1))));
}

export function displayLapForEvent(event: RaceEvent, maxEventLap: number, circuitLaps: number) {
  const progress = typeof event.traceProgress === "number" ? event.traceProgress : event.lap / Math.max(1, maxEventLap);
  return displayLapAtProgress(progress, circuitLaps);
}

export function maxEventLap(result: Pick<RaceResult, "events">) {
  return Math.max(1, ...result.events.map((event) => event.lap));
}
