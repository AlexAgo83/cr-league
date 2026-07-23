import { RACE_SEGMENTS, type RaceResult, type RaceSegment } from "@cr-league/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { safeStorage } from "../../app/appStorage.js";
import { REPLAY_SPEED_KEY } from "./replayMath.js";

export type ReplayClockSnapshot = {
  carProgress: Record<string, number>;
  tower: RaceResult["classification"];
};
export type ReplaySpeed = 1 | 2 | 4;
const REPLAY_SPEED_MULTIPLIER = 2;
export const REPLAY_STATE_UPDATE_SECONDS = 0.1;
const REPLAY_SPEEDS: ReplaySpeed[] = [1, 2, 4];

type ReplayClockOptions = {
  initialSnapshot: ReplayClockSnapshot;
  initialOrder: string[];
  replayEnd: number;
  raceDuration: number;
  laps: number;
  smoothTracePositions: boolean;
  resultSeed: string;
  titleKey: string;
  initialLap?: number;
  preferencesResetSignal?: number;
  startHoldSeconds: number;
  getActiveMomentId: (time: number) => string | null;
  getOrderAtProgress: (progress: number) => string[];
  createTargetSnapshot: (raceTime: number, progress: number, currentOrder: string[]) => ReplayClockSnapshot;
  createTower: (progress: number, carProgress: Record<string, number>, currentOrder: string[]) => ReplayClockSnapshot["tower"];
  smoothCarProgress: (current: Record<string, number>, target: Record<string, number>, elapsedSeconds: number) => Record<string, number>;
  displayLapAtProgress: (progress: number, laps: number) => number;
  segmentAtProgress: (progress: number) => RaceSegment;
};

export function replayProgressAt(time: number, raceDuration: number, startHoldSeconds: number) {
  return raceDuration > 0 ? Math.min(1, Math.max(0, (time - startHoldSeconds) / raceDuration)) : 1;
}

export function shouldPublishReplayState(lastPublishedTime: number, time: number) {
  return time - lastPublishedTime >= REPLAY_STATE_UPDATE_SECONDS;
}

