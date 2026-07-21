import { DEMO_RACE_INPUT, RACE_SEGMENTS, type RaceDecision, type RaceResult, type TeamLivery, type Weather } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "./circuits.js";
import type { Translator } from "./helpers.js";
import type { LeagueState } from "./types.js";
import { CircuitMap, MapTraitsPanel, type MapTraitImpacts } from "../features/CircuitMap.js";
import { MapPlanPanel } from "../features/MapPlanPanel.js";
import { Modal } from "../features/Modal.js";
import { PendingFeedback } from "../features/PendingFeedback.js";
import { ReplayTower } from "../features/replay/ReplayTower.js";
import { CountryBadge, VisualIcon } from "../features/VisualIcon.js";
import type { PlanSubscreen } from "./routes.js";
import { lazy, Suspense, useState } from "react";

const ReplayView = lazy(() => import("../features/ReplayView.js").then((module) => ({ default: module.ReplayView })));

type CommandClick = "qualifying" | "editPlan" | "directive" | "chronoReport" | "launchGrandPrix" | "resultReport" | "nextGrandPrix";
type DeskState = "prepare" | "ready" | "resolved";
type PrimaryCommand = { label: string; action: () => void; disabled: boolean };
type QualifyingEntry = { teamId: string; teamName: string; position: number; attempts: number; lap?: number; createdAt: string; time: number; decision: RaceDecision };
type QualifyingReplay = { result: RaceResult; decision: RaceDecision } | null;

