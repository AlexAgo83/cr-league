import { RACE_SEGMENTS, type RaceResult, type RaceSegment, type ReplayTracePoint, type TeamLivery, type Weather } from "@cr-league/shared";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { countryFlag, type CityCircuit } from "../app/circuits.js";
import { eventReplayText, teamNamesFromResult, type Translator } from "../app/helpers.js";
import type { RaceEvent } from "../app/helpers.js";
import { CircuitMap, MapTraitsPanel, circuitDisplayLength, type MapCar, type MapTraitImpacts, type MapTraitStats } from "./CircuitMap.js";

const WEATHER_ICONS = { dry: "☀️", light_rain: "🌦️", heavy_rain: "⛈️" } as const;
const EMPTY_TRACE_POINT: ReplayTracePoint = { segment: "start", lap: 1, progress: 0, order: [], times: {}, gaps: {} };
const START_HOLD_SECONDS = 1;
const FINISH_HOLD_SECONDS = 1;
const REPLAY_SPEED_KEY = "cr-league-replay-speed";
const REPLAY_FOCUS_KEY = "cr-league-replay-focus";
const REPLAY_SPEEDS = [0.5, 1, 2, 4] as const;
const REFERENCE_REPLAY_DISTANCE_PIXELS = 9_000;

function savedReplaySpeed() {
  const saved = Number(localStorage.getItem(REPLAY_SPEED_KEY));
  return REPLAY_SPEEDS.includes(saved as (typeof REPLAY_SPEEDS)[number]) ? saved : 1;
}

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

function fallbackReplayTrace(result: RaceResult): ReplayTracePoint[] {
  return [
    {
      segment: "start",
      lap: 1,
      progress: 0,
      order: [...result.classification].sort((left, right) => left.position + left.positionChange - (right.position + right.positionChange)).map((entry) => entry.teamId),
      times: Object.fromEntries(result.classification.map((entry) => [entry.teamId, Math.max(0, entry.position + entry.positionChange - 1)])),
      gaps: Object.fromEntries(result.classification.map((entry) => [entry.teamId, Math.max(0, entry.position + entry.positionChange - 1)]))
    },
    {
      segment: "finish",
      lap: 5,
      progress: 1,
      order: result.classification.map((entry) => entry.teamId),
      times: Object.fromEntries(result.classification.map((entry, index) => [entry.teamId, index])),
      gaps: Object.fromEntries(result.classification.map((entry, index) => [entry.teamId, index]))
    }
  ];
}

function tracePointAt(trace: ReplayTracePoint[], progress: number) {
  return [...trace].reverse().find((point) => point.progress <= progress) ?? trace[0] ?? EMPTY_TRACE_POINT;
}

function traceGapsAt(trace: ReplayTracePoint[], progress: number) {
  const from = tracePointAt(trace, progress);
  const to = trace.find((point) => point.progress > progress) ?? from;
  const span = to.progress - from.progress || 1;
  const ratio = Math.min(1, Math.max(0, (progress - from.progress) / span));
  return Object.fromEntries(
    Object.keys({ ...from.gaps, ...to.gaps }).map((teamId) => [
      teamId,
      (from.gaps[teamId] ?? 0) + ((to.gaps[teamId] ?? 0) - (from.gaps[teamId] ?? 0)) * ratio
    ])
  );
}

function raceProgressAt(time: number, raceDuration: number) {
  return raceDuration > 0 ? Math.min(1, Math.max(0, (time - START_HOLD_SECONDS) / raceDuration)) : 1;
}

export function displayLapAtProgress(progress: number, laps: number) {
  return Math.max(1, Math.min(laps, Math.round(1 + Math.max(0, Math.min(1, progress)) * (laps - 1))));
}

export function segmentAtProgress(progress: number): RaceSegment {
  const index = Math.min(RACE_SEGMENTS.length - 1, Math.floor(Math.max(0, Math.min(1, progress)) * RACE_SEGMENTS.length));
  return RACE_SEGMENTS[index] ?? "start";
}

export function finishTimes(result: RaceResult, trace: ReplayTracePoint[]) {
  const final = trace.at(-1);
  const leaderTime = Math.min(...result.classification.map((entry) => final?.times[entry.teamId] ?? Number.POSITIVE_INFINITY));
  const hasTraceTimes = Number.isFinite(leaderTime) && leaderTime > 0;
  const fallbackLeader = hasTraceTimes ? leaderTime : 14;
  const times = Object.fromEntries(
    result.classification.map((entry) => {
      const finalTime = final?.times[entry.teamId];
      return [entry.teamId, hasTraceTimes && finalTime && finalTime > 0 ? finalTime : fallbackLeader + (final?.gaps[entry.teamId] ?? entry.position - 1)];
    })
  );
  return {
    leader: Math.min(...Object.values(times)),
    last: Math.max(...Object.values(times)),
    times
  };
}

