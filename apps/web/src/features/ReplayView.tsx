import { RACE_SEGMENTS, type RaceResult, type RaceSegment, type ReplayTracePoint, type TeamLivery, type Weather } from "@cr-league/shared";
import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import { eventReplayText, teamNamesFromResult, type Translator } from "../app/helpers.js";
import type { RaceEvent } from "../app/helpers.js";
import { CircuitMap, MapTraitsPanel, circuitDisplayLength, type MapCar, type MapTraitImpacts, type MapTraitStats } from "./CircuitMap.js";
import { CountryBadge, VisualIcon, type VisualIconName } from "./VisualIcon.js";
const EMPTY_TRACE_POINT: ReplayTracePoint = { segment: "start", lap: 1, progress: 0, order: [], times: {}, gaps: {} };
const START_HOLD_SECONDS = 1;
const FINISH_HOLD_SECONDS = 1;
export const REPLAY_SPEED_KEY = "cr-league-replay-speed";
export const REPLAY_FOCUS_KEY = "cr-league-replay-focus";
export const DISMISSED_REPLAY_HELP_KEY = "cr-league-dismissed-replay-help";
const REPLAY_SPEEDS = [0.5, 1, 2, 4] as const;
const REFERENCE_REPLAY_DISTANCE_PIXELS = 9_000;
const POSITION_CHANGE_MARGIN_LAPS = 0.015;
const TRACE_ORDER_GAP_LAPS = 0.035;
const MIN_RANK_TRANSITION_PROGRESS = 0.08;
const MAX_VISUAL_PROGRESS_STEP = 0.012;
const MOMENT_NOTIFICATION_SECONDS = 3;
type ReplayTowerEntry = { id?: string; teamId: string; teamName: string; value: string };
type ReplaySpeed = (typeof REPLAY_SPEEDS)[number];

function savedReplaySpeed(): ReplaySpeed {
  const saved = Number(localStorage.getItem(REPLAY_SPEED_KEY));
  return REPLAY_SPEEDS.includes(saved as ReplaySpeed) ? (saved as ReplaySpeed) : 1;
}

