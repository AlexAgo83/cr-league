import type { BotArchetype, Weather } from "@cr-league/shared";

/**
 * A duel is eight laps of one decision. The three calls beat each other in a ring, so the question is
 * never "which is best" but "which is he about to make"; engagement is what stops the ring from being
 * pure chance, since attacking spends a resource only managing gives back.
 *
 * It does not use `simulateRace`: that engine resolves a whole race from one decision, and this game
 * is one decision per lap. It is its own small ruleset, and stays pure so it can be tested.
 */
export type DuelCall = "attack" | "manage" | "cover";
export const DUEL_CALLS: DuelCall[] = ["attack", "manage", "cover"];

export const DUEL_LAPS = 8;
export const DUEL_MAX_ENGAGEMENT = 6;
const START_ENGAGEMENT = 4;
const MANAGE_GAIN = 2;
const COVER_GAIN = 1;

export type DuelRound = {
  lap: number;
  playerCall: DuelCall;
  rivalCall: DuelCall;
  /** Seconds the player took out of the rival this lap; negative means the rival took time back. */
  swing: number;
  /** Set when a call was made on an empty tank, which is how attacking punishes itself. */
  overreach: "player" | "rival" | "both" | null;
};

export type Duel = {
  seed: string;
  rival: BotArchetype;
  weather: Weather;
  lap: number;
  laps: number;
  /** Positive means the player leads. */
  gap: number;
  playerEngagement: number;
  rivalEngagement: number;
  rounds: DuelRound[];
};

export type DuelOutcome = "player" | "rival";

export function createDuel(seed: string, rival: BotArchetype, weather: Weather = "dry", laps = DUEL_LAPS): Duel {
  return {
    seed,
    rival,
    weather,
    lap: 1,
    laps,
    gap: 0,
    playerEngagement: START_ENGAGEMENT,
    rivalEngagement: START_ENGAGEMENT,
    rounds: []
  };
}

export function duelOver(duel: Duel) {
  return duel.rounds.length >= duel.laps;
}

/** A dead heat goes to the rival: he is the one to beat, so the player has to actually beat him. */
export function duelOutcome(duel: Duel): DuelOutcome {
  return duel.gap > 0 ? "player" : "rival";
}

export function attackCost(weather: Weather) {
  return weather === "heavy_rain" ? 3 : 2;
}

/**
 * What one call takes out of the other, from the player's side. The ring: attack beats manage, manage
 * beats cover, cover beats attack. Rain flattens the reward for attacking and pays the driver who
 * closes the door instead.
 */
export function duelSwing(playerCall: DuelCall, rivalCall: DuelCall, weather: Weather) {
  if (playerCall === rivalCall) return 0;
  const wet = weather === "heavy_rain" ? 2 : weather === "light_rain" ? 1 : 0;
  const attackReward = 0.8 - wet * 0.15;
  const coverReward = 0.6 + wet * 0.15;
  const manageReward = 0.4;
  if (playerCall === "attack") return rivalCall === "manage" ? attackReward : -coverReward;
  if (playerCall === "manage") return rivalCall === "cover" ? manageReward : -attackReward;
  return rivalCall === "attack" ? coverReward : -manageReward;
}

/** Attacking with nothing left is the punishment for spending it all: the lap costs instead of paying. */
const OVERREACH_PENALTY = 0.5;

export function playDuelRound(duel: Duel, playerCall: DuelCall): Duel {
  if (duelOver(duel)) return duel;
  const rivalCall = rivalDuelCall(duel);
  const cost = attackCost(duel.weather);
  const playerDry = playerCall === "attack" && duel.playerEngagement < cost;
  const rivalDry = rivalCall === "attack" && duel.rivalEngagement < cost;
  const swing = duelSwing(playerCall, rivalCall, duel.weather) - (playerDry ? OVERREACH_PENALTY : 0) + (rivalDry ? OVERREACH_PENALTY : 0);
  const round: DuelRound = {
    lap: duel.lap,
    playerCall,
    rivalCall,
    swing: round2(swing),
    overreach: playerDry && rivalDry ? "both" : playerDry ? "player" : rivalDry ? "rival" : null
  };
  return {
    ...duel,
    lap: duel.lap + 1,
    gap: round2(duel.gap + round.swing),
    playerEngagement: nextEngagement(duel.playerEngagement, playerCall, cost),
    rivalEngagement: nextEngagement(duel.rivalEngagement, rivalCall, cost),
    rounds: [...duel.rounds, round]
  };
}

function nextEngagement(current: number, call: DuelCall, cost: number) {
  const next = call === "attack" ? current - cost : current + (call === "manage" ? MANAGE_GAIN : COVER_GAIN);
  return Math.max(0, Math.min(DUEL_MAX_ENGAGEMENT, next));
}

/**
 * The rival plays his archetype, which is what makes him readable across a few duels: the sprinter
 * throws everything in early, the mechanic hoards. A seeded slice of laps breaks the pattern, so
 * reading him is a habit rather than a solved sequence.
 */
export function rivalDuelCall(duel: Duel): DuelCall {
  const roll = hash(`${duel.seed}:${duel.lap}`) % 100;
  const cost = attackCost(duel.weather);
  const canAttack = duel.rivalEngagement >= cost;
  const leads = duel.gap < 0;
  const early = duel.lap <= Math.ceil(duel.laps / 3);
  if (roll < 18) return DUEL_CALLS[roll % DUEL_CALLS.length]!;

  switch (duel.rival) {
    case "sprinter":
      return canAttack && early ? "attack" : leads ? "cover" : "manage";
    case "gambler":
      return canAttack ? "attack" : "manage";
    case "prudent":
      return leads ? "cover" : canAttack && duel.rivalEngagement >= DUEL_MAX_ENGAGEMENT - 1 ? "attack" : "manage";
    case "mechanic":
      return duel.rivalEngagement >= DUEL_MAX_ENGAGEMENT ? "attack" : leads ? "cover" : "manage";
    case "rain_specialist":
      return duel.weather !== "dry" && canAttack ? "attack" : leads ? "cover" : "manage";
    default:
      // The opportunist waits for an empty tank opposite, then jumps.
      return duel.playerEngagement < cost && canAttack ? "attack" : leads ? "cover" : "manage";
  }
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function hash(value: string) {
  let hashed = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hashed ^= value.charCodeAt(index);
    hashed = Math.imul(hashed, 16777619);
  }
  return Math.abs(hashed);
}
