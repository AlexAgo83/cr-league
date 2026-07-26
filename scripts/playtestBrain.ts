import {
  CARD_DEFINITIONS,
  CARD_PRICES,
  RACE_APPROACHES,
  type CardId,
  type CityCircuitIdentity,
  type PitStrategy,
  type RaceApproach,
  type RaceDecision,
  type RaceResult,
  type TechnicalPreparation
} from "../packages/shared/src/index.js";

export type PlaytestMode = "all_in" | "hoarder" | "rain_gambler" | "no_card" | "rival_tunnel" | "mini_spam" | "endurance" | "random";

export type PlaytestProfile = {
  name: string;
  approach: RaceApproach;
  preparation: TechnicalPreparation;
  pitStrategy: PitStrategy;
  buy: CardId[];
  mode?: PlaytestMode;
  rival?: "leader" | "nearest" | "none";
};

export type PlaytestAgentState = {
  id: string;
  starts: number;
  points: number;
  cards: CardId[];
  profile: PlaytestProfile;
};

export type PlaytestTeamState = {
  id: string;
  name: string;
  points: number;
  cards: CardId[];
  credits: number;
};

export const playtestCardIds = Object.keys(CARD_DEFINITIONS) as CardId[];

export const playtestProfiles: PlaytestProfile[] = [
  { name: "sprinter", approach: "aggressive", preparation: "speed", pitStrategy: "standard", buy: ["launch_boost", "soft_tires", "adjustable_wing"], rival: "leader" },
  { name: "rain-reader", approach: "balanced", preparation: "weather", pitStrategy: "standard", buy: ["rain_grip", "rain_mapping", "fleet_maintenance"], rival: "nearest" },
  { name: "banker", approach: "prudent", preparation: "reliability", pitStrategy: "heavy_pack", buy: ["fleet_sponsorship", "economy_mode", "hard_tires"], rival: "none" },
  { name: "closer", approach: "balanced", preparation: "speed", pitStrategy: "standard", buy: ["final_surge", "calculated_attack", "pit_relay"], rival: "leader" },
  { name: "defender", approach: "prudent", preparation: "reliability", pitStrategy: "heavy_pack", buy: ["defensive_order", "hard_tires", "pit_relay"], rival: "nearest" },
  { name: "rival-hunter", approach: "aggressive", preparation: "speed", pitStrategy: "standard", buy: ["urban_draft", "calculated_attack", "qualifying_focus"], rival: "leader" },
  { name: "all-in-attack", approach: "aggressive", preparation: "speed", pitStrategy: "mini_pack", buy: ["launch_boost", "soft_tires", "calculated_attack"], mode: "all_in" },
  { name: "economy-hoarder", approach: "prudent", preparation: "reliability", pitStrategy: "heavy_pack", buy: ["economy_mode", "fleet_sponsorship"], mode: "hoarder" },
  { name: "rain-gambler", approach: "aggressive", preparation: "weather", pitStrategy: "standard", buy: ["rain_grip", "rain_mapping"], mode: "rain_gambler" },
  { name: "no-card-saver", approach: "balanced", preparation: "reliability", pitStrategy: "standard", buy: [], mode: "no_card" },
  { name: "tunnel-rival", approach: "aggressive", preparation: "speed", pitStrategy: "mini_pack", buy: ["urban_draft", "calculated_attack"], mode: "rival_tunnel" },
  { name: "mini-spammer", approach: "aggressive", preparation: "speed", pitStrategy: "mini_pack", buy: ["soft_tires", "adjustable_wing", "pit_relay"], mode: "mini_spam" },
  { name: "endurance-conservative", approach: "prudent", preparation: "reliability", pitStrategy: "heavy_pack", buy: ["hard_tires", "fleet_maintenance", "defensive_order"], mode: "endurance" },
  { name: "random-baseline", approach: "balanced", preparation: "speed", pitStrategy: "standard", buy: playtestCardIds, mode: "random" }
];

export const multiplayerPlaytestProfiles: PlaytestProfile[] = playtestProfiles.slice(0, 6).map((profile) =>
  profile.name === "rival-hunter" ? { ...profile, pitStrategy: "mini_pack" } : profile
);

export function playtestDecisionForAgent(agent: PlaytestAgentState, circuit: CityCircuitIdentity, ranked: PlaytestAgentState[], cardPlayCount: (cardId: CardId) => number): RaceDecision {
  const cardId = playableCard(agent, circuit, cardPlayCount);
  const rival = agent.profile.mode === "rival_tunnel"
    ? ranked.find((candidate) => candidate.id !== agent.id)?.id
    : ranked.find((candidate) => candidate.id !== agent.id && candidate.points >= agent.points)?.id;
  return {
    approach: approachFor(agent, circuit),
    preparation: preparationFor(agent, circuit),
    pitStrategy: pitStrategyFor(agent, circuit),
    cardId,
    rivalTeamId: cardId === "urban_draft" || cardId === "calculated_attack" ? rival : undefined
  };
}

export function nextPlaytestCardPurchase(agent: { profile: PlaytestProfile; nextBuyIndex: number; credits: number }, cardBuyCount: (cardId: CardId) => number) {
  if (agent.profile.mode === "no_card") return undefined;
  for (let offset = 0; offset < agent.profile.buy.length; offset += 1) {
    const index = (agent.nextBuyIndex + offset) % agent.profile.buy.length;
    const candidate = agent.profile.buy[index]!;
    if (CARD_PRICES[candidate] > agent.credits) continue;
    if (agent.profile.mode === "hoarder" && agent.credits - CARD_PRICES[candidate] < 300) continue;
    return { cardId: candidate, nextBuyIndex: (index + 1) % agent.profile.buy.length };
  }
  const cardId = playtestCardIds
    .filter((candidate) => CARD_PRICES[candidate] <= agent.credits)
    .sort((left, right) => cardBuyCount(left) - cardBuyCount(right))[0];
  return cardId ? { cardId, nextBuyIndex: agent.nextBuyIndex } : undefined;
}

