import { RACE_SEGMENTS, type RaceResult } from "@cr-league/shared";
import { useEffect, useRef, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import { eventReplayText, teamNamesFromResult, type Translator } from "../app/helpers.js";
import { CircuitMap, type MapCar } from "./CircuitMap.js";

const WEATHER_ICONS = { dry: "☀️", light_rain: "🌦️", heavy_rain: "⛈️" } as const;

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
  const progressRef = useRef<HTMLDivElement>(null);
  const clock = useRef(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const names = teamNamesFromResult(result);
  const field = result.classification.slice(0, 6);
  const cars: MapCar[] = field.map((entry, index) => ({
    id: entry.teamId,
    label: entry.teamName.slice(0, 3).toUpperCase(),
    player: entry.teamId === playerTeamId,
    // ponytail: everyone launches from the line at t=0; per-position lap times spread the field naturally.
    delay: 0,
    duration: 14 + index * 0.6
  }));
  // Replay ends when the last car completes the race distance; the clock parks there on pause.
  const replayEnd = Math.max(0, ...cars.map((car) => car.delay + circuit.laps * car.duration));

  // SMIL has no playback-rate API, so the SVG clock is driven by hand:
  // animations stay paused and a rAF loop advances setCurrentTime at `speed`.
  // jsdom implements none of this, hence the guards.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg?.pauseAnimations) return;
    svg.pauseAnimations();
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now: number) {
      clock.current = Math.min(clock.current + ((now - last) / 1000) * speed, replayEnd);
      last = now;
      svg.setCurrentTime(clock.current);
      if (progressRef.current) progressRef.current.style.width = `${(clock.current / replayEnd) * 100}%`;
      if (clock.current >= replayEnd) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, replayEnd]);

  function seek(time: number) {
    clock.current = Math.max(0, Math.min(time, replayEnd));
    svgRef.current?.setCurrentTime?.(clock.current);
    if (progressRef.current) progressRef.current.style.width = `${(clock.current / replayEnd) * 100}%`;
  }

  function restart() {
    seek(0);
    setPlaying(true);
  }
  // Majors and player moments first pick, race notes as filler — then strict race order.
  const keyMoments = [
    ...result.events.filter((event) => event.severity === "major"),
    ...result.events.filter((event) => event.teamId === playerTeamId || event.relatedTeamId === playerTeamId),
    ...result.events.filter((event) => event.severity === "minor" && event.type === "race_note")
  ]
    .filter((event, index, events) => events.findIndex((candidate) => candidate.id === event.id) === index)
    .slice(0, 8)
    .sort((left, right) => left.order - right.order);

  // Timeline markers: one dot per lap that has a key/player moment, positioned by lap.
  const maxLap = Math.max(1, ...result.events.map((event) => event.lap));
  const markerByLap = new Map<number, { texts: string[]; player: boolean }>();
  for (const event of keyMoments.filter((event) => event.severity === "major" || event.teamId === playerTeamId)) {
    const marker = markerByLap.get(event.lap) ?? { texts: [], player: false };
    marker.texts.push(`${tt("unit_lap")} ${event.lap} · ${eventReplayText(event, names, tt)}`);
    marker.player ||= event.teamId === playerTeamId;
    markerByLap.set(event.lap, marker);
  }
  const markers = [...markerByLap.entries()].map(([lap, marker]) => ({
    lap,
    left: `${Math.min(96, Math.max(3, (lap / maxLap) * 100))}%`,
    time: (lap / maxLap) * replayEnd,
    title: marker.texts.join("\n"),
    player: marker.player
  }));

  return (
    <div className="view-stack">
      <div className="replay-main-grid">
        <div className="replay-content-column">
          <section className="panel replay-player-panel">
            <div className="circuit-map-heading">
              <span className="circuit-city">{circuit.city}</span>
              <strong>{tt(circuit.layoutKey)}</strong>
              <small>
                {circuit.country} · {circuit.laps} {tt("unit_laps")} · {tt(`weather_${circuit.likelyWeather}` as TranslationKey)}
              </small>
            </div>
            <CircuitMap
              circuit={circuit}
              tt={tt}
              cars={cars}
              svgRef={svgRef}
              showHeading={false}
              overlay={
                <>
                  <ol className="replay-tower">
                    {result.classification.slice(0, 6).map((entry) => (
                      <li key={entry.teamId} className={entry.teamId === playerTeamId ? "player" : undefined}>
                        <strong>P{entry.position}</strong>
                        <span>{entry.teamName}</span>
                      </li>
                    ))}
                  </ol>
                  <div
                    className="replay-progress"
                    aria-hidden="true"
                    onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      seek(((event.clientX - rect.left) / rect.width) * replayEnd);
                    }}
                  >
                    <div ref={progressRef} className="replay-progress-fill" />
                    {RACE_SEGMENTS.slice(1).map((segment, index) => (
                      <span key={segment} className="replay-tick" style={{ left: `${((index + 1) / RACE_SEGMENTS.length) * 100}%` }} />
                    ))}
                    {RACE_SEGMENTS.map((segment, index) => (
                      <span
                        key={segment}
                        className="replay-weather"
                        style={{ left: `${((index + 0.5) / RACE_SEGMENTS.length) * 100}%` }}
                        title={tt(`weather_${result.resolvedWeather[segment]}` as TranslationKey)}
                      >
                        {WEATHER_ICONS[result.resolvedWeather[segment]]}
                      </span>
                    ))}
                    {markers.map((marker) => (
                      <span
                        key={marker.lap}
                        className={marker.player ? "replay-marker player" : "replay-marker"}
                        style={{ left: marker.left }}
                        title={marker.title}
                        onClick={(event) => {
                          event.stopPropagation();
                          seek(marker.time);
                        }}
                      />
                    ))}
                  </div>
                </>
              }
            />
          </section>

          <section className="panel replay-copy-panel">
            <h2>{tt("result_replay_title")}</h2>
            <p className="replay-explainer">{tt("result_replay_explainer")}</p>
            <div className="actions replay-controls secondary-actions">
              <button type="button" onClick={() => (!playing && clock.current >= replayEnd ? restart() : setPlaying(!playing))}>
                {playing ? tt("action_pause") : tt("action_play")}
              </button>
              <button type="button" onClick={restart}>
                {tt("action_replay_restart")}
              </button>
              <label className="replay-speed">
                {tt("replay_speed")}
                <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
                  <option value={0.5}>×0.5</option>
                  <option value={1}>×1</option>
                  <option value={2}>×2</option>
                  <option value={4}>×4</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        <section className="panel replay-moments-panel">
          <h3>{tt("result_key_moments")}</h3>
          {keyMoments.length ? (
            <ul className="events replay-timeline">
              {keyMoments.map((event) => (
                <li key={event.id} className={event.teamId === playerTeamId ? "player-event" : undefined}>
                  <button type="button" className="replay-moment-button" onClick={() => seek((event.lap / maxLap) * replayEnd)}>
                    <span className="lap-marker">
                      {tt("unit_lap")} {event.lap}
                    </span>
                    <strong>{eventReplayText(event, names, tt)}</strong>
                    <small>{event.severity === "major" ? tt("event_major") : tt("event_ambience")}</small>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="replay-empty">{tt("result_replay_empty")}</p>
          )}
        </section>
      </div>
    </div>
  );
}
