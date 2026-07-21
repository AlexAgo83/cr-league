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
            <strong>
              {result ? <PositionBadge position={result.position} /> : null}
              <span>{teamName}</span>
            </strong>
            <dl>
              <div>
                <dt>{tt("opponent_config_approach")}</dt>
                <dd>{tt(`approach_${decision.approach}` as TranslationKey)}</dd>
              </div>
              <div>
                <dt>{tt("opponent_config_preparation")}</dt>
                <dd>{tt(`preparation_${decision.preparation}` as TranslationKey)}</dd>
              </div>
              <div>
                <dt>{tt("opponent_config_pit")}</dt>
                <dd>{tt(`pit_strategy_${decision.pitStrategy ?? "standard"}_short` as TranslationKey)}</dd>
              </div>
              <div>
                <dt>{tt("opponent_config_card")}</dt>
                <dd>{decision.cardId ? tt(`card_${decision.cardId}` as TranslationKey) : tt("card_none")}</dd>
              </div>
              {result ? (
                <div>
                  <dt>{tt("opponent_config_result")}</dt>
                  <dd>{tt("opponent_config_result_value", { points: result.points, credits: result.credits })}</dd>
                </div>
              ) : null}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
