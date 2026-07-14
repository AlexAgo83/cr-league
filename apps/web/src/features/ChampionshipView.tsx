import type { TranslationKey } from "../i18n/index.js";
import { statusLabel, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";

export function ChampionshipView({
  state,
  playerTeamId,
  loading,
  onRestartLeague,
  tt
}: {
  state: LeagueState;
  playerTeamId: string | undefined;
  loading: boolean;
  onRestartLeague: () => void;
  tt: Translator;
}) {
  const leader = state.teams[0];

  return (
    <div className="view-stack">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">{tt("championship_kicker")}</span>
            <h2>{state.league.name}</h2>
          </div>
        </div>
        <div className="dashboard-summary" aria-label={tt("dashboard_summary")}>
          <div>
            <span>{tt("dashboard_current_gp")}</span>
            <strong>
              {tt("league_round")} {state.currentGrandPrix.round}
            </strong>
            <small>{statusLabel(state.currentGrandPrix.status, tt)}</small>
          </div>
          <div>
            <span>{tt("dashboard_players")}</span>
            <strong>
              {state.actionState.submittedTeamIds.length}/{state.teams.length}
            </strong>
            <small>{tt("league_ready")}</small>
          </div>
          <div>
            <span>{tt("dashboard_leader")}</span>
            <strong>{leader?.name ?? "-"}</strong>
            <small>
              {leader?.points ?? 0} {tt("unit_points")}
            </small>
          </div>
          <div>
            <span>{tt("league_cadence")}</span>
            <strong>{tt(`cadence_${state.league.cadence}` as TranslationKey)}</strong>
            <small>{tt(`next_action_${state.actionState.nextAction}` as TranslationKey)}</small>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3>{tt("dashboard_standings")}</h3>
        <ol className="classification standings-list">
          {state.teams.map((team, index) => (
            <li key={team.id} className={team.id === playerTeamId ? "current-team" : undefined}>
              <span>
                <strong>P{index + 1}</strong> {team.name}
                <small>
                  {team.id === playerTeamId ? tt("team_you") : team.kind === "bot" ? tt("team_bot") : tt("team_player")} ·{" "}
                  {team.ready ? tt("team_ready") : tt("team_missing")}
                </small>
              </span>
              <span>
                {team.points} {tt("unit_points")} · {team.credits} {tt("unit_credits")}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h3>{tt("league_history")}</h3>
        <ol className="classification">
          {state.grandPrixHistory.map((grandPrix) => (
            <li key={grandPrix.id}>
              <span>
                {tt("league_round")} {grandPrix.round}
              </span>
              <span>{statusLabel(grandPrix.status, tt)}</span>
            </li>
          ))}
        </ol>
        <div className="actions secondary-actions">
          <button type="button" onClick={onRestartLeague} disabled={loading}>
            {tt("action_restart_league")}
          </button>
        </div>
      </section>
    </div>
  );
}
