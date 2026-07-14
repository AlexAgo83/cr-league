import { RACE_SEGMENTS, type RaceResult } from "@cr-league/shared";
import { useRef, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import { eventReplayText, teamNamesFromResult, type Translator } from "../app/helpers.js";
import { CircuitMap, type MapCar } from "./CircuitMap.js";

export function ReplayView({
  result,
  circuit,
  playerTeamId,
  tt
}: {
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  tt: Translator;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [playing, setPlaying] = useState(true);
  const names = teamNamesFromResult(result);
  const playerEntry = result.classification.find((entry) => entry.teamId === playerTeamId);

  // ponytail: SMIL clock control; jsdom has no pauseAnimations, hence the guards.
  function togglePlay() {
    const svg = svgRef.current;
    if (playing) {
      svg?.pauseAnimations?.();
    } else {
      svg?.unpauseAnimations?.();
    }
    setPlaying(!playing);
  }

  function restart() {
    const svg = svgRef.current;
    svg?.setCurrentTime?.(0);
    svg?.unpauseAnimations?.();
    setPlaying(true);
  }
  const winner = result.classification[0];
  const field = result.classification.slice(0, 6);
  const cars: MapCar[] = field.map((entry, index) => ({
    id: entry.teamId,
    label: entry.teamName.slice(0, 3).toUpperCase(),
    player: entry.teamId === playerTeamId,
    // ponytail: cars evenly spaced along the loop, leader first — deterministic replay feel, not a physics sim.
    delay: -((field.length - index) * (14 / field.length)),
    duration: 14 + index * 0.6
  }));
  const keyMoments = [
    ...result.events.filter((event) => event.severity === "major"),
    ...result.events.filter((event) => event.teamId === playerTeamId || event.relatedTeamId === playerTeamId),
    ...result.events.filter((event) => event.severity === "minor" && event.type === "race_note")
  ]
    .filter((event, index, events) => events.findIndex((candidate) => candidate.id === event.id) === index)
    .slice(0, 8);

  return (
    <div className="view-stack">
      <section className="panel">
        <h2>{tt("result_replay_title")}</h2>
        <p className="replay-explainer">{tt("result_replay_explainer")}</p>
        <div className="replay-summary">
          <span>
            {tt("result_replay_winner")} <strong>{winner?.teamName ?? result.grandPrixName}</strong>
          </span>
          {playerEntry ? (
            <span>
              {tt("result_replay_you")} <strong>P{playerEntry.position}</strong>
            </span>
          ) : null}
        </div>
        <CircuitMap circuit={circuit} tt={tt} cars={cars} svgRef={svgRef} />
        <div className="actions replay-controls secondary-actions">
          <button type="button" onClick={togglePlay}>
            {playing ? tt("action_pause") : tt("action_play")}
          </button>
          <button type="button" onClick={restart}>
            {tt("action_replay_restart")}
          </button>
        </div>
        <ol className="replay-laps" aria-label={tt("result_replay_track_label")}>
          {RACE_SEGMENTS.map((segment, index) => (
            <li key={segment}>
              <strong>
                {tt("result_replay_phase")} {index + 1}
              </strong>
              <span>{tt(`weather_${result.resolvedWeather[segment]}` as TranslationKey)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h3>{tt("result_key_moments")}</h3>
        {keyMoments.length ? (
          <ul className="events replay-timeline">
            {keyMoments.map((event) => (
              <li key={event.id} className={event.teamId === playerTeamId ? "player-event" : undefined}>
                <span className="lap-marker">
                  {tt("unit_lap")} {event.lap}
                </span>
                <strong>{eventReplayText(event, names, tt)}</strong>
                <small>{event.severity === "major" ? tt("event_major") : tt("event_ambience")}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="replay-empty">{tt("result_replay_empty")}</p>
        )}
      </section>
    </div>
  );
}
