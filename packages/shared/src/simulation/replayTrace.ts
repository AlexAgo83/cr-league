import type { ClassificationEntry, RaceEvent, RaceReplayFacts, RaceSegment, ReplayTracePoint, Weather } from "../domain/race.js";
import { RACE_SEGMENTS } from "../domain/race.js";
import { zoneForRaceSegment, zonesAtProgress, type TrackZone } from "../domain/circuits.js";

export function buildReplayFacts(trace: ReplayTracePoint[], events: RaceEvent[], classification: ClassificationEntry[], weather: Record<RaceSegment, Weather>, laps: number, trackZones: readonly TrackZone[]): RaceReplayFacts {
  const orderChanges = trace.slice(1).flatMap((point, index) => {
    const previous = trace[index]!;
    if (point.progress >= 1) return [];
    return point.order.flatMap((teamId, toIndex) => {
      const fromIndex = previous.order.indexOf(teamId);
      if (fromIndex === -1 || fromIndex <= toIndex) return [];
      return previous.order.slice(toIndex, fromIndex).filter((overtakenTeamId) => point.order.indexOf(overtakenTeamId) > toIndex).flatMap((overtakenTeamId) => {
        if (pitRelatedOrderChange(previous, point, teamId, overtakenTeamId)) return [];
        const trackProgress = trackProgressAtRaceProgress(point.progress, laps);
        const zone = zoneSummary(trackZones, trackProgress, "overtake") ?? zoneSummary(trackZones, trackProgress, "sector");
        return [{
              type: "order_change" as const,
              segment: point.segment,
              lap: point.lap,
              progress: point.progress,
              trackProgress,
              ...zone,
              overtakingTeamId: teamId,
              overtakenTeamId,
              fromPosition: fromIndex + 1,
              toPosition: toIndex + 1,
              gapSeconds: Number((point.gaps[teamId] ?? 0).toFixed(1))
            }];
      });
    });
  });

  return { version: 1, orderChanges, directorBeats: buildReplayDirectorBeats(trace, events, orderChanges, classification, weather, laps, trackZones) };
}

function buildReplayDirectorBeats(
  trace: ReplayTracePoint[],
  events: RaceEvent[],
  orderChanges: RaceReplayFacts["orderChanges"],
  classification: ClassificationEntry[],
  weather: Record<RaceSegment, Weather>,
  laps: number,
  trackZones: readonly TrackZone[]
): NonNullable<RaceReplayFacts["directorBeats"]> {
  const beats: NonNullable<RaceReplayFacts["directorBeats"]> = [{ id: "grid-start", type: "grid_start", progress: 0, lap: 1 }];

  for (const change of orderChanges.slice(0, 8)) {
    beats.push({
      id: `overtake-${change.overtakingTeamId}-${change.overtakenTeamId}-${change.progress.toFixed(3)}`,
      type: "overtake",
      progress: change.progress,
      lap: change.lap,
      trackProgress: change.trackProgress,
      zoneKind: change.zoneKind,
      zoneLabel: change.zoneLabel,
      teamId: change.overtakingTeamId,
      relatedTeamId: change.overtakenTeamId,
      fromPosition: change.fromPosition,
      toPosition: change.toPosition,
      gapSeconds: change.gapSeconds
    });
  }

  const weatherChange = RACE_SEGMENTS.find((segment, index) => index > 0 && weather[segment] !== weather[RACE_SEGMENTS[index - 1]!]);
  if (weatherChange) {
    const progress = Math.max(0.2, RACE_SEGMENTS.indexOf(weatherChange) / RACE_SEGMENTS.length);
    const trackProgress = trackProgressAtRaceProgress(progress, laps);
    beats.push({ id: `weather-${weatherChange}`, type: "weather", progress, lap: lapForSegment(weatherChange), trackProgress, ...zoneSummary(trackZones, trackProgress, "sector"), weather: weather[weatherChange] });
  }

  const quietTrace = trace.find((point, index) => index > 0 && point.progress > 0.35 && point.progress < 0.75 && Math.abs((point.gaps[point.order[1] ?? ""] ?? 99) - (point.gaps[point.order[0] ?? ""] ?? 0)) <= 1.5);
  if (quietTrace) {
    const trackProgress = trackProgressAtRaceProgress(quietTrace.progress, laps);
    beats.push({ id: `pack-${quietTrace.progress.toFixed(3)}`, type: "pack", progress: quietTrace.progress, lap: quietTrace.lap, trackProgress, ...zoneSummary(trackZones, trackProgress, "technical"), gapSeconds: quietTrace.gaps[quietTrace.order[1] ?? ""] });
  }

  for (const event of events.filter((event) => event.type === "pit_stop").slice(0, 8)) {
    const progress = event.traceProgress ?? event.lap / Math.max(1, ...events.map((candidate) => candidate.lap));
    beats.push({ id: `pit-${event.teamId}-${event.order}`, type: "pit_stop", progress, lap: event.lap, trackProgress: event.trackProgress, zoneKind: event.zoneKind, zoneLabel: event.zoneLabel, teamId: event.teamId });
  }

  beats.push({ id: "final-pressure", type: "final", progress: 1, lap: trace.at(-1)?.lap ?? lapForSegment("finish"), teamId: classification[0]?.teamId });
  return beats
    .filter((beat, index, all) => all.findIndex((candidate) => candidate.id === beat.id) === index)
    .sort((left, right) => left.progress - right.progress);
}