export function multiplayerDecisionFor(input: { profile: PlaytestProfile; index: number; round: number; teamId: string; teams: PlaytestTeamState[] }): RaceDecision {
  return {
    approach: input.profile.approach,
    preparation: input.profile.preparation,
    pitStrategy: input.profile.pitStrategy,
    cardId: multiplayerCardFor(input),
    rivalTeamId: multiplayerRivalFor(input)
  };
}

export function multiplayerNextBuyFor(input: { profile: PlaytestProfile; index: number; round: number; ownedCards: CardId[]; credits: number }) {
  const affordable = (cardId: CardId) => CARD_PRICES[cardId] <= input.credits;
  const affordableCards = playtestCardIds.filter(affordable);
  return (
    input.profile.buy.find((cardId) => !input.ownedCards.includes(cardId) && affordable(cardId)) ??
    input.profile.buy.find(affordable) ??
    affordableCards[(input.index + input.round) % affordableCards.length]
  );
}

export function funScore(position: number, result: RaceResult, teamId: string) {
  const eventBonus = result.events.filter((event) => event.teamId === teamId && event.positionDelta < 0).length;
  return Math.max(1, Math.min(10, 4 + (position === 1 ? 4 : position <= 3 ? 2 : 0) + eventBonus));
}

export function frustrationScore(position: number, result: RaceResult, teamId: string) {
  const badEvents = new Set(["mechanical_scare", "wrong_weather_bet", "minor_error", "penalty_risk", "battery_critical"]);
  const eventPenalty = result.events.filter((event) => event.teamId === teamId && badEvents.has(event.type)).length;
  return Math.max(1, Math.min(10, 2 + (position > 6 ? 3 : position > 3 ? 1 : 0) + eventPenalty));
}

function approachFor(agent: PlaytestAgentState, circuit: CityCircuitIdentity): RaceApproach {
  if (agent.profile.mode !== "random") return agent.profile.approach;
  return RACE_APPROACHES[(agent.starts + circuit.city.length) % RACE_APPROACHES.length]!;
}

function preparationFor(agent: PlaytestAgentState, circuit: CityCircuitIdentity): TechnicalPreparation {
  if (agent.profile.mode === "rain_gambler") return "weather";
  if (agent.profile.mode !== "random") return circuit.likelyWeather === "dry" ? agent.profile.preparation : "weather";
  return ["speed", "reliability", "weather"][(agent.starts + circuit.country.length) % 3] as TechnicalPreparation;
}

function pitStrategyFor(agent: PlaytestAgentState, circuit: CityCircuitIdentity): PitStrategy {
  const wantsAttack = circuit.traits.overtaking >= 72;
  const wantsEndurance = circuit.traits.energy <= 58 || circuit.trackLengthMeters >= 5600;
  if (agent.profile.mode === "mini_spam") return "mini_pack";
  if (agent.profile.mode === "all_in" && circuit.likelyWeather !== "heavy_rain") return "mini_pack";
  if (agent.profile.mode === "endurance" || agent.profile.mode === "hoarder") return "heavy_pack";
  if (agent.profile.mode === "random") return ["heavy_pack", "standard", "mini_pack"][(agent.starts + circuit.layoutKey.length) % 3] as PitStrategy;
  if (circuit.likelyWeather === "heavy_rain") return "standard";
  if ((agent.profile.name === "sprinter" || agent.profile.name === "rival-hunter") && wantsAttack) return "mini_pack";
  if ((agent.profile.name === "banker" || agent.profile.name === "defender") && wantsEndurance) return "heavy_pack";
  if (agent.profile.name === "rain-reader" && circuit.likelyWeather !== "dry") return "standard";
  return agent.profile.pitStrategy;
}

function playableCard(agent: PlaytestAgentState, circuit: CityCircuitIdentity, cardPlayCount: (cardId: CardId) => number) {
  if (agent.profile.mode === "no_card") return undefined;
  if (agent.profile.mode === "random") return agent.cards[(agent.starts + circuit.city.length) % Math.max(1, agent.cards.length)];
  const useful = agent.cards.filter((card) => {
    if (agent.profile.mode !== "rain_gambler" && (card === "rain_grip" || card === "rain_mapping") && circuit.likelyWeather === "dry") return false;
    return agent.profile.buy.includes(card);
  });
  return useful.sort((left, right) => cardPlayCount(left) - cardPlayCount(right))[0] ?? agent.cards[0];
}

function multiplayerCardFor(input: { profile: PlaytestProfile; index: number; round: number; teamId: string; teams: PlaytestTeamState[] }): CardId | undefined {
  const team = input.teams.find((candidate) => candidate.id === input.teamId);
  if (!team?.cards.length || (input.index + input.round) % 2 !== 0) return undefined;
  return input.profile.buy.find((cardId) => team.cards.includes(cardId)) ?? team.cards[0];
}

function multiplayerRivalFor(input: { profile: PlaytestProfile; teamId: string; teams: PlaytestTeamState[] }) {
  if (input.profile.rival === "none") return undefined;
  const ordered = [...input.teams].sort((left, right) => right.points - left.points || left.name.localeCompare(right.name));
  if (input.profile.rival === "leader") return ordered.find((team) => team.id !== input.teamId)?.id;
  const selfIndex = ordered.findIndex((team) => team.id === input.teamId);
  return ordered[selfIndex - 1]?.id ?? ordered[selfIndex + 1]?.id;
}
