import { useEffect, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { CITY_CIRCUITS, circuitsForSeason, type CityCircuit } from "../app/circuits.js";
import { completedSeasonSummaries, seasonWinsByTeamId, statusLabel, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { CircuitMap } from "./CircuitMap.js";
import { LiveryPlate } from "./LiveryPlate.js";
import { RewardValue } from "./RewardValue.js";
import { CountryBadge, VisualIcon } from "./VisualIcon.js";

export type ChampionshipRecordTab = "standings" | "calendar" | "palmares" | "history";
export const CHAMPIONSHIP_RECORD_TAB_KEY = "cr-league-championship-record-tab";

export function savedRecordTab(): ChampionshipRecordTab {
  const saved = localStorage.getItem(CHAMPIONSHIP_RECORD_TAB_KEY);
  return saved === "calendar" || saved === "palmares" || saved === "history" ? saved : "standings";
}

export function ChampionshipView({
  state,
  playerTeamId,
  recordTab,
  onReplayGrandPrix,
  onOpenSeasonRecap,
  onSelectRecordTab,
  tt
}: {
  state: LeagueState;
  playerTeamId: string | undefined;
  recordTab: ChampionshipRecordTab;
  onReplayGrandPrix: (grandPrix: LeagueState["grandPrixHistory"][number]) => void;
  onOpenSeasonRecap: (season: number) => void;
  onSelectRecordTab: (tab: ChampionshipRecordTab) => void;
  tt: Translator;
}) {
  const leader = state.teams[0];
  const currentGrandPrix = state.currentGrandPrix;
  const sortedHistory = [...state.grandPrixHistory].sort((left, right) => left.season - right.season || left.round - right.round);
  const historyBySeason = groupHistoryBySeason(sortedHistory);
  const completedSeasons = completedSeasonSummaries(state);
  const completedBySeason = new Map(completedSeasons.map((season) => [season.season, season]));
  const seasonWins = seasonWinsByTeamId(state);
  const [previewCircuit, setPreviewCircuit] = useState<CityCircuit | undefined>();
  const seasonCircuits = circuitsForSeason(state.league.id, currentGrandPrix.season);
  const catalogCircuits = [...CITY_CIRCUITS].sort((left, right) => tt(left.layoutKey).localeCompare(tt(right.layoutKey), undefined, { sensitivity: "base" }));
  const seasonRoundsByLayout = new Map<string, number[]>();
  for (let round = 1; round <= state.league.maxGrandPrixPerSeason; round += 1) {
    const circuit = seasonCircuits[(round - 1) % seasonCircuits.length]!;
    seasonRoundsByLayout.set(circuit.layoutKey, [...(seasonRoundsByLayout.get(circuit.layoutKey) ?? []), round]);
  }
  const recordTabs = [
    { key: "standings" as const, label: tt("dashboard_standings") },
    { key: "calendar" as const, label: tt("championship_calendar") },
    ...(completedSeasons.length ? [{ key: "palmares" as const, label: tt("season_palmares") }] : []),
    { key: "history" as const, label: tt("league_history") }
  ];
  const activeRecordTab = recordTabs.some((tab) => tab.key === recordTab) ? recordTab : "standings";
  const activeRecordLabel = recordTabs.find((tab) => tab.key === activeRecordTab)?.label ?? tt("dashboard_standings");
  const selectRecordTab = (nextTab: ChampionshipRecordTab) => {
    localStorage.setItem(CHAMPIONSHIP_RECORD_TAB_KEY, nextTab);
    setPreviewCircuit(undefined);
    onSelectRecordTab(nextTab);
  };

  useEffect(() => {
    setPreviewCircuit(undefined);
  }, [activeRecordTab]);

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
              <RewardValue type="points" value={leader?.points ?? 0} tt={tt} />
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
        <section className={`panel championship-record-panel record-panel-${activeRecordTab}`}>
          <header className={`championship-record-header record-hero-header record-hero-${activeRecordTab}`}>
            <h3>{activeRecordLabel}</h3>
            <div className="championship-record-switch" role="tablist" aria-label={tt("championship_kicker")}>
              {recordTabs.map((tab) => (
                <button key={tab.key} type="button" role="tab" aria-selected={activeRecordTab === tab.key} className={activeRecordTab === tab.key ? "active" : undefined} onClick={() => selectRecordTab(tab.key)}>
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {activeRecordTab === "standings" ? (
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
                    <RewardValue type="points" value={team.points} tt={tt} />
                  </span>
                  <span className="standings-score standings-credits">
                    <RewardValue type="credits" value={team.credits} tt={tt} />
                  </span>
                </li>
              ))}
            </ol>
          ) : null}

          {activeRecordTab === "calendar" && previewCircuit ? (
            <div className="circuit-detail-screen">
              <div className="circuit-detail-header">
                <div>
                  <span className="circuit-city">
                    <CountryBadge country={previewCircuit.country} /> {previewCircuit.city}
                  </span>
                  <h4>{tt(previewCircuit.layoutKey)}</h4>
                </div>
                <button type="button" className="secondary-button circuit-detail-close" aria-label={tt("action_close")} onClick={() => setPreviewCircuit(undefined)}>
                  ×
                </button>
              </div>
              <CircuitMap circuit={previewCircuit} tt={tt} showHeading={false} showTraits={false} />
            </div>
          ) : null}

          {activeRecordTab === "calendar" && !previewCircuit ? (
            <ol className="circuit-calendar-list" aria-label={tt("championship_calendar")}>
              {catalogCircuits.map((circuit) => {
                const rounds = seasonRoundsByLayout.get(circuit.layoutKey) ?? [];
                return (
                  <li key={`${circuit.city}-${circuit.layoutKey}`} className={rounds.includes(currentGrandPrix.round) ? "current-circuit" : undefined}>
                    <button type="button" className="circuit-calendar-button" aria-label={`${circuit.city} ${tt(circuit.layoutKey)}`} onClick={() => setPreviewCircuit(circuit)}>
                      <MiniCircuit circuit={circuit} />
                      <span>
                        <span className="circuit-city">
                          <CountryBadge country={circuit.country} /> {circuit.city}
                        </span>
                        <strong>{tt(circuit.layoutKey)}</strong>
                        <small>
                          {circuit.laps} {tt("unit_laps")} · <VisualIcon name={circuit.likelyWeather} /> {tt(`weather_${circuit.likelyWeather}` as TranslationKey)}
                        </small>
                      </span>
                      {rounds.length ? (
                        <span className="circuit-order-badges circuit-order-badges-used">
                          {rounds.map((round) => <span key={round} className={round === currentGrandPrix.round ? "current-round-badge" : undefined}>{round}</span>)}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : null}

          {activeRecordTab === "palmares" ? (
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

          {activeRecordTab === "history" ? (
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

function MiniCircuit({ circuit }: { circuit: CityCircuit }) {
  return (
    <svg className="mini-circuit-map" viewBox="0 0 100 64" aria-hidden="true" focusable="false">
      <path d={miniRoutePath(circuit.route)} />
    </svg>
  );
}

function miniRoutePath(route: CityCircuit["route"]) {
  const lngs = route.map((point) => point.lng);
  const lats = route.map((point) => point.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const scaleX = maxLng - minLng || 1;
  const scaleY = maxLat - minLat || 1;
  return route
    .map((point, index) => {
      const x = 8 + ((point.lng - minLng) / scaleX) * 84;
      const y = 56 - ((point.lat - minLat) / scaleY) * 48;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
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
