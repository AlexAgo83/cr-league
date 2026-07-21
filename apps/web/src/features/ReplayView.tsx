import { type RaceDecision, type RaceResult, type TeamLivery } from "@cr-league/shared";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import { eventReplayText, teamNamesFromResult, type Translator } from "../app/helpers.js";
import type { RaceEvent } from "../app/helpers.js";
import { CircuitMap, type MapCar, type MapTraitImpacts } from "./CircuitMap.js";
import { PositionBadge } from "./PositionBadge.js";
import { ReplayStageOverlay } from "./replay/ReplayStageOverlay.js";
import type { ReplayTimelineMarker } from "./replay/ReplayProgress.js";
import { useReplayClock } from "./replay/useReplayClock.js";
import { momentCard } from "./replay/replayMoment.js";
export {
  DISMISSED_REPLAY_HELP_KEY,
  START_HOLD_SECONDS,
  FINISH_HOLD_SECONDS,
  MOMENT_NOTIFICATION_SECONDS,
  REPLAY_FOCUS_KEY,
  REPLAY_SPEED_KEY,
  buildReplayPlan,
  carProgressAtRaceTime,
  carProgressAtTrace,
  displayLapAtProgress,
  eventTraceProgress,
  finishTimes,
  liveClassificationByCarProgress,
  pitStopRaceProgress,
  pitStopTraceProgress,
  playerReplayContext,
  positionDeltas,
  replayDistanceScale,
  replayOrderAtProgress,
  replayPlanDebugLines,
  replayPlayerGapItems,
  scaleFinishTimes,
  segmentAtProgress,
  shouldSmoothReplayTrace,
  smoothCarProgress,
  traceGapsAt,
  traceTimesAt,
  type ReplayPlan
} from "./replay/replayMath.js";
export {
  buildQualifyingMomentEvents,
  buildRaceDirectorBeats,
  directorBeatCopy,
  type ReplayDirectorBeat
} from "./replay/replayDirector.js";
import {
  DISMISSED_REPLAY_HELP_KEY,
  START_HOLD_SECONDS,
  FINISH_HOLD_SECONDS,
  MOMENT_NOTIFICATION_SECONDS,
  buildReplayPlan,
  circuitLengthMeters,
  displayLapAtProgress,
  eventTraceProgress,
  finishTimes,
  liveClassificationByCarProgress,
  pitLapProgress,
  pitStopTraceProgress,
  playerReplayContext,
  replaySnapshot,
  replayDistanceScale,
  replayOrderAtProgress,
  replayPlayerGapItems,
  scaleFinishTimes,
  segmentAtProgress,
  shouldSmoothReplayTrace,
  smoothCarProgress,
  traceGapsAt,
  traceTimesAt,
  REPLAY_FOCUS_KEY
} from "./replay/replayMath.js";
import { buildQualifyingMomentEvents, buildRaceDirectorBeats, directorBeatCopy } from "./replay/replayDirector.js";
type ReplayPlanDecision = RaceDecision & { teamId: string };
type ReplayTowerEntry = { id?: string; teamId: string; teamName: string; value: string; decision?: RaceDecision };

function renderPositionBadges(text: string): ReactNode {
  return text.split(/(P\d+)/g).map((part, index) => {
    const match = /^P(\d+)$/.exec(part);
    return match ? <PositionBadge key={`${part}-${index}`} position={Number(match[1])} /> : part;
  });
}

