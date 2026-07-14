import type { TranslationKey } from "../i18n/index.js";
import { seasonWinsByTeamId, statusLabel, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import type { CSSProperties } from "react";

export function ChampionshipView({
  state,
  playerTeamId,
  onReplayGrandPrix,
  tt
}: {
  state: LeagueState;
  playerTeamId: string | undefined;
  onReplayGrandPrix: (grandPrix: LeagueState["grandPrixHistory"][number]) => void;
  tt: Translator;
}) {
  const leader = state.teams[0];
  const currentGrandPrix = state.currentGrandPrix;
  const sortedHistory = [...state.grandPrixHistory].sort((left, right) => left.season - right.season || left.round - right.round);
  const seasonWins = seasonWinsByTeamId(state);

  return (
    <div className="view-stack championship-view">
      <section className="panel championship-overview">
        <div>
          <span className="section-kicker">{tt("championship_kicker")}</span>
          <h2>{state.league.name}</h2>
          <div className="championship-meta">
            <span className="invite-code">{state.league.code}</span>
          </div>
        </div>
        <div className="dashboard-summary" aria-label={tt("dashboard_summary")}>
          <div className="current-race-summary">
            <span>{tt("dashboard_current_gp")}</span>
            <strong>
              {tt("league_season")} {currentGrandPrix.season} · {tt("league_round")} {currentGrandPrix.round}/{state.league.maxGrandPrixPerSeason}
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
            {leader ? (
              <strong className="leader-team-line">
                <span
                  className="standings-livery-plate leader-livery-plate"
                  style={{ "--livery-primary": leader.livery.primary, "--livery-secondary": leader.livery.secondary } as CSSProperties & Record<string, string>}
                >
                  <span className="livery-plate-text">{leader.name.slice(0, 3).toUpperCase()}</span>
                  <PlateStars count={seasonWins.get(leader.id) ?? 0} />
                </span>
                <span>{leader.name}</span>
              </strong>
            ) : (
              <strong>-</strong>
            )}
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
                  <span
                    className="standings-livery-plate"
                    style={{ "--livery-primary": team.livery.primary, "--livery-secondary": team.livery.secondary } as CSSProperties & Record<string, string>}
                  >
                    <span className="livery-plate-text">{team.name.slice(0, 3).toUpperCase()}</span>
                    <PlateStars count={seasonWins.get(team.id) ?? 0} />
                  </span>
                  <span className="standings-team">
                    {team.name}
                    <small>{team.id === playerTeamId ? tt("team_you") : team.kind === "bot" ? tt("team_bot") : tt("team_player")}</small>
                  </span>
                  <span className={team.ready ? "ready-pill ready" : "ready-pill missing"}>
                    {team.ready ? tt("team_ready") : tt("team_missing")}
                  </span>
                  <span className="standings-score standings-points">
                    <strong>{team.points}</strong>
                    <small>{tt("unit_points")}</small>
                  </span>
                  <span className="standings-score standings-credits">
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
              {sortedHistory.map((grandPrix) => {
                const chip = (
                  <span
                    className={`round-chip status-${
                      grandPrix.status === currentGrandPrix.status && grandPrix.season === currentGrandPrix.season && grandPrix.round === currentGrandPrix.round
                        ? "current"
                        : grandPrix.status
                    }`}
                  >
                    S{grandPrix.season} R{grandPrix.round}
                  </span>
                );
                return (
                  <li key={grandPrix.id}>
                    {grandPrix.result ? (
                      <button type="button" className="round-history-button" onClick={() => onReplayGrandPrix(grandPrix)}>
                        {chip}
                      </button>
                    ) : (
                      chip
                    )}
                    <small>{historyLabel(grandPrix, playerTeamId, tt)}</small>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function PlateStars({ count }: { count: number }) {
  const stars = "★".repeat(Math.min(count, 5));
  return stars ? <span className="livery-plate-stars">{stars}</span> : null;
}

function historyLabel(grandPrix: LeagueState["grandPrixHistory"][number], playerTeamId: string | undefined, tt: Translator) {
  const position = playerTeamId ? grandPrix.result?.classification.find((entry) => entry.teamId === playerTeamId)?.position : undefined;
  return position ? `P${position}` : statusLabel(grandPrix.status, tt);
}
