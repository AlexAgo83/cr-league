import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useT } from "../i18n/index.js";
import { circuitStatsForTeam, type CircuitTeamStats, type TeamLivery } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import { CITY_CIRCUITS, circuitsForSeason, circuitsInRegion, regionsWithCircuits, withRoute, type CircuitRegion, type CityCircuit } from "../app/circuits.js";
import { safeStorage } from "../app/appStorage.js";
import { completedSeasonSummaries, standingsRival, seasonWinsByTeamId, statusLabel } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { CHAMPIONSHIP_RECORD_TAB_KEY, type ChampionshipRecordTab } from "../app/viewPreferences.js";
import { AssetImage } from "./AssetImage.js";
import { CircuitMap, analyzeCircuitRoute, type MapCar } from "./CircuitMap.js";
import { carAssetForId } from "./carAssets.js";
import { applyTrackSpeedProfile } from "./replay/replayMath.js";
import { TeamHelmet } from "./replay/ReplayTower.js";
import { Modal } from "./Modal.js";
import { PositionBadge } from "./PositionBadge.js";
import { RewardValue } from "./RewardValue.js";
import { BoardIcon, CountryBadge, VisualIcon, type BoardIconName } from "./VisualIcon.js";
import { SectionSwitch, type SectionSwitchItem } from "./SectionSwitch.js";
export { COUNTRY_REGION } from "../app/circuits.js";

const CIRCUIT_PAGE_SIZE = 8;
const RECORD_TAB_ICONS: Record<ChampionshipRecordTab, BoardIconName> = {
  calendar: "circuit-preview",
  standings: "standings-board",
  palmares: "honors",
  history: "gp-history"
};

