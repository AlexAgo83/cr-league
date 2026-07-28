import type { LeagueState } from "./league.js";

export type SeasonStanding = {
  position: number;
  teamId: string;
  teamName: string;
  livery?: LeagueState["teams"][number]["livery"];
  points: number;
};

export type StandingsRival = {
  teamId: string;
  teamName: string;
  position: number;
  points: number;
  pointsGap: number;
};

export function seasonStandings(state: LeagueState, season: number): SeasonStanding[] {
  const teamRank = new Map(state.teams.map((team, index) => [team.id, index]));
  const teams = new Map(state.teams.map((team) => [team.id, team]));
  const points = new Map(state.teams.map((team) => [team.id, 0]));
  const names = new Map(state.teams.map((team) => [team.id, team.name]));

  for (const grandPrix of state.grandPrixHistory) {
    if (grandPrix.season !== season || !grandPrix.result) continue;
    for (const entry of grandPrix.result.classification) {
      points.set(entry.teamId, (points.get(entry.teamId) ?? 0) + entry.points);
      names.set(entry.teamId, entry.teamName);
    }
  }

  return [...points.entries()]
    .sort((left, right) => right[1] - left[1] || (teamRank.get(left[0]) ?? 999) - (teamRank.get(right[0]) ?? 999) || (names.get(left[0]) ?? left[0]).localeCompare(names.get(right[0]) ?? right[0]))
    .map(([teamId, score], index) => ({
      position: index + 1,
      teamId,
      teamName: names.get(teamId) ?? teamId,
      livery: teams.get(teamId)?.livery,
      points: score
    }));
}

/**
 * The *implied* rival: the team closest to you in the live standings, computed on the fly.
 * Not the same thing as `RaceDecision.rivalTeamId` (see `packages/shared/src/domain/race.ts`),
 * which is the rival a player explicitly picks for a Grand Prix. This one is never stored,
 * never chosen, and can change after every race.
 */
export function standingsRival(state: LeagueState, teamId: string | undefined): StandingsRival | null {
  if (!teamId || state.teams.every((team) => team.points === 0)) return null;
  const baseRank = new Map(state.teams.map((team, index) => [team.id, index]));
  const standings = [...state.teams]
    .sort((left, right) => right.points - left.points || (baseRank.get(left.id) ?? 999) - (baseRank.get(right.id) ?? 999) || left.id.localeCompare(right.id))
    .map((team, index) => ({ team, position: index + 1 }));
  const player = standings.find((entry) => entry.team.id === teamId);
  if (!player) return null;

  const rival = standings
    .filter((entry) => entry.team.id !== teamId)
    .sort(
      (left, right) =>
        Math.abs(left.position - player.position) - Math.abs(right.position - player.position) ||
        Math.abs(left.team.points - player.team.points) - Math.abs(right.team.points - player.team.points) ||
        left.team.id.localeCompare(right.team.id)
    )[0];
  if (!rival) return null;
  return {
    teamId: rival.team.id,
    teamName: rival.team.name,
    position: rival.position,
    points: rival.team.points,
    pointsGap: Math.abs(rival.team.points - player.team.points)
  };
}
