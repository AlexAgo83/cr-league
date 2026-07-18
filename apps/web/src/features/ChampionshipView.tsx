import { useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { completedSeasonSummaries, seasonWinsByTeamId, statusLabel, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { LiveryPlate } from "./LiveryPlate.js";

export function ChampionshipView({
  state,
  playerTeamId,
  onReplayGrandPrix,
  onOpenSeasonRecap,
  tt
}: {
  state: LeagueState;
  playerTeamId: string | undefined;
  onReplayGrandPrix: (grandPrix: LeagueState["grandPrixHistory"][number]) => void;
  onOpenSeasonRecap: (season: number) => void;
  tt: Translator;
}) {
  const leader = state.teams[0];
  const currentGrandPrix = state.currentGrandPrix;
  const sortedHistory = [...state.grandPrixHistory].sort((left, right) => left.season - right.season || left.round - right.round);
  const historyBySeason = groupHistoryBySeason(sortedHistory);
  const completedSeasons = completedSeasonSummaries(state);
  const completedBySeason = new Map(completedSeasons.map((season) => [season.season, season]));
  const seasonWins = seasonWinsByTeamId(state);
  const [recordTab, setRecordTab] = useState<"standings" | "palmares" | "history">("standings");
  const recordTabs = [
    { key: "standings" as const, label: tt("dashboard_standings") },
    { key: "palmares" as const, label: tt("season_palmares") },
    { key: "history" as const, label: tt("league_history") }
  ];
  const activeRecordLabel = recordTabs.find((tab) => tab.key === recordTab)?.label ?? tt("dashboard_standings");

  return (
    <div className="view-stack championship-view">
      <section className="panel championship-overview">
        <div>
          <span className="section-kicker">{tt("championship_kicker")}</span>
          <h2>{state.league.name}</h2>
        </div>
        <div className="dashboard-summary" aria-label={tt("dashboard_summary")}>
          <div className="current-race-summary">
            <h3>{tt("dashboard_current_gp")}</h3>
            <strong>
              {tt("league_season")} {currentGrandPrix.season} · {tt("league_round")} {currentGrandPrix.round}/{state.league.maxGrandPrixPerSeason}
            </strong>
            <small>{statusLabel(currentGrandPrix.status, tt)}</small>
            <small>{tt(`next_action_${state.actionState.nextAction}` as TranslationKey)}</small>
          </div>
          <div>
            <span>{tt("dashboard_leader")}</span>
            {leader ? (
              <strong className="leader-team-line">
                <LiveryPlate className="standings-livery-plate leader-livery-plate" livery={leader.livery} name={leader.name} wins={seasonWins.get(leader.id) ?? 0} />
                <span>{leader.name}</span>
              </strong>
            ) : (
              <strong>-</strong>
            )}
            <small>
              {leader?.points ?? 0} {tt("unit_points")}
            </small>
          </div>
          <div className="league-flow-summary">
            <span>{tt("dashboard_players")}</span>
            <strong>
              {state.actionState.submittedTeamIds.length}/{state.teams.length}
            </strong>
            <small>
              {tt("league_ready")} · {tt(`cadence_${state.league.cadence}` as TranslationKey)}
            </small>
          </div>
        </div>
      </section>

      <div className="championship-grid">
        <section className="panel championship-record-panel">
          <header className={`championship-record-header record-hero-header record-hero-${recordTab}`}>
            <h3>{activeRecordLabel}</h3>
            <div className="championship-record-switch" role="tablist" aria-label={tt("championship_kicker")}>
              {recordTabs.map((tab) => (
                <button key={tab.key} type="button" role="tab" aria-selected={recordTab === tab.key} className={recordTab === tab.key ? "active" : undefined} onClick={() => setRecordTab(tab.key)}>
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {recordTab === "standings" ? (
            <ol className="standings-table">
              {state.teams.map((team, index) => (
                <li key={team.id} className={team.id === playerTeamId ? "current-team" : undefined}>
                  <strong className="standings-rank">P{index + 1}</strong>
                  <LiveryPlate className="standings-livery-plate" livery={team.livery} name={team.name} wins={seasonWins.get(team.id) ?? 0} />
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
          ) : null}

          {recordTab === "palmares" ? (
            <ol className="palmares-list">
              {completedSeasons.map((season) => (
                <li key={season.season}>
                  <button type="button" className="palmares-button" onClick={() => onOpenSeasonRecap(season.season)}>
                    <span>{season.champion.livery ? <LiveryPlate className="standings-livery-plate" livery={season.champion.livery} name={season.champion.teamName} /> : null}</span>
                    <strong>
                      {tt("league_season")} {season.season}
                    </strong>
                    <span>{season.champion.teamName}</span>
                    <small>
                      {season.gpCount} {tt("season_gp_count")}
                    </small>
                  </button>
                </li>
              ))}
            </ol>
          ) : null}

          {recordTab === "history" ? (
            <div className="season-history-groups" aria-label={tt("league_history")}>
                {historyBySeason.map(([season, grandPrixList]) => {
                  const summary = completedBySeason.get(season);
                  return (
                    <details key={season} className="season-history-group" open={season === currentGrandPrix.season}>
                      <summary>
                        <strong>
                          {tt("league_season")} {season}
                        </strong>
                        <small>{summary ? `${summary.champion.teamName} · ${summary.gpCount} ${tt("season_gp_count")}` : tt("season_current")}</small>
                      </summary>
                      <ol className="round-timeline">
                        {grandPrixList.map((grandPrix) => {
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
                    </details>
                  );
                })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function historyLabel(grandPrix: LeagueState["grandPrixHistory"][number], playerTeamId: string | undefined, tt: Translator) {
  const position = playerTeamId ? grandPrix.result?.classification.find((entry) => entry.teamId === playerTeamId)?.position : undefined;
  return position ? `P${position}` : statusLabel(grandPrix.status, tt);
}

function groupHistoryBySeason(history: LeagueState["grandPrixHistory"]) {
  const groups = new Map<number, LeagueState["grandPrixHistory"]>();
  for (const grandPrix of history) {
    groups.set(grandPrix.season, [...(groups.get(grandPrix.season) ?? []), grandPrix]);
  }
  return [...groups.entries()].sort((left, right) => right[0] - left[0]);
}