export function replayDistanceScale(circuit: CityCircuit) {
  return (circuitDisplayLength(circuit) * circuit.laps) / REFERENCE_REPLAY_DISTANCE_PIXELS;
}

function circuitLengthMeters(circuit: Pick<CityCircuit, "route">) {
  return circuit.route.slice(0, -1).reduce((sum, point, index) => {
    const next = circuit.route[index + 1]!;
    const metersPerLng = 111_320 * Math.cos((((point.lat + next.lat) / 2) * Math.PI) / 180);
    return sum + Math.hypot((point.lng - next.lng) * metersPerLng, (point.lat - next.lat) * 111_320);
  }, 0);
}

export function scaleFinishTimes(times: ReturnType<typeof finishTimes>, scale: number) {
  return {
    leader: times.leader * scale,
    last: times.last * scale,
    times: Object.fromEntries(Object.entries(times.times).map(([teamId, time]) => [teamId, time * scale]))
  };
}

function liveClassification(result: RaceResult, trace: ReplayTracePoint[], progress: number): RaceResult["classification"] {
  const from = tracePointAt(trace, progress);
  const gaps = traceGapsAt(trace, progress);
  return [...result.classification].sort((left, right) => {
    return (gaps[left.teamId] ?? 0) - (gaps[right.teamId] ?? 0) || from.order.indexOf(left.teamId) - from.order.indexOf(right.teamId) || left.position - right.position;
  });
}

function carProgressAt(result: RaceResult, trace: ReplayTracePoint[], progress: number, laps: number) {
  const gaps = traceGapsAt(trace, progress);
  const finalTimes = trace.at(-1)?.times ?? {};
  const totalTime = Math.max(1, ...Object.values(finalTimes));
  return Object.fromEntries(
    result.classification.map((entry) => {
      const raceLaps = progress * laps - ((gaps[entry.teamId] ?? 0) / totalTime) * laps;
      return [entry.teamId, Math.max(0, raceLaps)];
    })
  );
}

