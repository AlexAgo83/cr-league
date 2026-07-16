import type { RaceResult } from "@cr-league/shared";
import type { CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
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
      <div className="result-actions">
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
