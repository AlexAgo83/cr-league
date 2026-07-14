import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { CircuitMap } from "./CircuitMap.js";

export function DriveView({
  state,
  circuit,
  forecastPick,
  isResolved,
  tt
}: {
  state: LeagueState;
  circuit: CityCircuit;
  forecastPick: string;
  isResolved: boolean;
  tt: Translator;
}) {
  return (
    <div className="view-stack">
      <section className="panel race-console">
        <div>
          <span className="section-kicker">{tt("briefing_next_action")}</span>
          <h2>{tt(`next_action_${state.actionState.nextAction}` as TranslationKey)}</h2>
          <p>{isResolved ? tt("briefing_tip_resolved") : tt("briefing_tip_prepare")}</p>
        </div>
        <div className="race-telemetry" aria-label={tt("race_telemetry")}>
          <span>{tt(`trait_${state.currentGrandPrix.primaryTrait}` as TranslationKey)}</span>
          <span>{tt(`trait_${state.currentGrandPrix.secondaryTrait}` as TranslationKey)}</span>
          <span>
            {tt(`weather_${forecastPick}` as TranslationKey)} {state.currentGrandPrix.forecast[forecastPick]}%
          </span>
          <span>
            {tt("dashboard_players")} {state.actionState.submittedTeamIds.length}/{state.teams.length}
          </span>
        </div>
      </section>
      <CircuitMap circuit={circuit} tt={tt} />
    </div>
  );
}