export function ReplayView({
  result,
  circuit,
  playerTeamId,
  teamLiveries = {},
  traitImpacts = {},
  titleKey = "result_replay_title",
  explainerKey = "result_replay_explainer",
  showIntro = true,
  towerEntries,
  initialLap,
  preferencesResetSignal = 0,
  onOpenReport,
  onOpenPlanReport,
  onOpenPlan,
  onClose,
  closeLabel,
  overlayActions,
  towerReplacement,
  planDecisions,
  planDecision,
  afterMapContent,
  tt
}: {
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  teamLiveries?: Record<string, TeamLivery>;
  traitImpacts?: MapTraitImpacts;
  titleKey?: TranslationKey;
  explainerKey?: TranslationKey;
  showIntro?: boolean;
  towerEntries?: ReplayTowerEntry[];
  initialLap?: number;
  preferencesResetSignal?: number;
  onOpenReport?: () => void;
  onOpenPlanReport?: () => void;
  onOpenPlan?: () => void;
  onClose?: () => void;
  closeLabel?: string;
  overlayActions?: ReactNode;
  towerReplacement?: ReactNode;
  planDecisions?: ReplayPlanDecision[];
  planDecision?: RaceDecision;
  afterMapContent?: ReactNode;
  tt: Translator;
}) {
  const [driverFocus, setDriverFocus] = useState(() => localStorage.getItem(REPLAY_FOCUS_KEY) !== "0");
  const [copyDismissed, setCopyDismissed] = useState(() => localStorage.getItem(DISMISSED_REPLAY_HELP_KEY) === "1");
  const [resultUnlocked, setResultUnlocked] = useState(false);
  const replayTrace = useMemo(() => result.replayTrace ?? [], [result.replayTrace]);
  const replayPlan = useMemo(() => buildReplayPlan(result, replayTrace), [replayTrace, result]);
  const replayMode = titleKey === "qualifying_replay_title" ? "qualifying" : "race";
  const pitProgress = pitLapProgress(circuit);
  const replayTimes = useMemo(() => scaleFinishTimes(finishTimes(result, replayTrace), replayDistanceScale(circuit)), [circuit, replayTrace, result]);
  const directorBeats = useMemo(
    () => buildRaceDirectorBeats(result, replayTrace, replayPlan, circuit.laps, playerTeamId, replayMode, pitProgress),
    [circuit.laps, pitProgress, playerTeamId, replayMode, replayPlan, replayTrace, result]
  );
  const initialSnapshot = useMemo(() => replaySnapshot(result, replayTrace, replayTimes, 0, 0, circuit.laps, replayPlan), [circuit.laps, replayPlan, replayTimes, replayTrace, result]);
  const names = teamNamesFromResult(result);
  const field = result.classification;
  const smoothTracePositions = shouldSmoothReplayTrace(replayTrace);
  const raceDuration = smoothTracePositions ? replayTimes.leader : replayTimes.last;
  const maxLap = Math.max(1, ...result.events.map((event) => event.lap));
  const raceTimeAtProgress = useCallback((progress: number) => START_HOLD_SECONDS + progress * raceDuration, [raceDuration]);
  const circuitDistance = `${(circuitLengthMeters(circuit) / 1000).toFixed(1)} km`;
  const lastFinishTime = replayTimes.last;
  const replayEnd = START_HOLD_SECONDS + lastFinishTime + FINISH_HOLD_SECONDS;
  const replayPercentAtRaceProgress = (progress: number) => (raceTimeAtProgress(progress) / replayEnd) * 100;

  useEffect(() => {
    if (driverFocus) localStorage.removeItem(REPLAY_FOCUS_KEY);
    else localStorage.setItem(REPLAY_FOCUS_KEY, "0");
  }, [driverFocus]);

  useEffect(() => {
    setDriverFocus(localStorage.getItem(REPLAY_FOCUS_KEY) !== "0");
    setCopyDismissed(localStorage.getItem(DISMISSED_REPLAY_HELP_KEY) === "1");
  }, [preferencesResetSignal]);

  useEffect(() => {
    setResultUnlocked(false);
  }, [result.seed, titleKey]);

  const qualifyingMomentEvents = useMemo(() => replayMode === "qualifying" ? buildQualifyingMomentEvents(directorBeats, result) : [], [directorBeats, replayMode, result]);
  // Majors and player moments first pick, race notes as filler — then strict race order.
  const keyMoments = useMemo(() => (
    replayMode === "qualifying" ? qualifyingMomentEvents : [
      ...result.events.filter((event) => event.severity === "major"),
      ...result.events.filter((event) => event.type === "pit_stop"),
      ...result.events.filter((event) => event.teamId === playerTeamId || event.relatedTeamId === playerTeamId),
      ...(overlayActions ? [] : result.events.filter((event) => event.severity === "minor" && (event.type === "race_note" || event.tags.includes("mini_info"))))
    ]
  )
    .filter((event, index, events) => events.findIndex((candidate) => candidate.id === event.id) === index)
    .sort((left, right) => left.order - right.order), [overlayActions, playerTeamId, qualifyingMomentEvents, replayMode, result.events]);

  const eventTime = useCallback((event: RaceEvent) => raceTimeAtProgress(eventTraceProgress(event, maxLap)), [maxLap, raceTimeAtProgress]);
  const activeMomentIdAt = useCallback((time: number) => keyMoments.find((event) => Math.abs(eventTime(event) - time) <= MOMENT_NOTIFICATION_SECONDS)?.id ?? null, [eventTime, keyMoments]);
  const createTargetSnapshot = useCallback(
    (raceTime: number, progress: number, currentOrder: string[]) => replaySnapshot(result, replayTrace, replayTimes, raceTime, progress, circuit.laps, replayPlan, currentOrder),
    [circuit.laps, replayPlan, replayTimes, replayTrace, result]
  );
  const createTower = useCallback(
    (progress: number, carProgress: Record<string, number>, currentOrder: string[]) => liveClassificationByCarProgress(result, replayTrace, progress, carProgress, currentOrder),
    [replayTrace, result]
  );
  const getOrderAtProgress = useCallback((progress: number) => replayOrderAtProgress(result, replayTrace, progress), [replayTrace, result]);
  const {
    svgRef,
    progressRef,
    rangeRef,
    clock,
    scrubbingRef,
    playing,
    setPlaying,
    speed,
    setSpeed,
    live,
    snapshot,
    activeMomentId,
    positionPops,
    currentRaceProgress,
    seek,
    restart
  } = useReplayClock({
    initialSnapshot,
    initialOrder: initialSnapshot.tower.map((entry) => entry.teamId),
    replayEnd,
    raceDuration,
    laps: circuit.laps,
    smoothTracePositions,
    resultSeed: result.seed,
    titleKey,
    initialLap,
    startHoldSeconds: START_HOLD_SECONDS,
    getActiveMomentId: activeMomentIdAt,
    getOrderAtProgress,
    createTargetSnapshot,
    createTower,
    smoothCarProgress,
    displayLapAtProgress,
    segmentAtProgress
  });
  const replayComplete = resultUnlocked || clock.current >= replayEnd;
  const unlockResult = () => {
    seek(replayEnd);
    setPlaying(false);
    setResultUnlocked(true);
  };

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
  const towerPlanByTeam = new Map(planDecisions?.map((decision) => [decision.teamId, decision]));
  const traceLiveTimes = traceTimesAt(replayTrace, currentRaceProgress);
  const traceLiveGaps = traceGapsAt(replayTrace, currentRaceProgress);
  const hasTraceLiveTimes = Object.keys(traceLiveTimes).length > 0;
  const hasTraceLiveGaps = Object.keys(traceLiveGaps).length > 0;
  const towerLiveTimes = Object.fromEntries(
    snapshot.tower.map((entry) => {
      if (hasTraceLiveTimes) return [entry.teamId, traceLiveTimes[entry.teamId]];
      const finishTime = replayTimes.times[entry.teamId] ?? replayTimes.leader;
      const progress = Math.min(circuit.laps, snapshot.carProgress[entry.teamId] ?? 0);
      return [entry.teamId, (progress / Math.max(1, circuit.laps)) * finishTime];
    })
  );
  const towerLeaderTime = towerLiveTimes[snapshot.tower[0]?.teamId ?? ""] ?? 0;
  const tower: ReplayTowerEntry[] = towerEntries ?? snapshot.tower.map((entry, index) => {
    const previous = snapshot.tower[index - 1];
    const time = towerLiveTimes[entry.teamId];
    const previousTime = previous ? towerLiveTimes[previous.teamId] ?? towerLeaderTime : towerLeaderTime;
    const currentTime = time ?? previousTime;
    const previousGap = previous ? traceLiveGaps[previous.teamId] ?? 0 : 0;
    const gap = hasTraceLiveGaps
      ? Math.max(0, (traceLiveGaps[entry.teamId] ?? 0) - previousGap)
      : Math.max(0, currentTime - previousTime);
    return {
      teamId: entry.teamId,
      teamName: entry.teamName,
      value: time === undefined ? "" : index === 0 ? `${time.toFixed(1)}s` : `+${gap.toFixed(1)}s`,
      decision: towerPlanByTeam.get(entry.teamId)
    };
  });

  // Timeline markers: one dot per lap that has a key/player moment, positioned by lap.
  const markerByLap = new Map<number, { texts: string[]; player: boolean; time: number }>();
  for (const event of keyMoments.filter((event) => event.severity === "major" || event.type === "pit_stop" || event.teamId === playerTeamId)) {
    const progress = event.type === "pit_stop" ? pitStopTraceProgress(result, replayTrace, event, maxLap, circuit.laps, pitProgress, replayPlan) : eventTraceProgress(event, maxLap);
    const displayLap = displayLapAtProgress(progress, circuit.laps);
    const marker = markerByLap.get(displayLap) ?? { texts: [], player: false, time: raceTimeAtProgress(progress) };
    marker.texts.push(`${tt("unit_lap")} ${displayLap} · ${eventReplayText(event, names, tt)}`);
    marker.player ||= event.teamId === playerTeamId;
    marker.time = Math.min(marker.time, raceTimeAtProgress(progress));
    markerByLap.set(displayLap, marker);
  }
  const markers = [...markerByLap.entries()].map(([lap, marker]) => ({
    id: String(lap),
    className: marker.player ? "replay-marker player" : "replay-marker",
    left: `${Math.min(96, Math.max(3, (marker.time / replayEnd) * 100))}%`,
    time: marker.time,
    title: marker.texts.join("\n")
  })) satisfies ReplayTimelineMarker[];
  const directorMarkers = directorBeats.slice(1, -1).map((beat) => {
    const copy = directorBeatCopy(beat, names, tt);
    return {
      id: beat.id,
      className: `replay-marker director ${beat.type}`,
      left: `${Math.min(96, Math.max(3, replayPercentAtRaceProgress(beat.progress)))}%`,
      title: copy.detail,
      time: raceTimeAtProgress(beat.progress)
    };
  }) satisfies ReplayTimelineMarker[];
  const liveWeather = result.resolvedWeather[live.segment];
  const activeMoment = keyMoments.find((event) => event.id === activeMomentId);
  const activeMomentCard = activeMoment ? momentCard(activeMoment, names, tt) : null;
  const activeMomentLap = activeMoment
    ? typeof activeMoment.traceProgress === "number"
      ? displayLapAtProgress(activeMoment.traceProgress, circuit.laps)
      : displayLapAtProgress(activeMoment.lap / maxLap, circuit.laps)
    : 1;
  const activeMomentNotice = activeMoment && activeMomentCard
    ? {
        player: activeMoment.teamId === playerTeamId,
        lap: activeMomentLap,
        icon: activeMomentCard.icon,
        context: activeMomentCard.context,
        detail: activeMomentCard.team || activeMomentCard.text,
        impact: activeMomentCard.impact
      }
    : undefined;
  const activeDirectorBeat = [...directorBeats].reverse().find((beat) => beat.progress <= currentRaceProgress) ?? directorBeats[0];
  const activeDirectorCopy = activeDirectorBeat ? directorBeatCopy(activeDirectorBeat, names, tt) : null;
  const activeDirector = activeDirectorBeat && activeDirectorCopy
    ? {
        type: activeDirectorBeat.type,
        lap: activeDirectorBeat.lap,
        title: activeDirectorCopy.title,
        detail: renderPositionBadges(activeDirectorCopy.detail)
      }
    : undefined;
  const playerContext = playerReplayContext(result, replayTrace, currentRaceProgress, playerTeamId);
  const playerGapItems = replayPlayerGapItems(playerContext, tt);
  const latestPlayerBeat = [...directorBeats].reverse().find((beat) => beat.teamId === playerTeamId || beat.relatedTeamId === playerTeamId);
  const playerFocus = playerContext
    ? {
        position: playerContext.position,
        delta: playerContext.delta,
        gapItems: playerGapItems,
        latestDetail: latestPlayerBeat ? renderPositionBadges(directorBeatCopy(latestPlayerBeat, names, tt).detail) : undefined
      }
    : undefined;

  return (
    <div className="view-stack">
      <div className="replay-main-grid">
        <div className="replay-content-column">
          <CircuitMap
            className="replay-map-panel"
            circuit={circuit}
            tt={tt}
            cars={cars}
            weather={liveWeather}
            svgRef={svgRef}
            showHeading={false}
            framed={false}
            showTraits={false}
            camera={{ enabled: driverFocus, car: playerCar, timeRef: clock }}
            overlay={
              <ReplayStageOverlay
                circuit={circuit}
                liveLap={live.lap}
                liveWeather={liveWeather}
                circuitDistance={circuitDistance}
                planDecision={planDecision}
                traitImpacts={traitImpacts}
                resolvedWeather={result.resolvedWeather}
                activeMoment={activeMomentNotice}
                activeDirector={activeDirector}
                playerFocus={playerFocus}
                replayMode={replayMode}
                overlayActions={overlayActions}
                playing={playing}
                speed={speed}
                driverFocus={driverFocus}
                replayEnd={replayEnd}
                clockSeconds={clock.current}
                progressRef={progressRef}
                rangeRef={rangeRef}
                scrubbingRef={scrubbingRef}
                towerReplacement={towerReplacement}
                tower={tower}
                playerTeamId={playerTeamId}
                positionPops={positionPops}
                teamLiveries={teamLiveries}
                markers={markers}
                directorMarkers={directorMarkers}
                replayPercentAtRaceProgress={replayPercentAtRaceProgress}
                tt={tt}
                setPlaying={setPlaying}
                setSpeed={setSpeed}
                setDriverFocus={setDriverFocus}
                restart={restart}
                seek={seek}
                onOpenReport={replayComplete ? onOpenReport : undefined}
                onOpenTowerReport={onOpenPlanReport}
                onOpenPlan={onOpenPlan}
                onClose={onClose}
                closeLabel={closeLabel}
              />
            }
          />
          {afterMapContent && !replayComplete ? (
            <section className="panel race-context-panel replay-result-gate">
              <h2>{tt("replay_result_locked_title")}</h2>
              <p>{tt("replay_result_locked_body")}</p>
              <button type="button" className="secondary-button" onClick={unlockResult}>
                {tt("action_skip_to_result")}
              </button>
            </section>
          ) : afterMapContent}
          {showIntro && !copyDismissed ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
