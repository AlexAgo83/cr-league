import type { RaceResult } from "@cr-league/shared";
import type { CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { ReplayView } from "./ReplayView.js";
import { ReportView } from "./ReportView.js";

export type ResultTab = "replay" | "report";

export function ResultView({
  state,
  result,
  circuit,
  playerTeamId,
  playerDecision,
  forecastPick,
  tab,
  tt
}: {
  state: LeagueState;
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  playerDecision: LeagueState["decisions"][number] | undefined;
  forecastPick: string;
  tab: ResultTab;
  tt: Translator;
}) {
  return (
    <div className="result-view">
      <div id={`result-${tab}-panel`}>
        {tab === "replay" ? (
          <ReplayView result={result} circuit={circuit} playerTeamId={playerTeamId} tt={tt} />
        ) : (
          <ReportView
            state={state}
            result={result}
            playerTeamId={playerTeamId}
            playerDecision={playerDecision}
            forecastPick={forecastPick}
            tt={tt}
          />
        )}
      </div>
    </div>
  );
}
