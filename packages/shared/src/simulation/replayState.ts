import type { RaceResult, ReplayTracePoint } from "../domain/race.js";

const EMPTY_TRACE_POINT: ReplayTracePoint = { segment: "start", lap: 1, progress: 0, order: [], times: {}, gaps: {} };

export function tracePointAt(trace: ReplayTracePoint[], progress: number) {
  return [...trace].reverse().find((point) => point.progress <= progress) ?? trace[0] ?? EMPTY_TRACE_POINT;
}

export function replayOrderAtProgress(result: RaceResult, trace: ReplayTracePoint[], progress: number) {
  const order = tracePointAt(trace, progress).order;
  return order.length ? order : result.classification.map((entry) => entry.teamId);
}

export function traceGapsAt(trace: ReplayTracePoint[], progress: number) {
  return traceNumbersAt(trace, progress, "gaps");
}

export function traceTimesAt(trace: ReplayTracePoint[], progress: number) {
  return traceNumbersAt(trace, progress, "times");
}

export function positionDeltas(currentOrder: string[], nextOrder: string[]) {
  return Object.fromEntries(
    nextOrder.flatMap((teamId, nextIndex) => {
      const currentIndex = currentOrder.indexOf(teamId);
      const delta = currentIndex - nextIndex;
      return currentIndex >= 0 && delta ? [[teamId, delta]] : [];
    })
  );
}

function traceNumbersAt(trace: ReplayTracePoint[], progress: number, key: "gaps" | "times") {
  const from = tracePointAt(trace, progress);
  const to = trace.find((point) => point.progress > progress) ?? from;
  const span = to.progress - from.progress || 1;
  const ratio = Math.min(1, Math.max(0, (progress - from.progress) / span));
  return Object.fromEntries(
    Object.keys({ ...from[key], ...to[key] }).map((teamId) => [
      teamId,
      (from[key][teamId] ?? 0) + ((to[key][teamId] ?? 0) - (from[key][teamId] ?? 0)) * ratio
    ])
  );
}
