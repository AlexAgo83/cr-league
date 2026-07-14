import type { TranslationKey } from "../i18n/index.js";
import { statusLabel, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";

export function ChampionshipView({
  state,
  playerTeamId,
  onOpenLeagueControls,
  tt
}: {
  state: LeagueState;
  playerTeamId: string | undefined;
  onOpenLeagueControls: () => void;
  tt: Translator;
}) {
  const leader = state.teams[0];
  const currentGrandPrix = state.currentGrandPrix;
  const sortedHistory = [...state.grandPrixHistory].sort((left, right) => left.round - right.round);

  return (
    <div className="view-stack championship-view">
      <section className="panel championship-overview">
        <div>
          <span className="section-kicker">{tt("championship_kicker")}</span>
          <h2>{state.league.name}</h2>
          <div className="championship-meta">
            <span className="invite-code">{state.league.code}</span>
            <button type="button" className="secondary-button" onClick={onOpenLeagueControls}>
              {tt("settings_title")}
            </button>
          </div>
        </div>
        <div className="dashboard-summary" aria-label={tt("dashboard_summary")}>
          <div className="current-race-summary">
            <span>{tt("dashboard_current_gp")}</span>
            <strong>
              {tt("league_round")} {currentGrandPrix.round}
            </strong>
            <small>{statusLabel(currentGrandPrix.status, tt)}</small>
            <small>{tt(`next_action_${state.actionState.nextAction}` as TranslationKey)}</small>
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

      <div className="championship-grid">
        <div className="championship-main-column">
          <section className="panel championship-standings-panel">
            <h3>{tt("dashboard_standings")}</h3>
            <ol className="standings-table">
              {state.teams.map((team, index) => (
                <li key={team.id} className={team.id === playerTeamId ? "current-team" : undefined}>
                  <strong className="standings-rank">P{index + 1}</strong>
                  <span className="standings-team">
                    {team.name}
                    <small>{team.id === playerTeamId ? tt("team_you") : team.kind === "bot" ? tt("team_bot") : tt("team_player")}</small>
                  </span>
                  <span className={team.ready ? "ready-pill ready" : "ready-pill missing"}>
                    {team.ready ? tt("team_ready") : tt("team_missing")}
                  </span>
                  <span className="standings-score">
                    <strong>{team.points}</strong>
                    <small>{tt("unit_points")}</small>
                  </span>
                  <span className="standings-score">
                    <strong>{team.credits}</strong>
                    <small>{tt("unit_credits")}</small>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel championship-history-panel">
            <h3>{tt("league_history")}</h3>
            <ol className="round-timeline" aria-label={tt("league_history")}>
              {sortedHistory.map((grandPrix) => (
                <li key={grandPrix.id}>
                  <span
                    className={`round-chip status-${
                      grandPrix.status === currentGrandPrix.status && grandPrix.round === currentGrandPrix.round ? "current" : grandPrix.status
                    }`}
                  >
                    R{grandPrix.round}
                  </span>
                  <small>{statusLabel(grandPrix.status, tt)}</small>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
