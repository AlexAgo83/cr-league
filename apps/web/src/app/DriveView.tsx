import type { RaceDecision, RaceResult, Weather } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "./circuits.js";
import type { Translator } from "./helpers.js";
import type { LeagueState } from "./types.js";
import { CircuitMap, MapTraitsPanel, type MapTraitImpacts } from "../features/CircuitMap.js";
import { MapPlanPanel } from "../features/MapPlanPanel.js";
import { PendingFeedback } from "../features/PendingFeedback.js";
import { PositionBadge } from "../features/PositionBadge.js";
import { ReplayView } from "../features/ReplayView.js";
import { RewardValue } from "../features/RewardValue.js";
import { CountryBadge, VisualIcon } from "../features/VisualIcon.js";
import type { ResultTab } from "../features/ResultView.js";
import type { PlanSubscreen } from "./routes.js";

type CommandClick = "qualifying" | "editPlan" | "directive" | "chronoReport" | "launchGrandPrix" | "resultReport" | "nextGrandPrix";
type DeskState = "prepare" | "ready" | "resolved";
type PrimaryCommand = { label: string; action: () => void; disabled: boolean };
type QualifyingEntry = { teamId: string; teamName: string; position: number; attempts: number; lap?: number; createdAt: string; time: number };
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
  commandClicks,
  primaryCommandClass,
  primaryCommand,
  deskState,
  lastQualifyingRun,
  qualifyingDisabled,
  pendingMessage,
  preferencesResetSignal,
  qualifyingReplayInitialLap,
  setQualifyingPanelOpen,
  setQualifyingResult,
  setPlanSubscreen,
  setGameView,
  setResultTab,
  setResultOpen,
  markCommandClicked,
  openQualifyingRun,
  openLastQualifyingRun,
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
  commandClicks: Record<CommandClick, boolean>;
  primaryCommandClass: string;
  primaryCommand: PrimaryCommand;
  deskState: DeskState;
  lastQualifyingRun: unknown;
  qualifyingDisabled: boolean;
  pendingMessage: string | null;
  preferencesResetSignal: number;
  qualifyingReplayInitialLap?: number;
  setQualifyingPanelOpen: (open: boolean) => void;
  setQualifyingResult: (result: null) => void;
  setPlanSubscreen: (screen: PlanSubscreen) => void;
  setGameView: (view: "drive" | "plan") => void;
  setResultTab: (tab: ResultTab) => void;
  setResultOpen: (open: boolean) => void;
  markCommandClicked: (command: CommandClick) => void;
  openQualifyingRun: () => void;
  openLastQualifyingRun: () => void;
  tt: Translator;
}) {
  const teamLiveries = Object.fromEntries(state.teams.map((team) => [team.id, team.livery]));

  return (
    <div className="drive-grid">
      <div className="drive-content-column">
        {!result && currentQualifyingResult ? (
          <div className="qualifying-replay-inline drive-map-panel">
            <ReplayView
              result={currentQualifyingResult.result}
              circuit={qualifyingReplayCircuit}
              playerTeamId={playerTeam?.id}
              teamLiveries={teamLiveries}
              traitImpacts={directiveTraitImpacts}
              planDecision={currentQualifyingResult.decision}
              towerEntries={qualifyingReplayEntries}
              towerReplacement={<QualifyingTimesPanel replay entries={qualifyingLeaderboard} playerTeamId={playerTeam?.id} attemptsUsed={qualifyingAttemptsUsed} attemptLimit={qualifyingAttemptLimit} tt={tt} />}
              titleKey="qualifying_replay_title"
              explainerKey="qualifying_replay_explainer"
              initialLap={qualifyingReplayInitialLap}
              preferencesResetSignal={preferencesResetSignal}
              onClose={() => setQualifyingResult(null)}
              closeLabel={tt("action_back_to_race")}
              overlayActions={
                <>
                  <button
                    className={!commandClicks.chronoReport ? "highlight-command" : undefined}
                    type="button"
                    onClick={() => {
                      markCommandClicked("chronoReport");
                      setPlanSubscreen("chrono");
                      setGameView("plan");
                    }}
                  >
                    {tt("plan_subscreen_chrono")}
                  </button>
                  <button type="button" onClick={openQualifyingRun} disabled={qualifyingDisabled}>
                    {tt("action_qualifying")}
                  </button>
                  <button className={primaryCommandClass} type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
                    {primaryCommand.label}
                  </button>
                </>
              }
              tt={tt}
            />
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
                      <span>{tt(`weather_${forecastPick}` as TranslationKey)}</span>
                    </small>
                  </div>
                  <MapPlanPanel decision={mapPlan} tt={tt} />
                  <MapTraitsPanel traits={currentCircuit.traits} impacts={result ? replayTraitImpacts : directiveTraitImpacts} tt={tt} />
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
                  <FinalClassification result={result} playerTeamId={playerTeam?.id} tt={tt} />
                ) : qualifyingPanelOpen ? (
                  <QualifyingTimesPanel
                    entries={qualifyingLeaderboard}
                    playerTeamId={playerTeam?.id}
                    attemptsUsed={qualifyingAttemptsUsed}
                    attemptLimit={qualifyingAttemptLimit}
                    onClose={() => setQualifyingPanelOpen(false)}
                    tt={tt}
                  />
                ) : (
                  <button className="map-qualifying-toggle" type="button" onClick={() => setQualifyingPanelOpen(true)}>
                    {tt("qualifying_times_title")} {qualifyingAttemptsUsed}/{qualifyingAttemptLimit}
                  </button>
                )}
                <DriveActions
                  result={result}
                  commandClicks={commandClicks}
                  primaryCommandClass={primaryCommandClass}
                  primaryCommand={primaryCommand}
                  deskState={deskState}
                  lastQualifyingRun={lastQualifyingRun}
                  qualifyingDisabled={qualifyingDisabled}
                  qualifyingAttemptsUsed={qualifyingAttemptsUsed}
                  pendingMessage={pendingMessage}
                  setPlanSubscreen={setPlanSubscreen}
                  setGameView={setGameView}
                  setResultTab={setResultTab}
                  setResultOpen={setResultOpen}
                  markCommandClicked={markCommandClicked}
                  openQualifyingRun={openQualifyingRun}
                  openLastQualifyingRun={openLastQualifyingRun}
                  tt={tt}
                />
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

function QualifyingTimesPanel({
  entries,
  playerTeamId,
  attemptsUsed,
  attemptLimit,
  replay = false,
  onClose,
  tt
}: {
  entries: QualifyingEntry[];
  playerTeamId?: string;
  attemptsUsed: number;
  attemptLimit: number;
  replay?: boolean;
  onClose?: () => void;
  tt: Translator;
}) {
  return (
    <div className={replay ? "map-qualifying-times replay-qualifying-times" : "map-qualifying-times"}>
      <header>
        <strong>
          {tt("qualifying_times_title")} <span>{attemptsUsed}/{attemptLimit}</span>
        </strong>
        {onClose ? (
          <button type="button" aria-label={`${tt("action_close")} ${tt("qualifying_times_title")}`} onClick={onClose}>
            ×
          </button>
        ) : null}
      </header>
      {entries.length ? (
        <ol>
          {entries.map((run) => (
            <li key={`${run.teamId}-${run.attempts}-${run.lap ?? 0}-${run.createdAt}`} className={run.teamId === playerTeamId ? "player" : undefined}>
              <span>
                <span className="chrono-rank">#{run.position}</span> {run.teamName}
                {run.attempts ? ` · ${tt("qualifying_attempt_label", { attempt: run.attempts, lap: run.lap ?? 1 })}` : ""}
              </span>
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

function FinalClassification({ result, playerTeamId, tt }: { result: RaceResult; playerTeamId?: string; tt: Translator }) {
  return (
    <div className="map-final-classification">
      <strong>{tt("result_final_classification")}</strong>
      <ol>
        {result.classification.map((entry) => (
          <li key={entry.teamId} className={entry.teamId === playerTeamId ? "player" : undefined}>
            <span>
              <PositionBadge position={entry.position} /> {entry.teamName}
            </span>
            <em>
              <RewardValue type="points" value={entry.points} tt={tt} />
            </em>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DriveActions({
  result,
  commandClicks,
  primaryCommandClass,
  primaryCommand,
  deskState,
  lastQualifyingRun,
  qualifyingDisabled,
  qualifyingAttemptsUsed,
  pendingMessage,
  setPlanSubscreen,
  setGameView,
  setResultTab,
  setResultOpen,
  markCommandClicked,
  openQualifyingRun,
  openLastQualifyingRun,
  tt
}: {
  result: RaceResult | null | undefined;
  commandClicks: Record<CommandClick, boolean>;
  primaryCommandClass: string;
  primaryCommand: PrimaryCommand;
  deskState: DeskState;
  lastQualifyingRun: unknown;
  qualifyingDisabled: boolean;
  qualifyingAttemptsUsed: number;
  pendingMessage: string | null;
  setPlanSubscreen: (screen: PlanSubscreen) => void;
  setGameView: (view: "drive" | "plan") => void;
  setResultTab: (tab: ResultTab) => void;
  setResultOpen: (open: boolean) => void;
  markCommandClicked: (command: CommandClick) => void;
  openQualifyingRun: () => void;
  openLastQualifyingRun: () => void;
  tt: Translator;
}) {
  if (result) {
    return (
      <div className="race-phase-actions map-race-actions">
        <PendingFeedback className="map-pending-feedback" message={pendingMessage} />
        <button className="result-toggle-command" type="button" onClick={() => { setResultTab("replay"); setResultOpen(true); }}>
          {tt("result_tab_replay")}
        </button>
        <button className={`result-toggle-command${!commandClicks.resultReport ? " highlight-command" : ""}`} type="button" onClick={() => { markCommandClicked("resultReport"); setPlanSubscreen("report"); setGameView("plan"); }}>
          {tt("result_tab_report")}
        </button>
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
        <>
          <button className={`primary-command${qualifyingAttemptsUsed > 0 && !commandClicks.editPlan ? " highlight-command" : ""}`} type="button" onClick={() => {
            markCommandClicked("editPlan");
            setPlanSubscreen("plan");
            setGameView("plan");
          }}>
            {tt("action_edit_plan")}
          </button>
          <button className={`primary-command${!commandClicks.qualifying && qualifyingAttemptsUsed === 0 ? " highlight-command" : ""}`} type="button" onClick={openQualifyingRun} disabled={qualifyingDisabled}>
            {tt("action_qualifying")}
          </button>
          <button className="primary-command" type="button" onClick={openLastQualifyingRun} disabled={!lastQualifyingRun}>
            {tt("action_qualifying_history")}
          </button>
          <button className={primaryCommandClass} type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
            {primaryCommand.label}
          </button>
        </>
      ) : (
        <>
          {deskState === "ready" ? (
            <button className="primary-command" type="button" onClick={() => {
              setPlanSubscreen("plan");
              setGameView("plan");
            }}>
              {tt("action_view_plan")}
            </button>
          ) : null}
          <button className={primaryCommandClass} type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
            {primaryCommand.label}
          </button>
        </>
      )}
    </div>
  );
}
