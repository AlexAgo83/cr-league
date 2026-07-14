import { RACE_SEGMENTS, type RaceResult, type RaceSegment, type Weather } from "@cr-league/shared";
import { useEffect, useRef, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { countryFlag, type CityCircuit } from "../app/circuits.js";
import { eventReplayText, teamNamesFromResult, type Translator } from "../app/helpers.js";
import type { RaceEvent } from "../app/helpers.js";
import { CircuitMap, MapTraitsPanel, type MapCar, type MapTraitStats } from "./CircuitMap.js";

const WEATHER_ICONS = { dry: "☀️", light_rain: "🌦️", heavy_rain: "⛈️" } as const;

function clampStat(value: number) {
  return Math.max(1, Math.min(99, Math.round(value)));
}

function liveTraits(base: MapTraitStats, weather: Weather, lap: number): MapTraitStats {
  const rainGrip = weather === "heavy_rain" ? -12 : weather === "light_rain" ? -5 : 0;
  const lateRace = Math.max(0, lap - 1);
  return {
    grip: clampStat(base.grip + rainGrip),
    overtaking: clampStat(base.overtaking + (weather === "dry" ? 0 : 3)),
    energy: clampStat(base.energy - lateRace * 2 - (weather === "heavy_rain" ? 5 : 0))
  };
}

function momentCard(event: RaceEvent, names: Map<string, string>, tt: Translator) {
  const team = names.get(event.teamId) ?? "";
  const context = event.cardId ? tt(`card_${event.cardId}` as TranslationKey) : event.type === "weather_change" ? tt("event_weather_change") : team;
  const impact = event.positionDelta
    ? `${event.positionDelta > 0 ? "+" : ""}${event.positionDelta} pos`
    : event.severity === "major"
      ? tt("event_major")
      : tt("event_ambience");
  return {
    icon: event.tags.includes("weather") || event.type === "weather_change" ? "🌦" : event.cardId ? "◆" : event.positionDelta > 0 ? "↗" : "•",
    context,
    team,
    text: eventReplayText(event, names, tt),
    impact
  };
}

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
  const [live, setLive] = useState<{ lap: number; segment: RaceSegment }>({ lap: 1, segment: RACE_SEGMENTS[0] });
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
  const playerCar = cars.find((car) => car.player) ?? cars[0];
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
      updateLive(clock.current);
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
    updateLive(clock.current);
  }

  function restart() {
    seek(0);
    setPlaying(true);
  }

  function updateLive(time: number) {
    const progress = replayEnd > 0 ? time / replayEnd : 0;
    const segment = RACE_SEGMENTS[Math.min(RACE_SEGMENTS.length - 1, Math.floor(progress * RACE_SEGMENTS.length))] ?? RACE_SEGMENTS[0];
    const lapDuration = playerCar?.duration || replayEnd / circuit.laps || 1;
    const lap = Math.min(circuit.laps, Math.floor(time / lapDuration) + 1);
    setLive((current) => (current.lap === lap && current.segment === segment ? current : { lap, segment }));
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
  const liveWeather = result.resolvedWeather[live.segment];

  return (
    <div className="view-stack">
      <div className="replay-main-grid">
        <div className="replay-content-column">
          <section className="panel replay-copy-panel">
            <h2>{tt("result_replay_title")}</h2>
            <p className="replay-explainer">{tt("result_replay_explainer")}</p>
          </section>

          <CircuitMap
            className="replay-map-panel"
            circuit={circuit}
            tt={tt}
            cars={cars}
            svgRef={svgRef}
            showHeading={false}
            framed={false}
            showTraits={false}
            overlay={
              <>
                <div className="map-status">
                  <span className="circuit-city">
                    {countryFlag(circuit.country)} {circuit.city}
                  </span>
                  <strong>{tt(circuit.layoutKey)}</strong>
                  <small>
                    {tt("unit_lap")} {live.lap}/{circuit.laps} · {WEATHER_ICONS[liveWeather]}{" "}
                    {tt(`weather_${liveWeather}` as TranslationKey)}
                  </small>
                </div>
                <MapTraitsPanel traits={liveTraits(circuit.traits, liveWeather, live.lap)} tt={tt} />
                <div className="replay-map-controls">
                  <button
                    type="button"
                    aria-label={playing ? tt("action_pause") : tt("action_play")}
                    title={playing ? tt("action_pause") : tt("action_play")}
                    onClick={() => (!playing && clock.current >= replayEnd ? restart() : setPlaying(!playing))}
                  >
                    {playing ? "⏸" : "▶"}
                  </button>
                  <button type="button" aria-label={tt("action_replay_restart")} title={tt("action_replay_restart")} onClick={restart}>
                    ↻
                  </button>
                  <select aria-label={tt("replay_speed")} value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
                    <option value={0.5}>×0.5</option>
                    <option value={1}>×1</option>
                    <option value={2}>×2</option>
                    <option value={4}>×4</option>
                  </select>
                </div>
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
        </div>

        <section className="panel replay-moments-panel">
          <h3>{tt("result_key_moments")}</h3>
          {keyMoments.length ? (
            <ul className="events replay-timeline">
              {keyMoments.map((event) => (
                <li key={event.id} className={event.teamId === playerTeamId ? "player-event" : undefined}>
                  {(() => {
                    const card = momentCard(event, names, tt);
                    return (
                      <button type="button" className="replay-moment-button" title={card.text} onClick={() => seek((event.lap / maxLap) * replayEnd)}>
                        <span className="lap-marker">L{event.lap}</span>
                        <span className="moment-main">
                          <strong>
                            {card.icon} {card.context}
                          </strong>
                          <small>{card.team || card.text}</small>
                        </span>
                        <span className="moment-impact">{card.impact}</span>
                      </button>
                    );
                  })()}
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