function ReplaySpeedMenu({ speed, setSpeed, tt }: { speed: ReplaySpeed; setSpeed: (speed: ReplaySpeed) => void; tt: Translator }) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <div className="replay-speed-menu" onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        className={open ? "replay-speed-trigger active" : "replay-speed-trigger"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${tt("replay_speed")} ×${speed}`}
        onClick={() => setOpen((current) => !current)}
      >
        ×{speed}
      </button>
      {open ? (
        <div id={listId} className="replay-speed-options" role="listbox" aria-label={tt("replay_speed")}>
          {REPLAY_SPEEDS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === speed}
              className={option === speed ? "selected" : undefined}
              onClick={() => {
                setSpeed(option);
                setOpen(false);
              }}
            >
              ×{option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
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

function traceRankTargetsAt(trace: ReplayTracePoint[], progress: number) {
  const transition = trace.slice(1).map((point, index) => ({ from: trace[index]!, to: point })).find(({ from, to }) => {
    const span = Math.max(to.progress - from.progress, MIN_RANK_TRANSITION_PROGRESS);
    return !sameOrder(from.order, to.order) && progress >= from.progress && progress < Math.min(1, from.progress + span);
  });
  const from = transition?.from ?? tracePointAt(trace, progress);
  const to = transition?.to ?? from;
  const span = transition ? Math.max(to.progress - from.progress, MIN_RANK_TRANSITION_PROGRESS) : 1;
  const ratio = Math.min(1, Math.max(0, (progress - from.progress) / span));
  const eased = ratio * ratio * (3 - 2 * ratio);
  return Object.fromEntries(
    Array.from(new Set([...from.order, ...to.order])).map((teamId) => {
      const fromRank = Math.max(0, from.order.indexOf(teamId));
      const toRank = Math.max(0, to.order.indexOf(teamId));
      return [teamId, fromRank + (toRank - fromRank) * eased];
    })
  );
}

function sameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((teamId, index) => teamId === right[index]);
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

export function liveClassificationByCarProgress(
  result: RaceResult,
  trace: ReplayTracePoint[],
  progress: number,
  carProgress: Record<string, number>,
  currentOrder: string[] = []
): RaceResult["classification"] {
  if (progress >= 1) return result.classification;
  const traceOrder = tracePointAt(trace, progress).order;
  const stableOrder = new Map((currentOrder.length ? currentOrder : traceOrder).map((teamId, index) => [teamId, index]));
  return [...result.classification].sort((left, right) => {
    const progressDiff = (carProgress[right.teamId] ?? 0) - (carProgress[left.teamId] ?? 0);
    return Math.abs(progressDiff) > POSITION_CHANGE_MARGIN_LAPS
      ? progressDiff
      : (stableOrder.get(left.teamId) ?? 999) - (stableOrder.get(right.teamId) ?? 999) || left.position - right.position;
  });
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

export function carProgressAtTrace(result: RaceResult, trace: ReplayTracePoint[], progress: number, laps: number) {
  const gaps = traceGapsAt(trace, progress);
  const rankTargets = traceRankTargetsAt(trace, progress);
  const finalTimes = trace.at(-1)?.times ?? {};
  const totalTime = Math.max(1, ...Object.values(finalTimes));
  return Object.fromEntries(
    result.classification.map((entry) => {
      const timeGap = ((gaps[entry.teamId] ?? 0) / totalTime) * laps;
      const orderGap = (rankTargets[entry.teamId] ?? 0) * TRACE_ORDER_GAP_LAPS;
      const raceLaps = progress * laps - Math.max(timeGap, orderGap);
      return [entry.teamId, Math.max(0, raceLaps)];
    })
  );
}

function replaySnapshot(
  result: RaceResult,
  trace: ReplayTracePoint[],
  replayTimes: ReturnType<typeof scaleFinishTimes>,
  raceTime: number,
  progress: number,
  laps: number,
  currentOrder: string[] = []
) {
  const carProgress = progress >= 1 ? carProgressAtRaceTime(result, replayTimes.times, raceTime, laps) : carProgressAtTrace(result, trace, progress, laps);
  const tower = liveClassificationByCarProgress(result, trace, progress, carProgress, currentOrder);
  return { carProgress, tower };
}

export function smoothCarProgress(current: Record<string, number>, target: Record<string, number>) {
  return Object.fromEntries(
    Object.keys({ ...current, ...target }).map((teamId) => {
      const to = target[teamId] ?? 0;
      const from = current[teamId] ?? to;
      if (to < from) return [teamId, from];
      const delta = to - from;
      if (Math.abs(delta) <= MAX_VISUAL_PROGRESS_STEP) return [teamId, to];
      return [teamId, from + Math.sign(delta) * MAX_VISUAL_PROGRESS_STEP];
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
  const icon: VisualIconName = event.tags.includes("weather") || event.type === "weather_change" ? "light_rain" : event.cardId ? "card" : event.positionDelta > 0 ? "position" : "dot";
  return {
    icon,
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
  titleKey = "result_replay_title",
  explainerKey = "result_replay_explainer",
  towerEntries,
  preferencesResetSignal = 0,
  onClose,
  closeLabel,
  tt
}: {
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  teamLiveries?: Record<string, TeamLivery>;
  traitImpacts?: MapTraitImpacts;
  titleKey?: TranslationKey;
  explainerKey?: TranslationKey;
  towerEntries?: ReplayTowerEntry[];
  preferencesResetSignal?: number;
  onClose?: () => void;
  closeLabel?: string;
  tt: Translator;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const clock = useRef(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<ReplaySpeed>(savedReplaySpeed);
  const [driverFocus, setDriverFocus] = useState(() => localStorage.getItem(REPLAY_FOCUS_KEY) !== "0");
  const [copyDismissed, setCopyDismissed] = useState(() => localStorage.getItem(DISMISSED_REPLAY_HELP_KEY) === "1");
  const replayTrace = result.replayTrace?.length ? result.replayTrace : fallbackReplayTrace(result);
  const replayTimes = scaleFinishTimes(finishTimes(result, replayTrace), replayDistanceScale(circuit));
  const initialSnapshot = replaySnapshot(result, replayTrace, replayTimes, 0, 0, circuit.laps);
  const [live, setLive] = useState<{ lap: number; segment: RaceSegment }>({ lap: 1, segment: RACE_SEGMENTS[0] });
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const snapshotRef = useRef(initialSnapshot);
  const [positionPops, setPositionPops] = useState<Record<string, { delta: number; key: number }>>({});
  const orderRef = useRef(initialSnapshot.tower.map((entry) => entry.teamId));
  const positionPopTimers = useRef<number[]>([]);
  const names = teamNamesFromResult(result);
  const field = result.classification;
  const cars: MapCar[] = field.map((entry, index) => ({
    id: entry.teamId,
    label: String(Math.max(1, snapshot.tower.findIndex((team) => team.teamId === entry.teamId) + 1)),
    player: entry.teamId === playerTeamId,
    delay: 0,
    duration: replayTimes.times[entry.teamId] ?? replayTimes.leader + index,
    progress: snapshot.carProgress[entry.teamId] ?? 0,
    livery: teamLiveries[entry.teamId],
    positionDelta: positionPops[entry.teamId]?.delta,
    positionDeltaKey: positionPops[entry.teamId]?.key
  }));
  const playerCar = cars.find((car) => car.player) ?? cars[0];
  const tower: ReplayTowerEntry[] = towerEntries ?? snapshot.tower.map((entry) => ({ teamId: entry.teamId, teamName: entry.teamName, value: "" }));
  const circuitDistance = `${(circuitLengthMeters(circuit) / 1000).toFixed(1)} km`;
  const raceDuration = replayTimes.leader;
  const lastFinishTime = replayTimes.last;
  const replayEnd = START_HOLD_SECONDS + lastFinishTime + FINISH_HOLD_SECONDS;
  const raceTimeAtProgress = (progress: number) => START_HOLD_SECONDS + progress * raceDuration;
  const replayPercentAtRaceProgress = (progress: number) => (raceTimeAtProgress(progress) / replayEnd) * 100;
  snapshotRef.current = snapshot;

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
      if (rangeRef.current) rangeRef.current.value = String(clock.current);
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
    if (speed === 1) localStorage.removeItem(REPLAY_SPEED_KEY);
    else localStorage.setItem(REPLAY_SPEED_KEY, String(speed));
  }, [speed]);

  useEffect(() => {
    if (driverFocus) localStorage.removeItem(REPLAY_FOCUS_KEY);
    else localStorage.setItem(REPLAY_FOCUS_KEY, "0");
  }, [driverFocus]);

  useEffect(() => {
    setSpeed(savedReplaySpeed());
    setDriverFocus(localStorage.getItem(REPLAY_FOCUS_KEY) !== "0");
    setCopyDismissed(localStorage.getItem(DISMISSED_REPLAY_HELP_KEY) === "1");
  }, [preferencesResetSignal]);

  useEffect(() => () => positionPopTimers.current.forEach(window.clearTimeout), []);

  function seek(time: number) {
    clock.current = Math.max(0, Math.min(time, replayEnd));
    svgRef.current?.setCurrentTime?.(clock.current);
    if (progressRef.current) progressRef.current.style.width = `${(clock.current / replayEnd) * 100}%`;
    if (rangeRef.current) rangeRef.current.value = String(clock.current);
    positionPopTimers.current.forEach(window.clearTimeout);
    positionPopTimers.current = [];
    setPositionPops({});
    updateLive(clock.current, false);
  }

  function restart() {
    setPositionPops({});
    seek(0);
    setPlaying(true);
  }

  function updateLive(time: number, animatePositions = true) {
    setActiveMomentId(activeMomentIdAt(time));
    const progress = raceProgressAt(time, raceDuration);
    const raceTime = Math.max(0, time - START_HOLD_SECONDS);
    const displayLap = displayLapAtProgress(progress, circuit.laps);
    const segment = segmentAtProgress(progress);
    setLive((current) => (current.lap === displayLap && current.segment === segment ? current : { lap: displayLap, segment }));
    const targetSnapshot = replaySnapshot(result, replayTrace, replayTimes, raceTime, progress, circuit.laps, orderRef.current);
    const carProgress = animatePositions ? smoothCarProgress(snapshotRef.current.carProgress, targetSnapshot.carProgress) : targetSnapshot.carProgress;
    const nextTower = liveClassificationByCarProgress(result, replayTrace, progress, carProgress, orderRef.current);
    const nextSnapshot = { carProgress, tower: nextTower };
    const nextOrder = nextTower.map((entry) => entry.teamId);
    if (orderRef.current.join("|") !== nextOrder.join("|")) {
      if (animatePositions) {
        const deltas = positionDeltas(orderRef.current, nextOrder);
        const key = Math.round(time * 1000);
        const pops = Object.fromEntries(Object.entries(deltas).map(([teamId, delta]) => [teamId, { delta, key }]));
        setPositionPops((current) => ({ ...current, ...pops }));
        for (const teamId of Object.keys(pops)) {
          positionPopTimers.current.push(
            window.setTimeout(() => {
              setPositionPops((current) => (current[teamId]?.key === key ? Object.fromEntries(Object.entries(current).filter(([id]) => id !== teamId)) : current));
            }, 1100)
          );
        }
      }
      orderRef.current = nextOrder;
    }
    snapshotRef.current = nextSnapshot;
    setSnapshot(nextSnapshot);
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
  const activeMoment = keyMoments.find((event) => event.id === activeMomentId);
  const activeMomentCard = activeMoment ? momentCard(activeMoment, names, tt) : null;

  function eventTime(event: RaceEvent) {
    return raceTimeAtProgress(event.lap / maxLap);
  }

  function activeMomentIdAt(time: number) {
    return keyMoments.find((event) => Math.abs(eventTime(event) - time) <= MOMENT_NOTIFICATION_SECONDS)?.id ?? null;
  }

  return (
    <div className="view-stack">
      <div className="replay-main-grid">
        <div className="replay-content-column">
          {copyDismissed ? null : (
            <section className="panel race-context-panel replay-copy-panel">
              <h2>{tt(titleKey)}</h2>
              <p>{tt(explainerKey)}</p>
              <button
                type="button"
                className="context-panel-close"
                aria-label={`${tt("action_close")} ${tt(titleKey)}`}
                onClick={() => {
                  localStorage.setItem(DISMISSED_REPLAY_HELP_KEY, "1");
                  setCopyDismissed(true);
                }}
              >
                ×
              </button>
            </section>
          )}

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
                    <CountryBadge country={circuit.country} /> {circuit.city}
                  </span>
                  <strong>{tt(circuit.layoutKey)}</strong>
                  <small>
                    {tt("unit_lap")} {live.lap}/{circuit.laps}
                  </small>
                  <small className="map-weather-readout">
                    <VisualIcon name={liveWeather} />
                    <span>{tt(`weather_${liveWeather}` as TranslationKey)}</span>
                  </small>
                  <small>{circuitDistance}</small>
                </div>
                <MapTraitsPanel traits={liveTraits(circuit.traits, liveWeather, live.lap)} impacts={traitImpacts} tt={tt} />
                {activeMoment && activeMomentCard ? (
                  <div className={activeMoment.teamId === playerTeamId ? "replay-moment-notification player" : "replay-moment-notification"} role="status" aria-live="polite">
                    <span className="lap-marker">L{displayLapAtProgress(activeMoment.lap / maxLap, circuit.laps)}</span>
                    <span className="moment-main">
                      <strong>
                        <VisualIcon name={activeMomentCard.icon} /> {activeMomentCard.context}
                      </strong>
                      <small>{activeMomentCard.team || activeMomentCard.text}</small>
                    </span>
                    <span className="moment-impact">{activeMomentCard.impact}</span>
                  </div>
                ) : null}
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
                  <ReplaySpeedMenu speed={speed} setSpeed={setSpeed} tt={tt} />
                  {onClose ? (
                    <button type="button" className="replay-close-button" aria-label={closeLabel ?? tt("action_close")} title={closeLabel ?? tt("action_close")} onClick={onClose}>
                      ×
                    </button>
                  ) : null}
                </div>
                <ol className="replay-tower">
                  {tower.map((entry, index) => (
                    <li key={entry.id ?? entry.teamId} className={entry.teamId === playerTeamId ? "player" : undefined}>
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
                      {entry.value ? <span className="replay-tower-value">{entry.value}</span> : null}
                    </li>
                  ))}
                </ol>
                <div className="replay-progress">
                  <div ref={progressRef} className="replay-progress-fill" />
                  <input
                    ref={rangeRef}
                    type="range"
                    className="replay-progress-input"
                    aria-label={tt("replay_seek")}
                    min={0}
                    max={replayEnd}
                    step={replayEnd / 100}
                    defaultValue={0}
                    onChange={(event) => seek(Number(event.target.value))}
                  />
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
                      <VisualIcon name={result.resolvedWeather[segment]} />
                    </span>
                  ))}
                  {markers.map((marker) => (
                    <button
                      key={marker.lap}
                      type="button"
                      className={marker.player ? "replay-marker player" : "replay-marker"}
                      style={{ left: marker.left }}
                      title={marker.title}
                      aria-label={marker.title}
                      onClick={() => seek(marker.time)}
                    />
                  ))}
                </div>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
