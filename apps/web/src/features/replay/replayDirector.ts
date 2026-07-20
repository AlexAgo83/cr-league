import { RACE_SEGMENTS, type RaceResult, type ReplayTracePoint, type Weather } from "@cr-league/shared";
import type { TranslationKey } from "../../i18n/index.js";
import type { RaceEvent, Translator } from "../../app/helpers.js";
import { displayLapAtProgress, pitStopTraceProgress, segmentAtProgress, type ReplayPlan } from "./replayMath.js";

export type ReplayDirectorBeat = {
  id: string;
  type: "grid_start" | "overtake" | "player" | "pack" | "weather" | "pit_stop" | "final" | "qualifying_start" | "qualifying_pace" | "qualifying_final";
  progress: number;
  lap: number;
  teamId?: string;
  relatedTeamId?: string;
  fromPosition?: number;
  toPosition?: number;
  weather?: Weather;
  gapSeconds?: number;
};
export function buildRaceDirectorBeats(result: RaceResult, trace: ReplayTracePoint[], plan: ReplayPlan, laps: number, playerTeamId?: string, mode: "race" | "qualifying" = "race", pitProgress = 0.5): ReplayDirectorBeat[] {
  if (mode === "qualifying") {
    const beats: ReplayDirectorBeat[] = [
      { id: "qualifying-start", type: "qualifying_start", progress: 0, lap: 1 },
      { id: "qualifying-pace", type: "qualifying_pace", progress: 0.5, lap: displayLapAtProgress(0.5, laps), teamId: playerTeamId ?? result.classification[0]?.teamId },
      { id: "qualifying-final", type: "qualifying_final", progress: 1, lap: displayLapAtProgress(1, laps), teamId: playerTeamId ?? result.classification[0]?.teamId }
    ];
    const weatherChange = RACE_SEGMENTS.find((segment, index) => index > 0 && result.resolvedWeather[segment] !== result.resolvedWeather[RACE_SEGMENTS[index - 1]!]);
    if (weatherChange) {
      const progress = Math.max(0.2, RACE_SEGMENTS.indexOf(weatherChange) / RACE_SEGMENTS.length);
      beats.splice(-1, 0, { id: `weather-${weatherChange}`, type: "weather", progress, lap: displayLapAtProgress(progress, laps), weather: result.resolvedWeather[weatherChange] });
    }
    return beats.sort((left, right) => left.progress - right.progress);
  }

  if (result.replayFacts?.directorBeats?.length) {
    return result.replayFacts.directorBeats
      .map((beat) => ({
        ...beat,
        lap: displayLapAtProgress(beat.progress, laps),
        type: beat.type === "overtake" && (beat.teamId === playerTeamId || beat.relatedTeamId === playerTeamId) ? "player" as const : beat.type
      }))
      .sort((left, right) => left.progress - right.progress);
  }

  const beats: ReplayDirectorBeat[] = [
    { id: "grid-start", type: "grid_start", progress: 0, lap: 1 }
  ];
  for (const change of plan.overtakes.slice(0, 8)) {
    beats.push({
      id: `overtake-${change.overtakingTeamId}-${change.overtakenTeamId}-${change.progress.toFixed(3)}`,
      type: change.overtakingTeamId === playerTeamId || change.overtakenTeamId === playerTeamId ? "player" : "overtake",
      progress: change.progress,
      lap: displayLapAtProgress(change.progress, laps),
      teamId: change.overtakingTeamId,
      relatedTeamId: change.overtakenTeamId,
      fromPosition: change.fromPosition,
      toPosition: change.toPosition,
      gapSeconds: change.gapSeconds
    });
  }
  const weatherChange = RACE_SEGMENTS.find((segment, index) => index > 0 && result.resolvedWeather[segment] !== result.resolvedWeather[RACE_SEGMENTS[index - 1]!]);
  if (weatherChange) {
    const progress = Math.max(0.2, RACE_SEGMENTS.indexOf(weatherChange) / RACE_SEGMENTS.length);
    beats.push({ id: `weather-${weatherChange}`, type: "weather", progress, lap: displayLapAtProgress(progress, laps), weather: result.resolvedWeather[weatherChange] });
  }
  const quietTrace = trace.find((point, index) => index > 0 && point.progress > 0.35 && point.progress < 0.75 && Math.abs((point.gaps[point.order[1] ?? ""] ?? 99) - (point.gaps[point.order[0] ?? ""] ?? 0)) <= 1.5);
  if (quietTrace) beats.push({ id: `pack-${quietTrace.progress.toFixed(3)}`, type: "pack", progress: quietTrace.progress, lap: displayLapAtProgress(quietTrace.progress, laps), gapSeconds: quietTrace.gaps[quietTrace.order[1] ?? ""] });
  const maxLap = Math.max(1, ...result.events.map((candidate) => candidate.lap));
  for (const event of result.events.filter((event) => event.type === "pit_stop").slice(0, 8)) {
    const progress = pitStopTraceProgress(result, trace, event, maxLap, laps, pitProgress, plan);
    beats.push({ id: `pit-${event.teamId}-${event.order}`, type: "pit_stop", progress, lap: displayLapAtProgress(progress, laps), teamId: event.teamId });
  }
  beats.push({ id: "final-pressure", type: "final", progress: 1, lap: displayLapAtProgress(1, laps), teamId: result.classification[0]?.teamId });
  return beats
    .filter((beat, index, all) => all.findIndex((candidate) => candidate.id === beat.id) === index)
    .sort((left, right) => left.progress - right.progress);
}