export function DriveView({
  state,
  result,
  currentQualifyingResult,
  currentCircuit,
  qualifyingReplayCircuit,
  playerTeam,
  mapPlan,
  directiveTraitImpacts,
  replayTraitImpacts,
  forecastPick,
  raceDayPhase,
  qualifyingAttemptsUsed,
  qualifyingAttemptLimit,
  qualifyingAttemptsLeft,
  qualifyingPanelOpen,
  qualifyingLeaderboard,
  qualifyingReplayEntries,
  primaryCommandClass,
  primaryCommand,
  deskState,
  pendingMessage,
  preferencesResetSignal,
  qualifyingReplayInitialLap,
  setQualifyingPanelOpen,
  setQualifyingResult,
  setPlanSubscreen,
  setGameView,
  markCommandClicked,
  tt
}: {
  state: LeagueState;
  result: RaceResult | null | undefined;
  currentQualifyingResult: QualifyingReplay;
  currentCircuit: CityCircuit;
  qualifyingReplayCircuit: CityCircuit;
  playerTeam: LeagueState["teams"][number] | undefined;
  mapPlan: RaceDecision | undefined;
  directiveTraitImpacts: MapTraitImpacts;
  replayTraitImpacts: MapTraitImpacts;
  forecastPick: string;
  raceDayPhase: string;
  qualifyingAttemptsUsed: number;
  qualifyingAttemptLimit: number;
  qualifyingAttemptsLeft: number;
  qualifyingPanelOpen: boolean;
  qualifyingLeaderboard: QualifyingEntry[];
  qualifyingReplayEntries: Array<{ id?: string; teamId: string; teamName: string; value: string }>;
  primaryCommandClass: string;
  primaryCommand: PrimaryCommand;
  deskState: DeskState;
  pendingMessage: string | null;
  preferencesResetSignal: number;
  qualifyingReplayInitialLap?: number;
  setQualifyingPanelOpen: (open: boolean) => void;
  setQualifyingResult: (result: null) => void;
  setPlanSubscreen: (screen: PlanSubscreen) => void;
  setGameView: (view: "drive" | "plan") => void;
  markCommandClicked: (command: CommandClick) => void;
  tt: Translator;
}) {
  const teamLiveries = Object.fromEntries(state.teams.map((team) => [team.id, team.livery]));
  const [weatherInfoOpen, setWeatherInfoOpen] = useState(false);

  return (
    <div className="drive-grid">
      {weatherInfoOpen && result ? <RaceWeatherModal result={result} tt={tt} onClose={() => setWeatherInfoOpen(false)} /> : null}
      <div className="drive-content-column">
        {!result && currentQualifyingResult ? (
          <div className="qualifying-replay-inline drive-map-panel">
            <Suspense fallback={<p className="pending-feedback" role="status">{tt("status_loading_view")}</p>}>
              <ReplayView
                result={currentQualifyingResult.result}
                circuit={qualifyingReplayCircuit}
                playerTeamId={playerTeam?.id}
                teamLiveries={teamLiveries}
                traitImpacts={directiveTraitImpacts}
                planDecision={currentQualifyingResult.decision}
                towerEntries={qualifyingReplayEntries}
                towerReplacement={
                  <QualifyingTimesPanel
                    replay
                    entries={qualifyingLeaderboard}
                    playerTeamId={playerTeam?.id}
                    attemptsUsed={qualifyingAttemptsUsed}
                    attemptLimit={qualifyingAttemptLimit}
                    onReport={() => {
                      markCommandClicked("chronoReport");
                      setPlanSubscreen("chrono");
                      setGameView("plan");
                    }}
                    tt={tt}
                  />
                }
                titleKey="qualifying_replay_title"
                explainerKey="qualifying_replay_explainer"
                initialLap={qualifyingReplayInitialLap}
                preferencesResetSignal={preferencesResetSignal}
                onClose={() => setQualifyingResult(null)}
                onOpenPlan={() => {
                  markCommandClicked("editPlan");
                  setPlanSubscreen("plan");
                  setGameView("plan");
                }}
                closeLabel={tt("action_back_to_race")}
                tt={tt}
              />
            </Suspense>
          </div>
        ) : (
          <CircuitMap
            className="drive-map-panel"
            circuit={currentCircuit}
            tt={tt}
            showHeading={false}
            framed={false}
            showTraits={false}
            weather={forecastPick as Weather}
            overlay={
              <>
                <div className="map-info-stack">
                  <div className="map-status">
                    <span className="circuit-city">
                      <CountryBadge country={currentCircuit.country} /> {currentCircuit.city}
                    </span>
                    <strong>{tt(currentCircuit.layoutKey)}</strong>
                    <small>
                      {currentCircuit.laps} {tt("unit_laps")}
                    </small>
                    <small className="map-weather-readout">
                      <VisualIcon name={forecastPick as Weather} />
                      <span>
                        <b>{tt("briefing_forecast_not_final")}</b>
                        {tt(`weather_tendency_${forecastPick}` as TranslationKey)}
                      </span>
                    </small>
                    {result ? (
                      <button className="map-plan-edit-button map-weather-info-button" type="button" aria-label={tt("race_weather_info_title")} title={tt("race_weather_info_title")} onClick={() => setWeatherInfoOpen(true)}>
                        {tt("action_info")}
                      </button>
                    ) : null}
                  </div>
                  <div className="map-plan-performance">
                    <MapPlanPanel
                      decision={mapPlan}
                      editLabel={tt(deskState === "prepare" ? "action_edit_plan" : "action_view_plan")}
                      onEdit={() => {
                        markCommandClicked("editPlan");
                        setPlanSubscreen("plan");
                        setGameView("plan");
                      }}
                      tt={tt}
                    />
                    <MapTraitsPanel traits={currentCircuit.traits} impacts={result ? replayTraitImpacts : directiveTraitImpacts} tt={tt} />
                  </div>
                </div>
                <div className="map-workflow-panel">
                  <h2>{tt(`race_phase_${raceDayPhase}_title` as TranslationKey)}</h2>
                  <p className="race-phase-message">
                    {tt(`race_phase_${raceDayPhase}_body` as TranslationKey, {
                      used: qualifyingAttemptsUsed,
                      limit: qualifyingAttemptLimit,
                      left: qualifyingAttemptsLeft
                    })}
                  </p>
                  <div className="race-day-steps" aria-label={tt("race_day_steps")}>
                    {["briefing", "adjust", "locked", "gp"].map((step) => (
                      <span key={step} className={step === raceDayPhase || (step === "gp" && raceDayPhase === "finished") ? "active" : undefined}>
                        {tt(`race_step_${step}` as TranslationKey)}
                      </span>
                    ))}
                  </div>
                </div>
                {result ? (
                  <FinalClassification
                    state={state}
                    result={result}
                    playerTeamId={playerTeam?.id}
                    teamLiveries={teamLiveries}
                    onReport={() => {
                      markCommandClicked("resultReport");
                      setPlanSubscreen("report");
                      setGameView("plan");
                    }}
                    tt={tt}
                  />
                ) : qualifyingPanelOpen ? (
                  <QualifyingTimesPanel
                    entries={qualifyingLeaderboard}
                    playerTeamId={playerTeam?.id}
                    attemptsUsed={qualifyingAttemptsUsed}
                    attemptLimit={qualifyingAttemptLimit}
                    onReport={() => {
                      markCommandClicked("chronoReport");
                      setPlanSubscreen("chrono");
                      setGameView("plan");
                    }}
                    tt={tt}
                  />
                ) : (
                  <button className="map-qualifying-toggle" type="button" onClick={() => setQualifyingPanelOpen(true)}>
                    {tt("qualifying_times_title")} {qualifyingAttemptsUsed}/{qualifyingAttemptLimit}
                  </button>
                )}
                <DriveActions
                  result={result}
                  primaryCommandClass={primaryCommandClass}
                  primaryCommand={primaryCommand}
                  deskState={deskState}
                  pendingMessage={pendingMessage}
                />
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

function RaceWeatherModal({ result, tt, onClose }: { result: RaceResult; tt: Translator; onClose: () => void }) {
  return (
    <Modal label={tt("race_weather_info_title")} closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <h2>{tt("race_weather_info_title")}</h2>
      <p>{tt("race_weather_info_body")}</p>
      <p>
        <span className="replay-legend-dot" aria-hidden="true" /> {tt("replay_pace_marker_legend")} <VisualIcon name="light_rain" /> {tt("replay_weather_phase_legend")}
      </p>
      <ol className="race-weather-phase-list">
        {RACE_SEGMENTS.map((segment) => (
          <li key={segment}>
            <span>
              <VisualIcon name={result.resolvedWeather[segment]} />
              {tt(`segment_${segment}` as TranslationKey)}
            </span>
            <strong>{tt(`weather_${result.resolvedWeather[segment]}` as TranslationKey)}</strong>
          </li>
        ))}
      </ol>
    </Modal>
  );
}

function QualifyingTimesPanel({
  entries,
  playerTeamId,
  attemptsUsed,
  attemptLimit,
  replay = false,
  onReport,
  tt
}: {
  entries: QualifyingEntry[];
  playerTeamId?: string;
  attemptsUsed: number;
  attemptLimit: number;
  replay?: boolean;
  onReport?: () => void;
  tt: Translator;
}) {
  const reportLabel = tt("action_view_plan").split(" ")[0];
  const panelClassName = [
    "map-qualifying-times",
    replay ? "replay-qualifying-times" : "",
    entries.length ? "" : "is-empty",
    onReport ? "has-action" : ""
  ].filter(Boolean).join(" ");
  return (
    <div className={panelClassName}>
      <header>
        <strong>
          {tt("qualifying_times_title")} <span>{attemptsUsed}/{attemptLimit}</span>
        </strong>
        {onReport ? (
          <button className="map-plan-edit-button" type="button" aria-label={reportLabel} title={tt("result_tab_report")} onClick={onReport}>
            {reportLabel}
          </button>
        ) : null}
      </header>
      {entries.length ? (
        <ol>
          {entries.map((run) => (
            <li key={`${run.teamId}-${run.attempts}-${run.lap ?? 0}-${run.createdAt}`} className={run.teamId === playerTeamId ? "player" : undefined}>
              <span className="chrono-rank">#{run.position}</span>
              <ChronoPlanAsset decision={run.decision} />
              <span className="chrono-team-name">{run.teamName}</span>
              {run.attempts ? (
                <span className="chrono-run-code" aria-label={tt("qualifying_attempt_label", { attempt: run.attempts, lap: run.lap ?? 1 })}>
                  E<b>{run.attempts}</b>T<b>{run.lap ?? 1}</b>
                </span>
              ) : null}
              <em>{run.time.toFixed(2)}s</em>
            </li>
          ))}
        </ol>
      ) : (
        <small>{tt("qualifying_times_empty")}</small>
      )}
    </div>
  );
}

const CHRONO_PLAN_MARKERS = {
  approach: { prudent: 1, balanced: 2, aggressive: 3 },
  preparation: { speed: 1, reliability: 2, weather: 3 },
  pitStrategy: { heavy_pack: 1, standard: 2, mini_pack: 3 }
} as const;

function ChronoPlanAsset({ decision }: { decision: RaceDecision }) {
  return (
    <span className="chrono-plan-asset" aria-hidden="true">
      <ChronoPlanDots className="approach" value={CHRONO_PLAN_MARKERS.approach[decision.approach]} />
      <ChronoPlanDots className="preparation" value={CHRONO_PLAN_MARKERS.preparation[decision.preparation]} />
      <ChronoPlanDots className="pit" value={CHRONO_PLAN_MARKERS.pitStrategy[decision.pitStrategy ?? "standard"]} />
      <i className={decision.cardId ? "card active" : "card"} />
    </span>
  );
}

function ChronoPlanDots({ className, value }: { className: string; value: 1 | 2 | 3 }) {
  return (
    <i className={className}>
      {[1, 2, 3].map((step) => (
        <i key={step} className={step === value ? "active" : undefined} />
      ))}
    </i>
  );
}

function FinalClassification({
  state,
  result,
  playerTeamId,
  teamLiveries,
  onReport,
  tt
}: {
  state: LeagueState;
  result: RaceResult;
  playerTeamId?: string;
  teamLiveries: Record<string, TeamLivery>;
  onReport: () => void;
  tt: Translator;
}) {
  const finalTrace = result.replayTrace?.at(-1);
  const explicitPlans = new Map(state.decisions.map((decision) => [decision.teamId, decision]));
  const consumedCardByTeam = new Map(result.consumedCards.map((card) => [card.teamId, card.cardId]));
  const teamIndex = new Map(state.teams.map((team, index) => [team.id, index]));
  const entries = result.classification.map((entry, index) => {
    const previous = result.classification[index - 1];
    const decision = explicitPlans.get(entry.teamId);
    const fallback = DEMO_RACE_INPUT.participants[(teamIndex.get(entry.teamId) ?? index) % DEMO_RACE_INPUT.participants.length]?.decision;
    const time = finalTrace?.times[entry.teamId];
    const previousGap = previous ? finalTrace?.gaps[previous.teamId] ?? finalTrace?.times[previous.teamId] ?? 0 : 0;
    const gap = finalTrace?.gaps[entry.teamId] ?? (time ?? 0);
    return {
      teamId: entry.teamId,
      teamName: entry.teamName,
      value: time === undefined ? "" : index === 0 ? `${time.toFixed(1)}s` : `+${Math.max(0, gap - previousGap).toFixed(1)}s`,
      decision: {
        approach: decision?.approach ?? fallback?.approach ?? "balanced",
        preparation: decision?.preparation ?? fallback?.preparation ?? "speed",
        pitStrategy: decision?.pitStrategy ?? fallback?.pitStrategy ?? "standard",
        cardId: decision?.cardId ?? consumedCardByTeam.get(entry.teamId)
      }
    };
  });
  const positionPops = Object.fromEntries(result.classification.map((entry) => [entry.teamId, { delta: entry.positionChange, key: 0 }]));
  return (
    <ReplayTower
      entries={entries}
      playerTeamId={playerTeamId}
      positionPops={positionPops}
      title={tt("result_final_classification")}
      onReport={onReport}
      reportLabel={tt("action_view_plan").split(" ")[0] ?? tt("result_tab_report")}
      teamLiveries={teamLiveries}
    />
  );
}

function DriveActions({
  result,
  primaryCommandClass,
  primaryCommand,
  deskState,
  pendingMessage
}: {
  result: RaceResult | null | undefined;
  primaryCommandClass: string;
  primaryCommand: PrimaryCommand;
  deskState: DeskState;
  pendingMessage: string | null;
}) {
  if (result) {
    return (
      <div className="race-phase-actions map-race-actions">
        <PendingFeedback className="map-pending-feedback" message={pendingMessage} />
        <button className={primaryCommandClass} type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
          {primaryCommand.label}
        </button>
      </div>
    );
  }

  return (
    <div className="race-phase-actions map-race-actions">
      <PendingFeedback className="map-pending-feedback" message={pendingMessage} />
      {deskState === "prepare" ? (
        <button className={primaryCommandClass} type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
          {primaryCommand.label}
        </button>
      ) : (
        <button className={primaryCommandClass} type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
          {primaryCommand.label}
        </button>
      )}
    </div>
  );
}
