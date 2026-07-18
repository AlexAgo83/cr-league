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
  const payoff = playerRacePayoff(result, playerTeamId, tt);

  return (
    <div className="result-view">
      {payoff ? (
        <section className="panel race-payoff-recap" aria-label={tt("payoff_title")}>
          <div>
            <span className="section-kicker">{tt("payoff_kicker")}</span>
            <h2>{tt("payoff_title")}</h2>
          </div>
          <dl>
            <div>
              <dt>{tt("payoff_finish")}</dt>
              <dd>P{payoff.position}</dd>
            </div>
            <div>
              <dt>{tt("payoff_movement")}</dt>
              <dd>{payoff.movement}</dd>
            </div>
            <div>
              <dt>{tt("payoff_points")}</dt>
              <dd>
                +{payoff.points} {tt("unit_points")}
              </dd>
            </div>
            <div>
              <dt>{tt("payoff_credits")}</dt>
              <dd>
                +{payoff.credits} {tt("unit_credits")}
              </dd>
            </div>
            <div>
              <dt>{tt("payoff_cards")}</dt>
              <dd>{payoff.cards}</dd>
            </div>
          </dl>
        </section>
      ) : null}
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

function playerRacePayoff(result: RaceResult, playerTeamId: string | undefined, tt: Translator) {
  const entry = result.classification.find((candidate) => candidate.teamId === playerTeamId);
  if (!entry) return null;
  const consumedCards = result.consumedCards.filter((card) => card.teamId === playerTeamId).map((card) => tt(`card_${card.cardId}` as TranslationKey));
  return {
    position: entry.position,
    movement: entry.positionChange > 0 ? `+${entry.positionChange}` : entry.positionChange < 0 ? `${entry.positionChange}` : tt("report_position_hold"),
    points: entry.points,
    credits: entry.credits,
    cards: consumedCards.length ? consumedCards.join(", ") : tt("payoff_no_cards")
  };
}
