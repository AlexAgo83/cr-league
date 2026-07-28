import { circuitIdentityForRound, circuitSeasonSeed } from "./circuits.js";
import type { LeagueState } from "./league.js";

/**
 * Per-circuit record for one team, scoped to its league.
 *
 * Wins, races and the best finish are derived from `grandPrixHistory` on the fly, the same way
 * `seasonStandings` recomputes the table rather than trusting a stored column.
 *
 * `bestTime` cannot be: qualifying runs only exist on `currentGrandPrix`, and each one embeds a
 * whole RaceResult (replay trace included), so keeping them in history would balloon the payload.
 * It is therefore the one value persisted, on `team.circuitRecords`, written when a run beats the
 * stored best. Everything else stays derived.
 */
export type CircuitTeamStats = {
  layoutKey: string;
  races: number;
  wins: number;
  bestFinish: number | null;
  bestTime: number | null;
};

export type CircuitRecords = Record<string, number>;

export function normalizeCircuitRecords(value: unknown): CircuitRecords {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const records: CircuitRecords = {};
  for (const [layoutKey, time] of Object.entries(value as Record<string, unknown>)) {
    if (typeof time === "number" && Number.isFinite(time) && time > 0) records[layoutKey] = time;
  }
  return records;
}

/** The layout raced at a given season/round of this league. */
export function layoutKeyForRound(leagueId: string, season: number, round: number) {
  return circuitIdentityForRound(round, circuitSeasonSeed(leagueId, season)).layoutKey;
}

/** Best time first, then the beaten record, so callers can show "improved by". */
export function betterCircuitTime(records: CircuitRecords, layoutKey: string, time: number) {
  const previous = records[layoutKey];
  return previous === undefined || time < previous;
}

export function withCircuitRecord(records: CircuitRecords, layoutKey: string, time: number): CircuitRecords {
  if (!betterCircuitTime(records, layoutKey, time)) return records;
  return { ...records, [layoutKey]: time };
}

/** Stats for every layout this team has actually raced, keyed by layoutKey. */
export function circuitStatsForTeam(state: LeagueState, teamId: string | undefined): Map<string, CircuitTeamStats> {
  const stats = new Map<string, CircuitTeamStats>();
  if (!teamId) return stats;
  const records = normalizeCircuitRecords(state.teams.find((team) => team.id === teamId)?.circuitRecords);

  for (const grandPrix of state.grandPrixHistory) {
    if (!grandPrix.result) continue;
    const entry = grandPrix.result.classification.find((candidate) => candidate.teamId === teamId);
    if (!entry) continue;
    const layoutKey = layoutKeyForRound(state.league.id, grandPrix.season, grandPrix.round);
    const current = stats.get(layoutKey) ?? { layoutKey, races: 0, wins: 0, bestFinish: null, bestTime: null };
    stats.set(layoutKey, {
      layoutKey,
      races: current.races + 1,
      wins: current.wins + (entry.position === 1 ? 1 : 0),
      bestFinish: current.bestFinish === null ? entry.position : Math.min(current.bestFinish, entry.position),
      bestTime: null
    });
  }

  // A record can exist for a layout with no finished race yet: the player set a time, then the
  // Grand Prix was restarted or is still open.
  for (const [layoutKey, time] of Object.entries(records)) {
    const current = stats.get(layoutKey) ?? { layoutKey, races: 0, wins: 0, bestFinish: null, bestTime: null };
    stats.set(layoutKey, { ...current, bestTime: time });
  }

  return stats;
}

export function circuitStatsFor(state: LeagueState, teamId: string | undefined, layoutKey: string): CircuitTeamStats | null {
  return circuitStatsForTeam(state, teamId).get(layoutKey) ?? null;
}
