import { RACE_SEGMENTS, type RaceResult, type ReplayTracePoint, type Weather } from "@cr-league/shared";
import type { TranslationKey } from "../../i18n/index.js";
import type { RaceEvent, Translator } from "../../app/helpers.js";
import { displayLapAtProgress, segmentAtProgress, type ReplayPlan } from "./replayMath.js";
import { trackZoneDisplayLabel } from "./replayMath.js";

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
  zoneLabel?: string;
};
export function buildRaceDirectorBeats(result: RaceResult, _trace: ReplayTracePoint[], _plan: ReplayPlan, laps: number, playerTeamId?: string, mode: "race" | "qualifying" = "race", _pitProgress = 0.5): ReplayDirectorBeat[] {
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

  return (result.replayFacts?.directorBeats ?? [
    { id: "grid-start", type: "grid_start" as const, progress: 0, lap: 1 },
    { id: "final-pressure", type: "final" as const, progress: 1, lap: displayLapAtProgress(1, laps), teamId: result.classification[0]?.teamId }
  ])
    .map((beat) => ({
      ...beat,
      lap: displayLapAtProgress(beat.progress, laps),
      type: beat.type === "overtake" && (beat.teamId === playerTeamId || beat.relatedTeamId === playerTeamId) ? "player" as const : beat.type
    }))
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
  const zone = trackZoneDisplayLabel(beat.zoneLabel);
  const withZone = (detail: string) => zone ? `${detail} · ${zone}` : detail;
  if (beat.type === "qualifying_start") return { title: tt("replay_director_qualifying_start"), detail: tt("replay_director_qualifying_start_detail") };
  if (beat.type === "qualifying_pace") return { title: tt("replay_director_qualifying_pace"), detail: tt("replay_director_qualifying_pace_detail", { team }) };
  if (beat.type === "qualifying_final") return { title: tt("replay_director_qualifying_final"), detail: tt("replay_director_qualifying_final_detail", { team }) };
  if (beat.type === "grid_start") return { title: tt("replay_director_grid_start"), detail: tt("replay_director_grid_detail") };
  if (beat.type === "player") return { title: tt("replay_director_player"), detail: withZone(tt("replay_director_overtake_detail", { team, related, from: beat.fromPosition ?? "-", to: beat.toPosition ?? "-" })) };
  if (beat.type === "overtake") return { title: tt("replay_director_overtake"), detail: withZone(tt("replay_director_overtake_detail", { team, related, from: beat.fromPosition ?? "-", to: beat.toPosition ?? "-" })) };
  if (beat.type === "pack") return { title: tt("replay_director_pack"), detail: withZone(tt("replay_director_pack_detail", { gap: (beat.gapSeconds ?? 0).toFixed(1) })) };
  if (beat.type === "weather") return { title: tt("replay_director_weather"), detail: withZone(tt("replay_director_weather_detail", { weather: tt(`weather_${beat.weather ?? "dry"}` as TranslationKey) })) };
  if (beat.type === "pit_stop") return { title: tt("replay_director_pit_stop"), detail: withZone(tt("replay_director_pit_stop_detail", { team })) };
  return { title: tt("replay_director_final"), detail: tt("replay_director_final_detail", { team }) };
}