export function carProgressAtRaceTime(result: RaceResult, times: Record<string, number>, raceTime: number, laps: number) {
  return Object.fromEntries(
    result.classification.map((entry) => {
      const finishTime = Math.max(1, times[entry.teamId] ?? 1);
      return [entry.teamId, Math.min(laps, Math.max(0, (raceTime / finishTime) * laps))];
    })
  );
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
  teamLiveries = {},
  traitImpacts = {},
  tt
}: {
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  teamLiveries?: Record<string, TeamLivery>;
  traitImpacts?: MapTraitImpacts;
  tt: Translator;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const clock = useRef(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(savedReplaySpeed);
  const [driverFocus, setDriverFocus] = useState(() => localStorage.getItem(REPLAY_FOCUS_KEY) === "1");
  const replayTrace = result.replayTrace?.length ? result.replayTrace : fallbackReplayTrace(result);
  const [live, setLive] = useState<{ lap: number; segment: RaceSegment }>({ lap: 1, segment: RACE_SEGMENTS[0] });
  const [liveTower, setLiveTower] = useState(() => liveClassification(result, replayTrace, 0));
  const [carProgress, setCarProgress] = useState(() => carProgressAt(result, replayTrace, 0, circuit.laps));
  const names = teamNamesFromResult(result);
  const field = result.classification;
  const replayTimes = scaleFinishTimes(finishTimes(result, replayTrace), replayDistanceScale(circuit));
  const cars: MapCar[] = field.map((entry, index) => ({
    id: entry.teamId,
    label: String(Math.max(1, liveTower.findIndex((team) => team.teamId === entry.teamId) + 1)),
    player: entry.teamId === playerTeamId,
    delay: 0,
    duration: replayTimes.times[entry.teamId] ?? replayTimes.leader + index,
    progress: carProgress[entry.teamId] ?? 0,
    livery: teamLiveries[entry.teamId]
  }));
  const playerCar = cars.find((car) => car.player) ?? cars[0];
  const circuitDistance = `${(circuitLengthMeters(circuit) / 1000).toFixed(1)} km`;
  const raceDuration = replayTimes.leader;
  const lastFinishTime = replayTimes.last;
  const replayEnd = START_HOLD_SECONDS + lastFinishTime + FINISH_HOLD_SECONDS;
  const raceTimeAtProgress = (progress: number) => START_HOLD_SECONDS + progress * raceDuration;
  const replayPercentAtRaceProgress = (progress: number) => (raceTimeAtProgress(progress) / replayEnd) * 100;

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

  useEffect(() => {
    localStorage.setItem(REPLAY_SPEED_KEY, String(speed));
  }, [speed]);

  useEffect(() => {
    localStorage.setItem(REPLAY_FOCUS_KEY, driverFocus ? "1" : "0");
  }, [driverFocus]);

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
    const progress = raceProgressAt(time, raceDuration);
    const raceTime = Math.max(0, time - START_HOLD_SECONDS);
    const displayLap = displayLapAtProgress(progress, circuit.laps);
    const segment = segmentAtProgress(progress);
    setLive((current) => (current.lap === displayLap && current.segment === segment ? current : { lap: displayLap, segment }));
    setCarProgress(carProgressAtRaceTime(result, replayTimes.times, raceTime, circuit.laps));
    const nextTower = liveClassification(result, replayTrace, progress);
    setLiveTower((current) => (current.map((entry) => entry.teamId).join("|") === nextTower.map((entry) => entry.teamId).join("|") ? current : nextTower));
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
  const markerByLap = new Map<number, { texts: string[]; player: boolean; time: number }>();
  for (const event of keyMoments.filter((event) => event.severity === "major" || event.teamId === playerTeamId)) {
    const progress = event.lap / maxLap;
    const displayLap = displayLapAtProgress(progress, circuit.laps);
    const marker = markerByLap.get(displayLap) ?? { texts: [], player: false, time: raceTimeAtProgress(progress) };
    marker.texts.push(`${tt("unit_lap")} ${displayLap} · ${eventReplayText(event, names, tt)}`);
    marker.player ||= event.teamId === playerTeamId;
    marker.time = Math.min(marker.time, raceTimeAtProgress(progress));
    markerByLap.set(displayLap, marker);
  }
  const markers = [...markerByLap.entries()].map(([lap, marker]) => ({
    lap,
    left: `${Math.min(96, Math.max(3, (marker.time / replayEnd) * 100))}%`,
    time: marker.time,
    title: marker.texts.join("\n"),
    player: marker.player
  }));
  const liveWeather = result.resolvedWeather[live.segment];

  return (
    <div className="view-stack">
      <div className="replay-main-grid">
        <div className="replay-content-column">
          <section className="panel race-context-panel replay-copy-panel">
            <h2>{tt("result_replay_title")}</h2>
            <p>{tt("result_replay_explainer")}</p>
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
            camera={{ enabled: driverFocus, car: playerCar, timeRef: clock }}
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
                  <small>{circuitDistance}</small>
                </div>
                <MapTraitsPanel traits={liveTraits(circuit.traits, liveWeather, live.lap)} impacts={traitImpacts} tt={tt} />
                <div className="replay-map-controls">
                  <button
                    type="button"
                    className={playing ? "replay-playback-button playing" : "replay-playback-button paused"}
                    aria-label={playing ? tt("action_pause") : tt("action_play")}
                    title={playing ? tt("action_pause") : tt("action_play")}
                    onClick={() => (!playing && clock.current >= replayEnd ? restart() : setPlaying(!playing))}
                  >
                    {playing ? "⏸" : "▶"}
                  </button>
                  <button type="button" aria-label={tt("action_replay_restart")} title={tt("action_replay_restart")} onClick={restart}>
                    ↻
                  </button>
                  <button
                    type="button"
                    aria-label="Focus driver"
                    title="Focus driver"
                    className={driverFocus ? "replay-focus-button active" : "replay-focus-button"}
                    onClick={() => setDriverFocus(!driverFocus)}
                  >
                    <svg className="replay-focus-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M8 4H6a2 2 0 0 0-2 2v2" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                      <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
                      <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <select aria-label={tt("replay_speed")} value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
                    {REPLAY_SPEEDS.map((option) => (
                      <option key={option} value={option}>
                        ×{option}
                      </option>
                    ))}
                  </select>
                </div>
                <ol className="replay-tower">
                  {liveTower.map((entry, index) => (
                    <li key={entry.teamId} className={entry.teamId === playerTeamId ? "player" : undefined}>
                      <span
                        className="replay-tower-livery"
                        aria-label={`P${index + 1}`}
                        style={
                          {
                            "--livery-primary": teamLiveries[entry.teamId]?.primary ?? "#38bdf8",
                            "--livery-secondary": teamLiveries[entry.teamId]?.secondary ?? "#16c784"
                          } as CSSProperties & Record<string, string>
                        }
                      >
                        {index + 1}
                      </span>
                      <span className="replay-tower-team">{entry.teamName}</span>
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
                    <span key={segment} className="replay-tick" style={{ left: `${replayPercentAtRaceProgress((index + 1) / RACE_SEGMENTS.length)}%` }} />
                  ))}
                  {RACE_SEGMENTS.map((segment, index) => (
                    <span
                      key={segment}
                      className="replay-weather"
                      style={{ left: `${replayPercentAtRaceProgress((index + 0.5) / RACE_SEGMENTS.length)}%` }}
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
                      <button type="button" className="replay-moment-button" title={card.text} onClick={() => seek(raceTimeAtProgress(event.lap / maxLap))}>
                        <span className="lap-marker">L{displayLapAtProgress(event.lap / maxLap, circuit.laps)}</span>
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
