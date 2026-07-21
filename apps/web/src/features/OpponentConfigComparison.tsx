import type { CSSProperties } from "react";
import type { CardId, RaceResult } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { CARD_ART } from "./CardStatBadges.js";
import { APPROACH_ART, PIT_ART, PREPARATION_ART } from "./DirectivePanel.js";
import { PositionBadge } from "./PositionBadge.js";

const chronoChoiceStyle = (src?: string) => (src ? ({ "--chrono-choice-image": `url("${src}")` } as CSSProperties) : undefined);

export function OpponentConfigComparison({ state, result = state.currentGrandPrix.result, playerTeamId, title, tt }: { state: LeagueState; result?: RaceResult | null; playerTeamId?: string; title: string; tt: Translator }) {
  const resultByTeam = new Map(result?.classification.map((entry) => [entry.teamId, entry]));
  const consumedCardByTeam = new Map(result?.consumedCards.map((entry) => [entry.teamId, entry.cardId]));
  const teamName = new Map(state.teams.map((team) => [team.id, team.name]));
  const rows = state.decisions
    .filter((decision) => decision.teamId !== playerTeamId)
    .map((decision) => ({ decision, cardId: (decision.cardId ?? consumedCardByTeam.get(decision.teamId)) as CardId | undefined, result: resultByTeam.get(decision.teamId), teamName: teamName.get(decision.teamId) ?? decision.teamId }))
    .sort((left, right) => (left.result?.position ?? 999) - (right.result?.position ?? 999) || left.teamName.localeCompare(right.teamName));

  if (!rows.length) return null;

  return (
    <section className="panel opponent-config-comparison" aria-label={title}>
      <h3>{title}</h3>
      <div className="opponent-config-table">
        {rows.map(({ decision, cardId, result, teamName }) => (
          <article key={decision.teamId} className="opponent-config-row">
            <strong className="opponent-config-team">
              {result ? <PositionBadge position={result.position} /> : null}
              <span>{teamName}</span>
            </strong>
            <div className="chrono-session-setup opponent-config-cells">
              <span className={`chrono-session-choice type-approach approach-${decision.approach}`} style={chronoChoiceStyle(APPROACH_ART[decision.approach])}>
                <small>{tt("opponent_config_approach")}</small>
                <b>{tt(`approach_${decision.approach}` as TranslationKey)}</b>
              </span>
              <span className={`chrono-session-choice type-preparation preparation-${decision.preparation}`} style={chronoChoiceStyle(PREPARATION_ART[decision.preparation])}>
                <small>{tt("opponent_config_preparation")}</small>
                <b>{tt(`preparation_${decision.preparation}` as TranslationKey)}</b>
              </span>
              <span className="chrono-session-choice type-pit" style={chronoChoiceStyle(PIT_ART[decision.pitStrategy ?? "standard"])}>
                <small>{tt("opponent_config_pit")}</small>
                <b>{tt(`pit_strategy_${decision.pitStrategy ?? "standard"}_short` as TranslationKey)}</b>
              </span>
              <span className={`chrono-session-choice type-card${cardId ? "" : " is-faded"}`} style={chronoChoiceStyle(cardId ? CARD_ART[cardId] : undefined)}>
                <small>{tt("opponent_config_card")}</small>
                <b>{cardId ? tt(`card_${cardId}` as TranslationKey) : tt("card_none")}</b>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