export function ChampionshipView({
  state,
  playerTeamId,
  recordTab,
  onReplayGrandPrix,
  onOpenSeasonRecap,
  onSelectRecordTab
}: {
  state: LeagueState;
  playerTeamId: string | undefined;
  recordTab: ChampionshipRecordTab;
  onReplayGrandPrix: (grandPrix: LeagueState["grandPrixHistory"][number]) => void;
  onOpenSeasonRecap: (season: number) => void;
  onSelectRecordTab: (tab: ChampionshipRecordTab) => void;
}) {
  const tt = useT();
  const leader = rankTeams(state)[0];
  const currentGrandPrix = state.currentGrandPrix;
  const sortedHistory = [...state.grandPrixHistory].sort((left, right) => left.season - right.season || left.round - right.round);
  const historyBySeason = groupHistoryBySeason(sortedHistory);
  const completedSeasons = completedSeasonSummaries(state);
  const completedBySeason = new Map(completedSeasons.map((season) => [season.season, season]));
  const seasonWins = seasonWinsByTeamId(state);
  const rankedTeams = rankTeams(state);
  // Per-team, per-circuit: wins and finishes come from history, the best time from the stored record.
  const circuitStats = useMemo(() => circuitStatsForTeam(state, playerTeamId), [state, playerTeamId]);
  const playerRival = standingsRival(state, playerTeamId);
  const [profileTeamId, setProfileTeamId] = useState<string | undefined>();
  const [previewCircuit, setPreviewCircuit] = useState<CityCircuit | undefined>();
  const [previewFocus, setPreviewFocus] = useState(true);
  const seasonCircuits = circuitsForSeason(state.league.id, currentGrandPrix.season);
  const previewCar = useMemo(() => previewCircuit ? circuitPreviewCar(previewCircuit, state, playerTeamId) : undefined, [playerTeamId, previewCircuit, state]);
  const previewClock = useCircuitPreviewClock(previewCircuit, previewCar);
  const catalogCircuits = CITY_CIRCUITS.map(withRoute).sort((left, right) => tt(left.layoutKey).localeCompare(tt(right.layoutKey), undefined, { sensitivity: "base" }));
  const [circuitQuery, setCircuitQuery] = useState("");
  // The starter pack opens the catalogue: seventy-one circuits is a lot to meet at once.
  const [circuitRegion, setCircuitRegion] = useState<"all" | CircuitRegion>("starter");
  const [circuitPage, setCircuitPage] = useState(0);
  const availableRegions = regionsWithCircuits(catalogCircuits);
  const filteredCircuits = circuitsInRegion(circuitRegion, catalogCircuits).filter((circuit) => {
    const query = circuitQuery.trim().toLowerCase();
    return !query || circuit.city.toLowerCase().includes(query) || tt(circuit.layoutKey).toLowerCase().includes(query);
  });
  const circuitPageCount = Math.max(1, Math.ceil(filteredCircuits.length / CIRCUIT_PAGE_SIZE));
  const circuitPageIndex = Math.min(circuitPage, circuitPageCount - 1);
  const seasonRoundsByLayout = new Map<string, number[]>();
  for (let round = 1; round <= state.league.maxGrandPrixPerSeason; round += 1) {
    const circuit = seasonCircuits[(round - 1) % seasonCircuits.length]!;
    seasonRoundsByLayout.set(circuit.layoutKey, [...(seasonRoundsByLayout.get(circuit.layoutKey) ?? []), round]);
  }
  const pageCircuits = visiblePageCircuits(filteredCircuits, circuitPageIndex, seasonCircuits[(currentGrandPrix.round - 1) % seasonCircuits.length]);
  const recordTabs: Array<SectionSwitchItem<ChampionshipRecordTab>> = [
    { key: "calendar" as const, label: tt("championship_calendar") },
    { key: "standings" as const, label: tt("dashboard_standings") },
    ...(completedSeasons.length ? [{ key: "palmares" as const, label: tt("season_palmares") }] : []),
    { key: "history" as const, label: tt("league_history") }
  ].map((tab) => ({ ...tab, displayLabel: tab.key === "history" ? compactHistoryLabel(tab.label) : undefined, icon: RECORD_TAB_ICONS[tab.key] }));
  const activeRecordTab = recordTabs.some((tab) => tab.key === recordTab) ? recordTab : "calendar";
  const activeRecordLabel = recordTabs.find((tab) => tab.key === activeRecordTab)?.label ?? tt("championship_calendar");
  const profileTeam = state.teams.find((team) => team.id === profileTeamId);
  const selectRecordTab = (nextTab: ChampionshipRecordTab) => {
    safeStorage.set(CHAMPIONSHIP_RECORD_TAB_KEY, nextTab);
    setPreviewCircuit(undefined);
    onSelectRecordTab(nextTab);
  };
  // Nav within the filtered list so prev/next never jumps to a circuit hidden by the current filters.
  const previewCircuitIndex = previewCircuit ? filteredCircuits.findIndex((circuit) => circuit.layoutKey === previewCircuit.layoutKey && circuit.city === previewCircuit.city) : -1;
  const selectAdjacentPreviewCircuit = (direction: -1 | 1) => {
    if (previewCircuitIndex < 0 || filteredCircuits.length === 0) return;
    setPreviewCircuit(filteredCircuits[(previewCircuitIndex + direction + filteredCircuits.length) % filteredCircuits.length]);
  };

  useEffect(() => {
    setPreviewCircuit(undefined);
  }, [activeRecordTab]);

  return (
    <div className="view-stack championship-view">
      <SectionSwitch label={tt("championship_kicker")} items={recordTabs} activeKey={activeRecordTab} className="championship-record-switch" itemDataAttribute="data-record-tab" onSelect={selectRecordTab} />
      <section className="panel championship-overview">
        <div>
          <span className="section-kicker">{tt("championship_kicker")}</span>
          <div className="championship-title">
            <h2>{state.league.name}</h2>
            {state.league.code ? <span className="invite-code">{state.league.code}</span> : null}
          </div>
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
                <TeamHelmet className="standings-livery-plate leader-livery-plate" livery={leader.livery} />
                <span>{leader.name}</span>
              </strong>
            ) : (
              <strong>-</strong>
            )}
            <small>
              <RewardValue type="points" value={leader?.points ?? 0} />
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
        <section className={`panel championship-record-panel record-panel-${activeRecordTab}${activeRecordTab === "calendar" && previewCircuit ? " circuit-preview-open" : ""}`}>
          <header className={`championship-record-header record-hero-header record-hero-${activeRecordTab}`}>
            <h3>{activeRecordLabel}</h3>
          </header>

          {activeRecordTab === "standings" ? (
            <ol className="standings-table">
              {rankedTeams.map((team, index) => (
                <li key={team.id} className={team.id === playerTeamId ? "current-team" : undefined}>
                  <ChampionshipCarBackdrop livery={team.livery} />
                  <PositionBadge position={index + 1} className="standings-rank" />
                  <button type="button" className="standings-profile-button" aria-label={tt("team_profile_open", { team: team.name })} onClick={() => setProfileTeamId(team.id)}>
                    <TeamHelmet className="standings-livery-plate" livery={team.livery} />
                    <span className="standings-team">
                      {team.name}
                      <small>{team.id === playerTeamId ? tt("team_you") : team.kind === "bot" ? tt("team_bot") : tt("team_player")}</small>
                      {team.id === playerRival?.teamId ? <small className="rival-marker">{tt("rival_marker", { gap: playerRival.pointsGap })}</small> : null}
                    </span>
                  </button>
                  <span className={team.ready ? "ready-pill ready" : "ready-pill missing"}>
                    {team.ready ? tt("team_ready") : tt("team_missing")}
                  </span>
                  <span className="standings-score standings-points">
                    <RewardValue type="points" value={team.points} />
                  </span>
                  <span className="standings-score standings-credits">
                    <RewardValue type="credits" value={team.credits} />
                  </span>
                </li>
              ))}
            </ol>
          ) : null}

          {activeRecordTab === "calendar" && previewCircuit ? (
            <div className="circuit-detail-screen">
              <CircuitMap
                circuit={previewCircuit}
                cars={previewCar ? [previewCar] : []}
                carProgressRef={previewClock.carProgressRef}
                camera={{ enabled: previewFocus && Boolean(previewCar), car: previewCar, timeRef: previewClock.timeRef, zoom: 3.4 }}
                showHeading={false}
                showTraits={false}
                overlay={
                  <>
                    <div className="circuit-detail-header">
                      <span className="circuit-city">
                        <CountryBadge country={previewCircuit.country} /> {previewCircuit.city}
                      </span>
                      <h4>{tt(previewCircuit.layoutKey)}</h4>
                    </div>
                    <div className="circuit-detail-actions">
                      <button
                        type="button"
                        className={previewFocus ? "secondary-button circuit-detail-focus active" : "secondary-button circuit-detail-focus"}
                        aria-label={tt("action_focus_driver")}
                        aria-pressed={previewFocus}
                        title={tt("action_focus_driver")}
                        onClick={() => setPreviewFocus(!previewFocus)}
                      >
                        <svg className="replay-focus-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M8 4H6a2 2 0 0 0-2 2v2" />
                          <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                          <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
                          <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button type="button" className="secondary-button circuit-detail-close" aria-label={tt("action_close")} onClick={() => setPreviewCircuit(undefined)}>
                        ×
                      </button>
                    </div>
                    <button type="button" className="secondary-button circuit-detail-nav circuit-detail-nav-prev" aria-label={tt("action_previous_circuit")} onClick={() => selectAdjacentPreviewCircuit(-1)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <button type="button" className="secondary-button circuit-detail-nav circuit-detail-nav-next" aria-label={tt("action_next_circuit")} onClick={() => selectAdjacentPreviewCircuit(1)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                    <CircuitStatsPanel stats={circuitStats.get(previewCircuit.layoutKey)} />
                  </>
                }
              />
            </div>
          ) : null}

          {activeRecordTab === "calendar" && !previewCircuit ? (
            <>
            <div className="circuit-filter-bar">
              <input
                type="search"
                className="circuit-filter-search"
                value={circuitQuery}
                placeholder={tt("circuit_filter_search")}
                aria-label={tt("circuit_filter_search")}
                onChange={(event) => {
                  setCircuitQuery(event.target.value);
                  setCircuitPage(0);
                }}
              />
              <select
                className="circuit-filter-region"
                value={circuitRegion}
                aria-label={tt("circuit_filter_region")}
                onChange={(event) => {
                  setCircuitRegion(event.target.value as "all" | CircuitRegion);
                  setCircuitPage(0);
                }}
              >
                <option value="all">{tt("circuit_region_all")}</option>
                {availableRegions.map((region) => (
                  <option key={region} value={region}>{tt(`circuit_region_${region}` as TranslationKey)}</option>
                ))}
              </select>
              <span className="circuit-filter-count">{tt("circuit_filter_count", { count: filteredCircuits.length })}</span>
            </div>
            {filteredCircuits.length === 0 ? (
              <p className="circuit-filter-empty empty-state-line">
                <BoardIcon className="empty-state-inline-icon" name="no-circuit-match" />
                {tt("circuit_filter_empty")}
              </p>
            ) : null}
            <ol className="circuit-calendar-list" aria-label={tt("championship_calendar")}>
              {pageCircuits.map((circuit) => {
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
                        <CircuitStatsLine stats={circuitStats.get(circuit.layoutKey)} />
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
            {circuitPageCount > 1 ? (
              <div className="circuit-pagination">
                {/* Not .secondary-button: it paints a disabled arrow as a pale slab and an
                    enabled one as near-invisible muted text on the dark panel. */}
                <button type="button" aria-label={tt("admin_action_previous_page")} disabled={circuitPageIndex === 0} onClick={() => setCircuitPage(circuitPageIndex - 1)}>
                  <PagerChevron direction="left" />
                </button>
                <span aria-live="polite">{circuitPageIndex + 1} / {circuitPageCount}</span>
                <button type="button" aria-label={tt("action_next")} disabled={circuitPageIndex >= circuitPageCount - 1} onClick={() => setCircuitPage(circuitPageIndex + 1)}>
                  <PagerChevron direction="right" />
                </button>
              </div>
            ) : null}
            </>
          ) : null}

          {activeRecordTab === "palmares" ? (
            <ol className="palmares-list">
              {completedSeasons.map((season) => (
                <li key={season.season}>
                  <button
                    type="button"
                    className="palmares-button"
                    aria-label={`${tt("league_season")} ${season.season} ${season.champion.teamName}`}
                    onClick={() => onOpenSeasonRecap(season.season)}
                  >
                    <ChampionshipCarBackdrop livery={season.champion.livery} />
                    <span className="palmares-season-badge">S{season.season}</span>
                    {season.champion.livery ? <TeamHelmet className="standings-livery-plate" livery={season.champion.livery} /> : <span />}
                    <span className="standings-team">
                      {season.champion.teamName}
                      <small>{tt("season_champion")}</small>
                    </span>
                    <small className="palmares-gp-count">
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
                          const position = historyPosition(grandPrix, playerTeamId);
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
                              <small>{position ? <PositionBadge position={position} /> : statusLabel(grandPrix.status, tt)}</small>
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
      {profileTeam ? <TeamProfileModal state={state} team={profileTeam} playerTeamId={playerTeamId} seasonWins={seasonWins.get(profileTeam.id) ?? 0} onClose={() => setProfileTeamId(undefined)} /> : null}
    </div>
  );
}

function TeamProfileModal({
  state,
  team,
  playerTeamId,
  seasonWins,
  onClose
}: {
  state: LeagueState;
  team: LeagueState["teams"][number];
  playerTeamId: string | undefined;
  seasonWins: number;
  onClose: () => void;
}) {
  const tt = useT();
  const stats = teamSeasonStats(state, team.id);
  const rival = standingsRival(state, team.id);
  const styleKey = teamStyleKey(state, team.id);
  return (
    <Modal label={tt("team_profile_title", { team: team.name })} testId="dialog-team-profile" className="panel modal team-profile-modal" closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <div className="team-profile-hero">
        <ChampionshipCarBackdrop livery={team.livery} />
        <TeamHelmet className="standings-livery-plate team-profile-livery" livery={team.livery} />
        <div>
          <span className="section-kicker">{team.id === playerTeamId ? tt("team_you") : team.kind === "bot" ? tt("team_bot") : tt("team_player")}</span>
          <h3>{team.name}</h3>
        </div>
      </div>
      <div className="team-profile-stats">
        <ProfileStat label={tt("team_profile_rank")} value={`P${stats.rank}`} />
        <ProfileStat label={tt("payoff_points")} value={<RewardValue type="points" value={team.points} />} />
        <ProfileStat label={tt("payoff_credits")} value={<RewardValue type="credits" value={team.credits} />} />
        <ProfileStat label={tt("team_profile_gps")} value={stats.gpCount} />
        <ProfileStat label={tt("team_profile_podiums")} value={stats.podiums} />
        <ProfileStat label={tt("team_profile_wins")} value={seasonWins} />
      </div>
      <div className="team-profile-read">
        <section>
          <strong>{tt("team_profile_current_rival")}</strong>
          <p>{rival ? tt("team_profile_rival_body", { rival: rival.teamName, gap: rival.pointsGap }) : tt("team_profile_no_rival")}</p>
        </section>
        <section>
          <strong>{tt("team_profile_style")}</strong>
          <p>{tt(styleKey)}</p>
        </section>
        <section>
          <strong>{tt("team_profile_recent_form")}</strong>
          <p>{stats.form.length ? stats.form.map((position) => `P${position}`).join(" · ") : tt("team_profile_no_form")}</p>
        </section>
      </div>
    </Modal>
  );
}

function ProfileStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <section>
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

// The API returns teams already ordered by points, but the local solo engine keeps them in
// creation order. Ranking here instead of trusting the array keeps both sources correct.
/** One quiet line under the circuit name; renders nothing until the team has actually raced there. */
function CircuitStatsLine({ stats }: { stats?: CircuitTeamStats }) {
  if (!stats || (!stats.races && stats.bestTime === null)) return null;
  return (
    <small className="circuit-stats-line">
      {stats.wins ? (
        <span className="circuit-stats-wins">
          <BoardIcon className="circuit-stats-icon" name="honors" />
          {stats.wins}
        </span>
      ) : null}
      {stats.bestTime !== null ? (
        <span>
          <BoardIcon className="circuit-stats-icon" name="chrono" />
          {stats.bestTime.toFixed(2)}s
        </span>
      ) : null}
    </small>
  );
}

/** The same numbers as the calendar line, spelled out, on the preview map. */
function CircuitStatsPanel({ stats }: { stats?: CircuitTeamStats }) {
  const tt = useT();
  const raced = Boolean(stats && (stats.races || stats.bestTime !== null));
  return (
    <dl className="circuit-detail-stats">
      {raced ? (
        <>
          <div>
            <dt>{tt("circuit_stats_best_time")}</dt>
            <dd>{stats!.bestTime !== null ? `${stats!.bestTime.toFixed(2)}s` : "—"}</dd>
          </div>
          <div>
            <dt>{tt("circuit_stats_wins_label")}</dt>
            <dd>{stats!.wins}</dd>
          </div>
          <div>
            <dt>{tt("circuit_stats_races")}</dt>
            <dd>{stats!.races}</dd>
          </div>
          <div>
            <dt>{tt("circuit_stats_best_finish")}</dt>
            <dd>{stats!.bestFinish !== null ? `P${stats!.bestFinish}` : "—"}</dd>
          </div>
        </>
      ) : (
        <div className="circuit-detail-stats-empty">
          <dt>{tt("circuit_stats_none")}</dt>
          <dd />
        </div>
      )}
    </dl>
  );
}

function rankTeams(state: LeagueState) {
  // Tie-break matches seasonStandings in the shared domain: points, then the incoming order,
  // then the name — so equal-points teams keep whatever order the source already implied.
  const incoming = new Map(state.teams.map((team, index) => [team.id, index]));
  return [...state.teams].sort(
    (left, right) =>
      right.points - left.points ||
      (incoming.get(left.id) ?? 0) - (incoming.get(right.id) ?? 0) ||
      left.name.localeCompare(right.name)
  );
}

function teamSeasonStats(state: LeagueState, teamId: string) {
  const rank = Math.max(1, rankTeams(state).findIndex((team) => team.id === teamId) + 1);
  const results = state.grandPrixHistory
    .filter((grandPrix) => grandPrix.season === state.currentGrandPrix.season)
    .flatMap((grandPrix) => grandPrix.result?.classification.find((entry) => entry.teamId === teamId) ?? []);
  return {
    rank,
    gpCount: results.length,
    podiums: results.filter((entry) => entry.position <= 3).length,
    form: results.slice(-5).map((entry) => entry.position)
  };
}

function teamStyleKey(state: LeagueState, teamId: string): TranslationKey {
  const decision = [...state.decisions].reverse().find((entry) => entry.teamId === teamId);
  if (decision?.approach === "aggressive" || decision?.preparation === "speed") return "team_profile_style_attack";
  if (decision?.approach === "prudent" || decision?.preparation === "reliability" || decision?.pitStrategy === "heavy_pack") return "team_profile_style_control";
  if (decision?.preparation === "weather") return "team_profile_style_weather";
  return "team_profile_style_balanced";
}

function compactHistoryLabel(label: string) {
  return label.replace("Grand Prix ", "GP ").replace(" des GP", "");
}

function ChampionshipCarBackdrop({ livery }: { livery?: TeamLivery }) {
  const asset = carAssetForId(livery?.carAssetId);
  const style = {
    "--championship-car-mask": `url("${asset.side}")`,
    "--championship-car-secondary": livery?.secondary ?? "#16c784",
    "--championship-car-stroke": livery?.primary ?? "#38bdf8"
  } as CSSProperties & Record<string, string>;
  return (
    <span className="championship-car-backdrop" style={style} aria-hidden="true">
      <AssetImage className="championship-car-backdrop-image" src={asset.side} alt="" />
      <span className="championship-car-backdrop-gradient" />
    </span>
  );
}

function circuitPreviewCar(circuit: CityCircuit, state: LeagueState, playerTeamId: string | undefined): MapCar {
  const team = state.teams.find((candidate) => candidate.id === playerTeamId) ?? state.teams[0];
  const seed = hashText(`${state.league.id}:${state.currentGrandPrix.season}-${state.currentGrandPrix.round}:${circuit.city}:${circuit.layoutKey}`);
  const traitPace = (circuit.traits.grip + circuit.traits.overtaking + circuit.traits.energy) / 300;
  const jitter = seed / 0xffffffff;
  return {
    id: `circuit-preview-${circuit.city}-${circuit.layoutKey}`,
    // No label: on a race map this is a position, and on a preview lap it was a stray "C" following
    // the car around an otherwise empty circuit.
    label: "",
    player: Boolean(team?.id && team.id === playerTeamId),
    delay: -jitter * 8,
    duration: 13.5 + (1 - traitPace) * 5 + jitter * 2.5,
    livery: team?.livery,
    repeatCount: "indefinite"
  };
}

function useCircuitPreviewClock(circuit: CityCircuit | undefined, car: MapCar | undefined) {
  const carProgressRef = useRef<Record<string, number>>({});
  const timeRef = useRef(0);

  useEffect(() => {
    if (!circuit || !car) {
      carProgressRef.current = {};
      timeRef.current = 0;
      return;
    }
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const clock = (now - startedAt) / 1000;
      const elapsed = Math.max(0, clock - car.delay);
      const lapProgress = (elapsed % Math.max(0.001, car.duration)) / Math.max(0.001, car.duration);
      timeRef.current = clock;
      carProgressRef.current = { [car.id]: applyTrackSpeedProfile(lapProgress, circuit.speedProfile) };
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [car, circuit]);

  return { carProgressRef, timeRef };
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function MiniCircuit({ circuit }: { circuit: CityCircuit }) {
  const points = miniRoutePoints(circuit.route);
  const startLine = analyzeCircuitRoute(points, circuit).startLine;
  return (
    <svg className="mini-circuit-map" viewBox="0 0 100 64" aria-hidden="true" focusable="false">
      <path d={miniRoutePath(points)} />
      <line className="mini-circuit-start-line" x1={startLine.x1} y1={startLine.y1} x2={startLine.x2} y2={startLine.y2} />
    </svg>
  );
}

function miniRoutePoints(route: CityCircuit["route"]) {
  const lngs = route.map((point) => point.lng);
  const lats = route.map((point) => point.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const width = maxLng - minLng || 1;
  const height = maxLat - minLat || 1;
  const scale = Math.min(84 / width, 48 / height);
  const offsetX = 50 - ((minLng + maxLng) / 2) * scale;
  const offsetY = 32 + ((minLat + maxLat) / 2) * scale;
  return route.map((point) => ({
    x: point.lng * scale + offsetX,
    y: offsetY - point.lat * scale
  }));
}

function miniRoutePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

function historyPosition(grandPrix: LeagueState["grandPrixHistory"][number], playerTeamId: string | undefined) {
  return playerTeamId ? grandPrix.result?.classification.find((entry) => entry.teamId === playerTeamId)?.position : undefined;
}

function visiblePageCircuits(filteredCircuits: CityCircuit[], pageIndex: number, currentCircuit: CityCircuit | undefined) {
  const page = filteredCircuits.slice(pageIndex * CIRCUIT_PAGE_SIZE, pageIndex * CIRCUIT_PAGE_SIZE + CIRCUIT_PAGE_SIZE);
  if (!currentCircuit || page.some((circuit) => circuit.layoutKey === currentCircuit.layoutKey)) return page;
  // The circuit being raced keeps its place on the first page whatever the filter says — it used to
  // be pinned only when the filter already included it, so the starter pack default hid the one
  // entry nobody goes looking for and everybody needs.
  return pageIndex === 0 ? [...page.slice(0, CIRCUIT_PAGE_SIZE - 1), currentCircuit] : page;
}

function groupHistoryBySeason(history: LeagueState["grandPrixHistory"]) {
  const groups = new Map<number, LeagueState["grandPrixHistory"]>();
  for (const grandPrix of history) {
    groups.set(grandPrix.season, [...(groups.get(grandPrix.season) ?? []), grandPrix]);
  }
  return [...groups.entries()].sort((left, right) => right[0] - left[0]);
}

function PagerChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={direction === "left" ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} />
    </svg>
  );
}
