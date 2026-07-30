import { circuitIdentityForRound, circuitSeasonSeed } from "./circuits.js";
import type { LeagueState } from "./league.js";
import { PIT_STRATEGIES, type CardId, type RaceDecision } from "./race.js";

/**
 * What a bot sends in when nobody sends one for it. One brain: the campaign resolves races in the
 * browser and a private league resolves them on the server, and a bot that reasoned differently
 * depending on where the race ran would be two games.
 */
export function botDecision(state: LeagueState, team: LeagueState["teams"][number], fallback?: RaceDecision): RaceDecision {
  const submitted = state.decisions.find((decision) => decision.teamId === team.id);
  if (submitted) {
    return {
      approach: submitted.approach,
      preparation: submitted.preparation,
      pitStrategy: normalizePitStrategy(submitted.pitStrategy),
      cardId: submitted.cardId ?? undefined,
      rivalTeamId: submitted.rivalTeamId ?? undefined
    };
  }
  return {
    approach: botApproach(state, team, fallback),
    preparation: botPreparation(state, fallback),
    pitStrategy: botPitStrategy(state, team, fallback),
    cardId: botCard(team, fallback?.cardId),
    rivalTeamId: fallback?.rivalTeamId
  };
}

/**
 * The approach is the decision that actually moves a race: measured across sixty seeds it changes
 * the finishing order every time and can swing a car four places, where tyres and pit strategy move
 * one. It used to be the one thing a bot never reconsidered — the same word every race, all season.
 *
 * The archetype stays the baseline, so a prudent driver is still recognisably prudent; the
 * championship, the circuit and the sky push him off it.
 */
export function botApproach(
  state: LeagueState,
  team: LeagueState["teams"][number],
  fallback?: RaceDecision
): RaceDecision["approach"] {
  const base = fallback?.approach ?? "balanced";
  const risk = wetRisk(state.currentGrandPrix.forecast);
  const circuit = circuitIdentityForRound(state.currentGrandPrix.round, circuitSeasonSeed(state.league.id, state.currentGrandPrix.season));
  const ranked = [...state.teams].sort((left, right) => right.points - left.points);
  const place = ranked.findIndex((candidate) => candidate.id === team.id) + 1;
  const leaderPoints = ranked[0]?.points ?? 0;
  const behind = leaderPoints - (team.points ?? 0);
  const roundsLeft = Math.max(0, state.league.maxGrandPrixPerSeason - state.currentGrandPrix.round);
  const lateSeason = roundsLeft <= Math.max(1, Math.round(state.league.maxGrandPrixPerSeason / 3));

  // Heavy rain punishes bravery, whatever the standings say.
  if (risk >= 100) return base === "aggressive" ? "balanced" : base;
  // Running out of races while losing: there is nothing to protect any more.
  if (lateSeason && behind > 25) return "aggressive";
  // Leading the championship late is worth more than one more win.
  if (lateSeason && place === 1 && leaderPoints > 0) return base === "aggressive" ? "balanced" : "prudent";
  // A circuit where nobody can pass rewards keeping the car in one piece.
  if (circuit.traits.overtaking <= 45) return base === "aggressive" ? "balanced" : base;
  // One where everybody can rewards trying.
  if (circuit.traits.overtaking >= 75 && risk < 45) return base === "prudent" ? "balanced" : "aggressive";
  return base;
}

/** Rain in the forecast counts double: heavy rain is what actually decides a race. */
export function wetRisk(forecast: LeagueState["currentGrandPrix"]["forecast"]) {
  return forecast.light_rain + forecast.heavy_rain * 2;
}

/**
 * Tyres read the forecast. They used to come from a fixed template, so a bot went out on speed
 * rubber under a downpour and handed the race to anyone who had looked at the sky.
 */
export function botPreparation(state: LeagueState, fallback?: RaceDecision): RaceDecision["preparation"] {
  const risk = wetRisk(state.currentGrandPrix.forecast);
  if (risk >= 70) return "weather";
  // A gamble that only pays if it rains: the specialists keep taking it, the others do not.
  if (risk >= 45) return fallback?.preparation === "weather" ? "weather" : "reliability";
  if (state.currentGrandPrix.secondaryTrait === "weather_sensitive" && risk >= 30) return "reliability";
  return fallback?.preparation ?? "speed";
}

export function botPitStrategy(
  state: LeagueState,
  team: LeagueState["teams"][number],
  fallback?: RaceDecision
): NonNullable<RaceDecision["pitStrategy"]> {
  const circuit = circuitIdentityForRound(state.currentGrandPrix.round, circuitSeasonSeed(state.league.id, state.currentGrandPrix.season));
  const traits = circuit.traits;
  const risk = wetRisk(state.currentGrandPrix.forecast);
  const archetype = fallback?.preparation === "weather" ? "rain" : fallback?.approach;
  const wantsAttack = traits.overtaking >= 72 || state.currentGrandPrix.primaryTrait === "fast" || state.currentGrandPrix.primaryTrait === "urban";
  const wantsEndurance = traits.energy <= 58 || circuit.trackLengthMeters >= 5600 || state.currentGrandPrix.primaryTrait === "high_wear";

  if (risk >= 100) return "standard";
  if (archetype === "aggressive" && wantsAttack) return "mini_pack";
  if (archetype === "prudent" && wantsEndurance) return "heavy_pack";
  if (archetype === "rain" && risk >= 70) return "standard";
  if (wantsEndurance && team.id.length % 2 === 0) return "heavy_pack";
  if (wantsAttack) return "mini_pack";
  return normalizePitStrategy(fallback?.pitStrategy);
}

export function botCard(team: LeagueState["teams"][number], preferred?: CardId) {
  return preferred && team.cards.includes(preferred) ? preferred : team.cards[0];
}

export function normalizePitStrategy(value: unknown): NonNullable<RaceDecision["pitStrategy"]> {
  return PIT_STRATEGIES.includes(value as NonNullable<RaceDecision["pitStrategy"]>) ? (value as NonNullable<RaceDecision["pitStrategy"]>) : "standard";
}
