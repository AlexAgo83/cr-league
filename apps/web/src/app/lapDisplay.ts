import { lapForProgress, type RaceResult } from "@cr-league/shared";

type RaceEvent = RaceResult["events"][number];

export function displayLapAtProgress(progress: number, laps: number) {
  return lapForProgress(progress, laps);
}

export function displayLapForEvent(event: RaceEvent, maxEventLap: number, circuitLaps: number) {
  const progress = typeof event.traceProgress === "number" ? event.traceProgress : event.lap / Math.max(1, maxEventLap);
  return displayLapAtProgress(progress, circuitLaps);
}

export function maxEventLap(result: Pick<RaceResult, "events">) {
  return Math.max(1, ...result.events.map((event) => event.lap));
}
