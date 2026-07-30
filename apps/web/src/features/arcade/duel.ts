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
  return weather === "heavy_rain" ? 4 : 2;
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
  const manageReward = 0.65;
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

/** Which call answers the one given. */
export function counterCall(call: DuelCall): DuelCall {
  return call === "attack" ? "cover" : call === "cover" ? "manage" : "attack";
}

/**
 * How hard each rival studies the driver next to him. Reading is a tint on the archetype, never a
 * replacement: an opponent who only ever played the counter would be unreadable, and reading him
 * back is the whole game.
 */
const CUNNING: Record<BotArchetype, number> = {
  opportunist: 0.7,
  prudent: 0.5,
  mechanic: 0.45,
  rain_specialist: 0.4,
  sprinter: 0.3,
  gambler: 0.15
};

/**
 * How erratic each one is. A driver who answers the same way every time is not a personality, he is
 * a lock: the gambler covering nothing at all lost every duel to an opponent who simply covered.
 */
const NOISE: Record<BotArchetype, number> = {
  gambler: 28,
  sprinter: 20,
  rain_specialist: 16,
  opportunist: 14,
  mechanic: 12,
  prudent: 10
};

/** The habit the player has fallen into lately, if he has one. */
export function playerHabit(rounds: DuelRound[], window = 4): DuelCall | null {
  const recent = rounds.slice(-window);
  if (recent.length < 2) return null;
  const counts = new Map<DuelCall, number>();
  for (const round of recent) counts.set(round.playerCall, (counts.get(round.playerCall) ?? 0) + 1);
  const [call, count] = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]!;
  return count / recent.length >= 0.5 && count >= 2 ? call : null;
}

/**
 * The rival plays his archetype, which is what makes him readable across a few duels: the sprinter
 * throws everything in early, the mechanic hoards. On top of that he plays the end of the race, and
 * he answers a habit when he sees one — how often depending on how much of a student he is. A seeded
 * slice of laps still breaks the pattern, so he is a driver rather than a solved sequence.
 */
export function rivalDuelCall(duel: Duel): DuelCall {
  const roll = hash(`${duel.seed}:${duel.lap}`) % 100;
  const cost = attackCost(duel.weather);
  const canAttack = duel.rivalEngagement >= cost;
  const leads = duel.gap < 0;
  const lapsLeft = duel.laps - duel.rounds.length;
  const noise = NOISE[duel.rival];
  if (roll < noise) return DUEL_CALLS[roll % DUEL_CALLS.length]!;

  // Last lap, and the flag will not save him: there is nothing left to conserve.
  if (lapsLeft <= 1 && !leads) return canAttack ? "attack" : "manage";
  // A lead worth protecting is protected, whoever he is.
  if (leads && lapsLeft <= 2 && Math.abs(duel.gap) > 0.4) return "cover";
  // Running out of laps while losing: even the patient ones have to come forward.
  if (!leads && lapsLeft <= 3 && Math.abs(duel.gap) > 0.5 && canAttack) return "attack";

  const habit = playerHabit(duel.rounds);
  if (habit && roll < noise + CUNNING[duel.rival] * 60) {
    const answer = counterCall(habit);
    // He still cannot attack on an empty tank, whatever he has read.
    if (answer !== "attack" || canAttack) return answer;
  }

  return archetypeCall(duel, canAttack, leads, roll);
}

function archetypeCall(duel: Duel, canAttack: boolean, leads: boolean, roll: number): DuelCall {
  const early = duel.lap <= Math.ceil(duel.laps / 3);
  // A driver with nothing left to spend does not simply manage every time: he would be free food for
  // anyone attacking on repeat. He rebuilds most laps and shuts the door on the others — and leans
  // harder on rebuilding in the wet, where attacks are rare and a door nobody is trying costs him.
  const hold: DuelCall = roll % 100 < (duel.weather === "dry" ? 55 : 78) ? "manage" : "cover";
  switch (duel.rival) {
    case "sprinter":
      return canAttack && early ? "attack" : leads ? "cover" : hold;
    case "gambler":
      return canAttack ? "attack" : hold;
    case "prudent":
      return leads ? "cover" : canAttack && duel.rivalEngagement >= DUEL_MAX_ENGAGEMENT - 1 ? "attack" : hold;
    case "mechanic":
      return duel.rivalEngagement >= DUEL_MAX_ENGAGEMENT ? "attack" : leads ? "cover" : hold;
    case "rain_specialist":
      return duel.weather !== "dry" && canAttack ? "attack" : leads ? "cover" : hold;
    default:
      // The opportunist waits for an empty tank opposite, then jumps.
      return duel.playerEngagement < attackCost(duel.weather) && canAttack ? "attack" : leads ? "cover" : hold;
  }
}

/**
 * Where the gap stands part-way through a lap. Both ends are the truth — it starts on the gap the
 * lap opened with and lands exactly on the one it closed with — and the middle is the story: a
 * driver who dives up the inside is right there before he runs out of road, a driver who shuts the
 * door lets the other one arrive before holding him off.
 */
export function duelGapDuring(round: DuelRound, gapBefore: number, progress: number) {
  const time = Math.max(0, Math.min(1, progress));
  const eased = time * time * (3 - 2 * time);
  return round2(gapBefore + round.swing * eased + duelDrama(round) * Math.sin(Math.PI * time));
}

/** How far the lap wanders before it lands, and towards whom. */
function duelDrama(round: DuelRound) {
  const { playerCall, rivalCall } = round;
  if (playerCall === rivalCall) return 0.12;
  // The lunge that does not come off: he is on the door handles at mid-lap, then loses the exit.
  if (playerCall === "attack" && rivalCall === "cover") return 0.5;
  if (playerCall === "cover" && rivalCall === "attack") return -0.5;
  // A move that works arrives early rather than dramatically.
  if (playerCall === "attack") return 0.2;
  if (rivalCall === "attack") return -0.2;
  return playerCall === "manage" ? 0.15 : -0.15;
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
