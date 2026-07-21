import type { TranslationKey } from "../i18n/index.js";
import type { Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { PositionBadge } from "./PositionBadge.js";

export function OpponentConfigComparison({ state, playerTeamId, title, tt }: { state: LeagueState; playerTeamId?: string; title: string; tt: Translator }) {
  const resultByTeam = new Map(state.currentGrandPrix.result?.classification.map((entry) => [entry.teamId, entry]));
  const teamName = new Map(state.teams.map((team) => [team.id, team.name]));
  const rows = state.decisions
    .filter((decision) => decision.teamId !== playerTeamId)
    .map((decision) => ({ decision, result: resultByTeam.get(decision.teamId), teamName: teamName.get(decision.teamId) ?? decision.teamId }))
    .sort((left, right) => (left.result?.position ?? 999) - (right.result?.position ?? 999) || left.teamName.localeCompare(right.teamName));

  if (!rows.length) return null;

  return (
    <section className="panel opponent-config-comparison" aria-label={title}>
      <h3>{title}</h3>
      <p>{tt("opponent_config_body")}</p>
      <div className="opponent-config-table">
        {rows.map(({ decision, result, teamName }) => (
          <article key={decision.teamId} className="opponent-config-row">
            <div className="chrono-session-setup opponent-config-cells">
              <span className={`chrono-session-choice type-approach approach-${decision.approach}`}>
                <small>{tt("opponent_config_approach")}</small>
                <b>{tt(`approach_${decision.approach}` as TranslationKey)}</b>
              </span>
              <span className={`chrono-session-choice type-preparation preparation-${decision.preparation}`}>
                <small>{tt("opponent_config_preparation")}</small>
                <b>{tt(`preparation_${decision.preparation}` as TranslationKey)}</b>
              </span>
              <span className="chrono-session-choice type-pit">
                <small>{tt("opponent_config_pit")}</small>
                <b>{tt(`pit_strategy_${decision.pitStrategy ?? "standard"}_short` as TranslationKey)}</b>
              </span>
              <span className={`chrono-session-choice type-card${decision.cardId ? "" : " is-faded"}`}>
                <small>{tt("opponent_config_card")}</small>
                <b>{decision.cardId ? tt(`card_${decision.cardId}` as TranslationKey) : tt("card_none")}</b>
              </span>
            </div>
            <strong className="opponent-config-team">
              {result ? <PositionBadge position={result.position} /> : null}
              <span>{teamName}</span>
            </strong>
          </article>
        ))}
      </div>
    </section>
  );
}
