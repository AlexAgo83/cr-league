import type { RaceResult } from "@cr-league/shared";
import type { CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import type { TranslationKey } from "../i18n/index.js";
import type { MapTraitImpacts } from "./CircuitMap.js";
import { ReplayView } from "./ReplayView.js";
import { ReportView } from "./ReportView.js";

export type ResultTab = "replay" | "report";

export function ResultView({
  state,
  result,
  circuit,
  playerTeamId,
  playerDecision,
  tab,
  traitImpacts,
  preferencesResetSignal,
  onToggleTab,
  primaryAction,
  tt
}: {
  state: LeagueState;
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  playerDecision: LeagueState["decisions"][number] | undefined;
  tab: ResultTab;
  traitImpacts: MapTraitImpacts;
  preferencesResetSignal?: number;
  onToggleTab: () => void;
  primaryAction?: { label: string; action: () => void; disabled: boolean };
  tt: Translator;
}) {
  const teamLiveries = Object.fromEntries(state.teams.map((team) => [team.id, team.livery]));

  return (
    <div className="result-view">
      <section className="panel race-context-panel race-day-phase-panel">
        <h2>{tt("race_phase_finished_title")}</h2>
        <p>{tt("race_phase_finished_body")}</p>
        <div className="race-day-steps" aria-label={tt("race_day_steps")}>
          {["briefing", "adjust", "locked", "gp"].map((step) => (
            <span key={step} className={step === "gp" ? "active" : undefined}>
              {tt(`race_step_${step}` as TranslationKey)}
            </span>
          ))}
        </div>
        <div className="race-phase-actions">
          <button
            className="result-toggle-command"
            type="button"
            aria-controls={`result-${tab === "report" ? "replay" : "report"}-panel`}
            onClick={onToggleTab}
          >
            {tt(`result_tab_${tab === "report" ? "replay" : "report"}`)}
          </button>
          {primaryAction ? (
            <button className="primary-command" type="button" onClick={primaryAction.action} disabled={primaryAction.disabled}>
              {primaryAction.label}
            </button>
          ) : null}
        </div>
      </section>
      <div id={`result-${tab}-panel`}>
        {tab === "replay" ? (
          <ReplayView result={result} circuit={circuit} playerTeamId={playerTeamId} teamLiveries={teamLiveries} traitImpacts={traitImpacts} preferencesResetSignal={preferencesResetSignal} tt={tt} />
        ) : (
          <ReportView
            state={state}
            result={result}
            circuit={circuit}
            playerTeamId={playerTeamId}
            playerDecision={playerDecision}
            tt={tt}
          />
        )}
      </div>
    </div>
  );
}
