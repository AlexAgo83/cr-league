import { CARD_DEFINITIONS, type CardDefinition } from "../cards/definitions.js";
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
    cardId: botCard(state, team, fallback?.cardId),
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

/**
 * Which card to play, out of the ones the team holds. It used to be `cards[0]` — whichever landed
 * first in the inventory — so a bot sat on Rain Grip through a downpour because a sponsorship card
 * happened to be bought earlier.
 */
export function botCard(state: LeagueState, team: LeagueState["teams"][number], preferred?: CardId) {
  const held = team.cards.filter((cardId) => CARD_DEFINITIONS[cardId]);
  if (!held.length) return undefined;
  const risk = wetRisk(state.currentGrandPrix.forecast);
  const circuit = circuitIdentityForRound(state.currentGrandPrix.round, circuitSeasonSeed(state.league.id, state.currentGrandPrix.season));
  const ranked = [...state.teams].sort((left, right) => right.points - left.points);
  const chasing = ranked.findIndex((candidate) => candidate.id === team.id) >= Math.ceil(ranked.length / 2);

  const wanted: CardDefinition["family"][] = [];
  if (risk >= 70) wanted.push("weather");
  if (circuit.traits.overtaking >= 72 || state.currentGrandPrix.primaryTrait === "fast") wanted.push("attack");
  if (circuit.traits.energy <= 58 || state.currentGrandPrix.primaryTrait === "high_wear") wanted.push("reliability");
  if (chasing) wanted.push("comeback");
  // Nothing pressing about this weekend: bank the payout instead of burning an edge.
  if (!wanted.length) wanted.push("economy");

  for (const family of wanted) {
    const match = held.find((cardId) => CARD_DEFINITIONS[cardId].family === family);
    if (match) return match;
  }
  // A card kept for its own weekend is worth more than one played on the wrong one.
  return preferred && held.includes(preferred) ? preferred : held[0];
}

/**
 * Which card to buy next, out of what it can afford. Buying at random left bots holding a rain card
 * for a dry season and a comeback card while leading the championship — the shop is the only place a
 * bot builds a hand, so it is where its plan for the season starts.
 */
export function botCardPurchase(state: LeagueState, team: LeagueState["teams"][number], affordable: CardId[]): CardId | undefined {
  if (!affordable.length) return undefined;
  const seasonRisk = wetRisk(state.currentGrandPrix.forecast);
  const ranked = [...state.teams].sort((left, right) => right.points - left.points);
  const chasing = ranked.findIndex((candidate) => candidate.id === team.id) >= Math.ceil(ranked.length / 2);
  const held = new Set(team.cards);

  const wanted: CardDefinition["family"][] = [
    ...(seasonRisk >= 45 ? ["weather" as const] : []),
    ...(chasing ? ["comeback" as const, "attack" as const] : ["reliability" as const, "economy" as const]),
    "attack",
    "reliability"
  ];
  for (const family of wanted) {
    // A second copy of a card it already owns adds nothing to the hand it can play.
    const fresh = affordable.filter((cardId) => CARD_DEFINITIONS[cardId].family === family && !held.has(cardId));
    if (fresh.length) return fresh[0];
  }
  return affordable.find((cardId) => !held.has(cardId)) ?? affordable[0];
}

/**
 * What a bot sends out on a chrono attempt. Every attempt used to carry the same plan, so the second
 * and third told it nothing it did not already know: three rolls of the same dice. It now spends one
 * attempt trying something else, then goes back to whichever of the two was quicker — which is what
 * the attempts are for.
 */
export function botQualifyingDecision(
  state: LeagueState,
  team: LeagueState["teams"][number],
  attempt: number,
  runs: Array<{ teamId: string; time: number; decision: RaceDecision }>,
  fallback?: RaceDecision
): RaceDecision {
  const base = botDecision(state, team, fallback);
  const own = runs.filter((run) => run.teamId === team.id);
  if (attempt <= 1 || !own.length) return base;

  const best = own.reduce((quickest, run) => (run.time < quickest.time ? run : quickest), own[0]!);
  const tried = new Set(own.map((run) => `${run.decision.approach}/${run.decision.preparation}`));
  if (attempt === 2 || tried.size < 2) {
    // One variation, in the direction a chrono rewards: a lap is not a race, so it leans on pace.
    const variant: RaceDecision = {
      ...base,
      approach: base.approach === "aggressive" ? "balanced" : "aggressive",
      preparation: base.preparation === "weather" ? "weather" : "speed"
    };
    return tried.has(`${variant.approach}/${variant.preparation}`) ? base : variant;
  }
  // Both have been tried: go back out on the one that was quicker.
  return { ...base, approach: best.decision.approach, preparation: best.decision.preparation };
}

export function normalizePitStrategy(value: unknown): NonNullable<RaceDecision["pitStrategy"]> {
  return PIT_STRATEGIES.includes(value as NonNullable<RaceDecision["pitStrategy"]>) ? (value as NonNullable<RaceDecision["pitStrategy"]>) : "standard";
}
