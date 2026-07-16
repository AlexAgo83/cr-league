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
  onClose,
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
  onClose?: () => void;
  tt: Translator;
}) {
  const teamLiveries = Object.fromEntries(state.teams.map((team) => [team.id, team.livery]));

  return (
    <div className="result-view">
      <div id={`result-${tab}-panel`}>
        {tab === "replay" ? (
          <ReplayView
            result={result}
            circuit={circuit}
            playerTeamId={playerTeamId}
            teamLiveries={teamLiveries}
            traitImpacts={traitImpacts}
            preferencesResetSignal={preferencesResetSignal}
            onClose={onClose}
            closeLabel={tt("action_back_to_circuit")}
            tt={tt}
          />
        ) : (
          <ReportView
            state={state}
            result={result}
            circuit={circuit}
            playerTeamId={playerTeamId}
            playerDecision={playerDecision}
            onClose={onClose}
            tt={tt}
          />
        )}
      </div>
    </div>
  );
}
