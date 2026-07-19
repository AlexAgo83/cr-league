import type { RaceResult } from "@cr-league/shared";
import type { CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import type { TranslationKey } from "../i18n/index.js";
import type { MapTraitImpacts } from "./CircuitMap.js";
import { ReplayView } from "./ReplayView.js";
import { ReportView } from "./ReportView.js";
import { RewardValue } from "./RewardValue.js";

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
  showReplayIntro = true,
  onOpenReplay,
  onOpenReport,
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
  showReplayIntro?: boolean;
  onOpenReplay?: () => void;
  onOpenReport?: () => void;
  onClose?: () => void;
  tt: Translator;
}) {
  const teamLiveries = Object.fromEntries(state.teams.map((team) => [team.id, team.livery]));
  const payoff = playerRacePayoff(state, result, playerTeamId, tt);
  const payoffPanel = payoff ? (
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
          <dt>{tt("payoff_points")}</dt>
          <dd>
            <RewardValue type="points" value={payoff.points} signed tt={tt} />
          </dd>
        </div>
        <div>
          <dt>{tt("payoff_credits")}</dt>
          <dd>
            <RewardValue type="credits" value={payoff.credits} signed tt={tt} />
          </dd>
        </div>
        <div>
          <dt>{tt("payoff_cards")}</dt>
          <dd>{payoff.cards}</dd>
        </div>
        <div>
          <dt>{tt("payoff_championship")}</dt>
          <dd>{payoff.championship}</dd>
        </div>
      </dl>
    </section>
  ) : null;

  return (
    <div className="result-view">
      {tab === "report" ? payoffPanel : null}
      <div id={`result-${tab}-panel`}>
        {tab === "replay" ? (
          <ReplayView
            result={result}
            circuit={circuit}
            playerTeamId={playerTeamId}
            teamLiveries={teamLiveries}
            traitImpacts={traitImpacts}
            preferencesResetSignal={preferencesResetSignal}
            showIntro={showReplayIntro}
            onClose={onClose}
            onOpenReport={onOpenReport}
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
            onOpenReplay={onOpenReplay}
            onClose={onClose}
            tt={tt}
          />
        )}
      </div>
      {tab === "replay" ? payoffPanel : null}
    </div>
  );
}

function playerRacePayoff(state: LeagueState, result: RaceResult, playerTeamId: string | undefined, tt: Translator) {
  const entry = result.classification.find((candidate) => candidate.teamId === playerTeamId);
  if (!entry) return null;
  const consumedCards = result.consumedCards.filter((card) => card.teamId === playerTeamId).map((card) => tt(`card_${card.cardId}` as TranslationKey));
  const championship = championshipMovement(state, result, playerTeamId, tt);
  return {
    position: entry.position,
    points: entry.points,
    credits: entry.credits,
    cards: consumedCards.length ? consumedCards.join(", ") : tt("payoff_no_cards"),
    championship
  };
}

function championshipMovement(state: LeagueState, result: RaceResult, playerTeamId: string | undefined, tt: Translator) {
  if (!playerTeamId) return tt("report_position_hold");
  const resultPoints = new Map(result.classification.map((entry) => [entry.teamId, entry.points]));
  const teamOrder = new Map(state.teams.map((team, index) => [team.id, index]));
  const before = [...state.teams].sort((left, right) => (right.points - (resultPoints.get(right.id) ?? 0)) - (left.points - (resultPoints.get(left.id) ?? 0)) || (teamOrder.get(left.id) ?? 999) - (teamOrder.get(right.id) ?? 999));
  const after = [...state.teams].sort((left, right) => right.points - left.points || (teamOrder.get(left.id) ?? 999) - (teamOrder.get(right.id) ?? 999));
  const beforeRank = before.findIndex((team) => team.id === playerTeamId) + 1;
  const afterRank = after.findIndex((team) => team.id === playerTeamId) + 1;
  if (!beforeRank || !afterRank) return tt("report_position_hold");
  const delta = beforeRank - afterRank;
  const movement = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : tt("report_position_hold");
  return `P${afterRank} (${movement})`;
}