export function withTraceEventProgress(events: RaceEvent[], trace: ReplayTracePoint[], laps: number, trackZones: readonly TrackZone[]) {
  return events.map((event) => {
    const progress = event.type === "pit_stop" ? pitStopTraceProgressForTeam(trace, event) : eventTraceProgress(trace, event);
    if (progress === undefined) return event;
    const trackProgress = trackProgressAtRaceProgress(progress, laps);
    return { ...event, traceProgress: progress, trackProgress, ...eventZoneSummary(event, trackZones, trackProgress) };
  });
}

function pitStopTraceProgressForTeam(trace: ReplayTracePoint[], event: RaceEvent) {
  const pitPoints = trace.filter((point) => point.cars?.[event.teamId]?.phase === "pit_stop");
  if (!pitPoints.length) return undefined;
  const target = eventTraceProgress(trace, event);
  const groups = pitPoints.reduce<ReplayTracePoint[][]>((all, point) => {
    const current = all.at(-1);
    if (!current?.length || point.progress - current.at(-1)!.progress > 0.03) all.push([point]);
    else current.push(point);
    return all;
  }, []);
  const closest = groups.sort((left, right) => Math.abs(averageProgress(left) - target) - Math.abs(averageProgress(right) - target))[0] ?? pitPoints;
  return Number(averageProgress(closest).toFixed(4));
}

function averageProgress(points: ReplayTracePoint[]) {
  return points.reduce((sum, point) => sum + point.progress, 0) / Math.max(1, points.length);
}

function eventTraceProgress(trace: ReplayTracePoint[], event: RaceEvent) {
  if (event.type === "finish") return 1;
  const segmentIndex = RACE_SEGMENTS.indexOf(event.segment);
  const ratio = eventSegmentRatio(event);
  const target = segmentIndex < 0 ? event.lap / Math.max(1, lapForSegment("finish")) : (segmentIndex + ratio) / RACE_SEGMENTS.length;
  const point = trace
    .filter((candidate) => candidate.segment === event.segment)
    .sort((left, right) => Math.abs(left.progress - target) - Math.abs(right.progress - target))[0];
  return Number((point?.progress ?? Math.max(0, Math.min(1, target))).toFixed(4));
}

function eventSegmentRatio(event: RaceEvent) {
  if (event.type === "weather_change") return 0;
  const ratios: Partial<Record<RaceEvent["type"], number>> = {
    best_sector: 0.25,
    overtake_setup: 0.7,
    pit_imminent: 0.18,
    pit_exit: 0.82,
    pace_gain: 0.25,
    under_pressure: 0.45,
    dense_traffic: 0.65,
    favorable_weather: 0.82,
    battery_critical: 0.2,
    defense_success: 0.42,
    minor_error: 0.62,
    penalty_risk: 0.84,
    personal_record: 0.55
  };
  return ratios[event.type] ?? 0.5;
}


function trackProgressAtRaceProgress(raceProgress: number, laps: number) {
  if (raceProgress >= 1) return 0;
  return Number(((((raceProgress * Math.max(1, laps)) % 1) + 1) % 1).toFixed(4));
}

function eventZoneSummary(event: RaceEvent, zones: readonly TrackZone[], trackProgress: number) {
  if (event.tags.includes("pit_stop")) return firstZoneSummary(zones, "pit") ?? zoneSummary(zones, trackProgress, "sector");
  if (event.tags.includes("overtake") || event.type === "rival_overtake" || event.type === "overtake_setup") return zoneSummary(zones, trackProgress, "overtake") ?? zoneSummary(zones, trackProgress, "sector");
  if (event.tags.some((tag) => tag === "traffic" || tag === "defense" || tag === "error" || tag === "energy")) return zoneSummary(zones, trackProgress, "technical") ?? zoneSummary(zones, trackProgress, "sector");
  return zoneSummary(zones, trackProgress, "sector") ?? zoneSummary([zoneForRaceSegment(event.segment)], trackProgress, "sector");
}

function firstZoneSummary(zones: readonly TrackZone[], kind: TrackZone["kind"]) {
  const zone = zones.find((candidate) => candidate.kind === kind);
  return zone ? { zoneKind: zone.kind, zoneLabel: zone.label } : undefined;
}

function zoneSummary(zones: readonly TrackZone[], trackProgress: number, kind?: TrackZone["kind"]) {
  const zone = zonesAtProgress(zones, trackProgress, kind)[0] ?? (kind === "sector" ? zoneForRaceSegment(segmentAtTrackProgress(trackProgress)) : undefined);
  return zone ? { zoneKind: zone.kind, zoneLabel: zone.label } : undefined;
}

function segmentAtTrackProgress(trackProgress: number): RaceSegment {
  return RACE_SEGMENTS[Math.min(RACE_SEGMENTS.length - 1, Math.floor(Math.max(0, Math.min(0.999999, trackProgress)) * RACE_SEGMENTS.length))] ?? "start";
}

function lapForSegment(segment: RaceSegment) {
  const index = RACE_SEGMENTS.indexOf(segment);
  return index < 0 ? 1 : index + 1;
}

function pitRelatedOrderChange(previous: ReplayTracePoint, point: ReplayTracePoint, teamId: string, overtakenTeamId: string) {
  return [teamId, overtakenTeamId].some((id) => [previous.cars?.[id]?.phase, point.cars?.[id]?.phase].some((phase) => phase?.startsWith("pit")));
}