export function useReplayClock({
  initialSnapshot,
  initialOrder,
  replayEnd,
  raceDuration,
  laps,
  smoothTracePositions,
  resultSeed,
  titleKey,
  initialLap,
  preferencesResetSignal,
  startHoldSeconds,
  getActiveMomentId,
  getOrderAtProgress,
  createTargetSnapshot,
  createTower,
  smoothCarProgress,
  displayLapAtProgress,
  segmentAtProgress
}: ReplayClockOptions) {
  const svgRef = useRef<SVGSVGElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const clock = useRef(0);
  const scrubbingRef = useRef(false);
  const snapshotRef = useRef(initialSnapshot);
  const carProgressRef = useRef(initialSnapshot.carProgress);
  const orderRef = useRef(initialOrder);
  const lastPublishedTimeRef = useRef(Number.NEGATIVE_INFINITY);
  const positionPopTimers = useRef<number[]>([]);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [playing, setPlaying] = useState(!reduceMotion);
  const [speed, setSpeed] = useState<ReplaySpeed>(() => savedReplaySpeed());
  const [live, setLive] = useState<{ lap: number; segment: RaceSegment }>({ lap: 1, segment: RACE_SEGMENTS[0] });
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const [positionPops, setPositionPops] = useState<Record<string, { delta: number; key: number }>>({});
  const currentRaceProgress = replayProgressAt(clock.current, raceDuration, startHoldSeconds);

  snapshotRef.current = snapshot;

  const updateLive = useCallback((time: number, animatePositions = true, elapsedSeconds = 1 / 60, publishState = true) => {
    const progress = replayProgressAt(time, raceDuration, startHoldSeconds);
    const raceTime = Math.max(0, time - startHoldSeconds);
    const targetSnapshot = createTargetSnapshot(raceTime, progress, orderRef.current);
    const carProgress = animatePositions && smoothTracePositions ? smoothCarProgress(snapshotRef.current.carProgress, targetSnapshot.carProgress, elapsedSeconds) : targetSnapshot.carProgress;
    carProgressRef.current = carProgress;
    const nextTower = publishState ? createTower(progress, carProgress, orderRef.current) : snapshotRef.current.tower;
    const nextSnapshot = { carProgress, tower: nextTower };
    const nextOrder = nextTower.map((entry) => entry.teamId);
    if (publishState && orderRef.current.join("|") !== nextOrder.join("|")) {
      if (animatePositions) {
        const deltas = positionDeltas(orderRef.current, nextOrder);
        const key = Math.round(time * 1000);
        const pops = Object.fromEntries(Object.entries(deltas).map(([teamId, delta]) => [teamId, { delta, key }]));
        setPositionPops((current) => ({ ...current, ...pops }));
        for (const teamId of Object.keys(pops)) {
          const timer = window.setTimeout(() => {
            positionPopTimers.current = positionPopTimers.current.filter((id) => id !== timer);
            setPositionPops((current) => (current[teamId]?.key === key ? Object.fromEntries(Object.entries(current).filter(([id]) => id !== teamId)) : current));
          }, 1100);
          positionPopTimers.current.push(timer);
        }
      }
      orderRef.current = nextOrder;
    }
    snapshotRef.current = nextSnapshot;
    if (publishState) {
      lastPublishedTimeRef.current = time;
      setActiveMomentId(getActiveMomentId(time));
      const displayLap = displayLapAtProgress(progress, laps);
      const segment = segmentAtProgress(progress);
      setLive((current) => (current.lap === displayLap && current.segment === segment ? current : { lap: displayLap, segment }));
      setSnapshot(nextSnapshot);
    }
  }, [createTargetSnapshot, createTower, displayLapAtProgress, getActiveMomentId, laps, raceDuration, segmentAtProgress, smoothCarProgress, smoothTracePositions, startHoldSeconds]);

  const seek = useCallback((time: number) => {
    clock.current = Math.max(0, Math.min(time, replayEnd));
    svgRef.current?.setCurrentTime?.(clock.current);
    if (progressRef.current) progressRef.current.style.width = `${(clock.current / replayEnd) * 100}%`;
    if (rangeRef.current) rangeRef.current.value = String(clock.current);
    positionPopTimers.current.forEach(window.clearTimeout);
    positionPopTimers.current = [];
    setPositionPops({});
    lastPublishedTimeRef.current = Number.NEGATIVE_INFINITY;
    const progress = replayProgressAt(clock.current, raceDuration, startHoldSeconds);
    orderRef.current = getOrderAtProgress(progress);
    updateLive(clock.current, false, 1 / 60, true);
  }, [getOrderAtProgress, raceDuration, replayEnd, startHoldSeconds, updateLive]);

  const restart = useCallback(() => {
    setPositionPops({});
    seek(0);
    setPlaying(!reduceMotion);
  }, [reduceMotion, seek]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg?.pauseAnimations) return;
    svg.pauseAnimations();
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now: number) {
      const replayDeltaSeconds = ((now - last) / 1000) * speed * REPLAY_SPEED_MULTIPLIER;
      clock.current = Math.min(clock.current + replayDeltaSeconds, replayEnd);
      last = now;
      svg.setCurrentTime(clock.current);
      if (progressRef.current) progressRef.current.style.width = `${(clock.current / replayEnd) * 100}%`;
      if (rangeRef.current && !scrubbingRef.current) rangeRef.current.value = String(clock.current);
      const publishState = clock.current >= replayEnd || shouldPublishReplayState(lastPublishedTimeRef.current, clock.current);
      updateLive(clock.current, true, replayDeltaSeconds, publishState);
      if (clock.current >= replayEnd) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, replayEnd, updateLive]);

  const setReplaySpeed = useCallback((nextSpeed: ReplaySpeed) => {
    safeStorage.set(REPLAY_SPEED_KEY, String(nextSpeed));
    setSpeed(nextSpeed);
  }, []);

  useEffect(() => {
    setSpeed(savedReplaySpeed());
  }, [preferencesResetSignal, resultSeed, titleKey]);

  useEffect(() => () => positionPopTimers.current.forEach(window.clearTimeout), []);

  useEffect(() => {
    if (!initialLap) return;
    seek((startHoldSeconds + (Math.max(0, Math.min(laps - 1, initialLap - 1)) / laps) * raceDuration));
  }, [initialLap, laps, raceDuration, seek, startHoldSeconds]);

  return {
    svgRef,
    carProgressRef,
    progressRef,
    rangeRef,
    clock,
    scrubbingRef,
    playing,
    setPlaying,
    speed,
    setSpeed: setReplaySpeed,
    live,
    snapshot,
    activeMomentId,
    positionPops,
    currentRaceProgress,
    reduceMotion,
    seek,
    restart
  };
}

function savedReplaySpeed(): ReplaySpeed {
  const saved = Number(safeStorage.get(REPLAY_SPEED_KEY));
  return REPLAY_SPEEDS.includes(saved as ReplaySpeed) ? saved as ReplaySpeed : 1;
}

function positionDeltas(currentOrder: string[], nextOrder: string[]) {
  return Object.fromEntries(
    nextOrder.flatMap((teamId, nextIndex) => {
      const currentIndex = currentOrder.indexOf(teamId);
      const delta = currentIndex - nextIndex;
      return currentIndex >= 0 && delta ? [[teamId, delta]] : [];
    })
  );
}