export function buildQualifyingMomentEvents(beats: ReplayDirectorBeat[], result: RaceResult): RaceEvent[] {
  return beats
    .filter((beat) => beat.type === "qualifying_start" || beat.type === "qualifying_pace" || beat.type === "qualifying_final")
    .map((beat, index) => ({
      id: `chrono-${beat.id}`,
      order: index,
      segment: segmentAtProgress(beat.progress),
      lap: beat.lap,
      traceProgress: beat.progress,
      type: "race_note",
      teamId: beat.teamId ?? result.classification[0]?.teamId ?? "",
      severity: "minor",
      positionDelta: 0,
      tags: ["mini_info", beat.type],
      replayText: "",
      reportText: ""
    }));
}

export function directorBeatCopy(beat: ReplayDirectorBeat, names: Map<string, string>, tt: Translator) {
  const team = beat.teamId ? names.get(beat.teamId) ?? beat.teamId : "";
  const related = beat.relatedTeamId ? names.get(beat.relatedTeamId) ?? beat.relatedTeamId : "";
  if (beat.type === "qualifying_start") return { title: tt("replay_director_qualifying_start"), detail: tt("replay_director_qualifying_start_detail") };
  if (beat.type === "qualifying_pace") return { title: tt("replay_director_qualifying_pace"), detail: tt("replay_director_qualifying_pace_detail", { team }) };
  if (beat.type === "qualifying_final") return { title: tt("replay_director_qualifying_final"), detail: tt("replay_director_qualifying_final_detail", { team }) };
  if (beat.type === "grid_start") return { title: tt("replay_director_grid_start"), detail: tt("replay_director_grid_detail") };
  if (beat.type === "player") return { title: tt("replay_director_player"), detail: tt("replay_director_overtake_detail", { team, related, from: beat.fromPosition ?? "-", to: beat.toPosition ?? "-" }) };
  if (beat.type === "overtake") return { title: tt("replay_director_overtake"), detail: tt("replay_director_overtake_detail", { team, related, from: beat.fromPosition ?? "-", to: beat.toPosition ?? "-" }) };
  if (beat.type === "pack") return { title: tt("replay_director_pack"), detail: tt("replay_director_pack_detail", { gap: (beat.gapSeconds ?? 0).toFixed(1) }) };
  if (beat.type === "weather") return { title: tt("replay_director_weather"), detail: tt("replay_director_weather_detail", { weather: tt(`weather_${beat.weather ?? "dry"}` as TranslationKey) }) };
  if (beat.type === "pit_stop") return { title: tt("replay_director_pit_stop"), detail: tt("replay_director_pit_stop_detail", { team }) };
  return { title: tt("replay_director_final"), detail: tt("replay_director_final_detail", { team }) };
}
