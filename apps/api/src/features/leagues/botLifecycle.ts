import {
  CARD_DEFINITIONS,
  CARD_PRICES,
  CAR_ASSET_PRICES,
  DEMO_RACE_INPUT,
  PIT_STRATEGIES,
  circuitIdentityForRound,
  circuitSeasonSeed,
  type CardId,
  type CarAssetId,
  type RaceDecision
} from "@cr-league/shared";
import { createHash } from "node:crypto";
import { BOT_TEAM_NAMES } from "./constants.js";
import { isUniqueConstraintError, lockTeamRow } from "./persistence.js";
import type { Db, LeagueState } from "./types.js";
import { appendCard, liveryKey, normalizeCards, normalizeLivery, normalizeUnlockedCarAssetIds, uniqueBotLivery } from "./utils.js";

export function defaultBotDecision(state: LeagueState, team: LeagueState["teams"][number], fallback?: RaceDecision): RaceDecision {
  const submittedDecision = state.decisions.find((candidate) => candidate.teamId === team.id);
  if (submittedDecision) {
    return {
      approach: submittedDecision.approach as RaceDecision["approach"],
      preparation: submittedDecision.preparation as RaceDecision["preparation"],
      pitStrategy: normalizePitStrategy(submittedDecision.pitStrategy),
      cardId: (submittedDecision.cardId ?? undefined) as RaceDecision["cardId"],
      rivalTeamId: submittedDecision.rivalTeamId ?? undefined
    };
  }
  return {
    approach: fallback?.approach ?? "balanced",
    preparation: fallback?.preparation ?? "speed",
    pitStrategy: botPitStrategyForCircuit(state, team, fallback),
    cardId: defaultCardForTeam(team, fallback?.cardId),
    rivalTeamId: fallback?.rivalTeamId
  };
}

function botPitStrategyForCircuit(state: LeagueState, team: LeagueState["teams"][number], fallback?: RaceDecision): NonNullable<RaceDecision["pitStrategy"]> {
  const circuit = circuitIdentityForRound(state.currentGrandPrix.round, circuitSeasonSeed(state.league.id, state.currentGrandPrix.season));
  const traits = circuit.traits;
  const wetRisk = state.currentGrandPrix.forecast.light_rain + state.currentGrandPrix.forecast.heavy_rain * 2;
  const archetype = fallback?.preparation === "weather" ? "rain" : fallback?.approach;
  const wantsAttack = traits.overtaking >= 72 || state.currentGrandPrix.primaryTrait === "fast" || state.currentGrandPrix.primaryTrait === "urban";
  const wantsEndurance = traits.energy <= 58 || circuit.trackLengthMeters >= 5600 || state.currentGrandPrix.primaryTrait === "high_wear";

  if (wetRisk >= 100) return "standard";
  if (archetype === "aggressive" && wantsAttack) return "mini_pack";
  if (archetype === "prudent" && wantsEndurance) return "heavy_pack";
  if (archetype === "rain" && wetRisk >= 70) return "standard";
  if (wantsEndurance && team.id.length % 2 === 0) return "heavy_pack";
  if (wantsAttack) return "mini_pack";
  return normalizePitStrategy(fallback?.pitStrategy);
}

export function normalizePitStrategy(value: unknown): NonNullable<RaceDecision["pitStrategy"]> {
  return PIT_STRATEGIES.includes(value as NonNullable<RaceDecision["pitStrategy"]>) ? value as NonNullable<RaceDecision["pitStrategy"]> : "standard";
}

export async function buyBotCards(db: Db, state: LeagueState, seed: string) {
  for (const team of state.teams.filter((team) => team.kind === "bot")) {
    await lockTeamRow(db, team.id);
    const freshTeam = await db.team.findUnique({ where: { id: team.id } });
    const credits = freshTeam?.leagueId === state.league.id ? freshTeam.credits : 0;
    const cards = freshTeam ? normalizeCards(freshTeam.cards) : team.cards;
    const affordable = affordableCardIds(credits);
    if (!freshTeam || !affordable.length) continue;
    const cardId = randomCardId(`${seed}-${team.id}-${credits}-${cards.length}`, affordable);
    await db.team.update({
      where: { id: team.id },
      data: {
        credits: { decrement: CARD_PRICES[cardId] },
        cards: appendCard(cards, cardId)
      }
    });
  }
}

export async function buyBotCars(db: Db, state: LeagueState, seed: string) {
  for (const team of state.teams.filter((team) => team.kind === "bot")) {
    await lockTeamRow(db, team.id);
    const freshTeam = await db.team.findUnique({ where: { id: team.id } });
    if (!freshTeam || freshTeam.leagueId !== state.league.id) continue;
    const unlocked = normalizeUnlockedCarAssetIds(freshTeam.unlockedCarAssetIds);
    const affordable = paidCarAssetIds(freshTeam.credits).filter((carAssetId) => !unlocked.includes(carAssetId));
    if (!affordable.length) continue;
    const carAssetId = randomCarAssetId(`${seed}-${team.id}-${freshTeam.credits}-${unlocked.length}`, affordable);
    await db.team.updateMany({
      where: { id: team.id, credits: { gte: CAR_ASSET_PRICES[carAssetId] } },
      data: {
        credits: { decrement: CAR_ASSET_PRICES[carAssetId] },
        unlockedCarAssetIds: [...unlocked, carAssetId],
        livery: { ...normalizeLivery(freshTeam.livery), carAssetId }
      }
    });
  }
}

function defaultCardForTeam(team: LeagueState["teams"][number], preferred?: CardId) {
  return preferred && team.cards.includes(preferred) ? preferred : team.cards[0];
}

function affordableCardIds(credits: number): CardId[] {
  return (Object.keys(CARD_DEFINITIONS) as CardId[]).filter((cardId) => CARD_PRICES[cardId] <= credits);
}

function randomCardId(seed: string, cards: CardId[]): CardId {
  return cards[createHash("sha1").update(seed).digest()[0]! % cards.length]!;
}

function paidCarAssetIds(credits: number): CarAssetId[] {
  return (Object.keys(CAR_ASSET_PRICES) as CarAssetId[]).filter((carAssetId) => CAR_ASSET_PRICES[carAssetId] > 0 && CAR_ASSET_PRICES[carAssetId] <= credits);
}

function randomCarAssetId(seed: string, carAssetIds: CarAssetId[], current?: CarAssetId): CarAssetId {
  const candidates = carAssetIds.length > 1 ? carAssetIds.filter((carAssetId) => carAssetId !== current) : carAssetIds;
  return candidates[createHash("sha1").update(seed).digest()[0]! % candidates.length]!;
}

export async function fillLeagueWithBots(db: Db, state: LeagueState) {
  const missing = Math.max(0, state.league.maxPlayers - state.teams.length);
  if (!missing) return;

  const existingNames = new Set(state.teams.map((team) => team.name.toLowerCase()));
  const botTemplates = DEMO_RACE_INPUT.participants.filter((participant) => participant.kind === "bot");
  const bots = Array.from({ length: missing }, (_, index) => {
    const participant = botTemplates[index % botTemplates.length];
    if (!participant) return null;
    const baseName = BOT_TEAM_NAMES[index % BOT_TEAM_NAMES.length] ?? participant.teamName;
    let name = baseName;
    let suffix = 2;
    while (existingNames.has(name.toLowerCase())) {
      name = `${baseName} ${suffix}`;
      suffix += 1;
    }
    existingNames.add(name.toLowerCase());
    return { ...participant, teamName: name };
  }).filter((participant): participant is (typeof botTemplates)[number] => Boolean(participant));
  if (!bots.length) return;

  const usedLiveries = new Set(state.teams.map((team) => liveryKey(team.livery)));
  try {
    await db.team.createMany({
      data: bots.map((participant, index) => ({
        leagueId: state.league.id,
        name: participant.teamName,
        kind: "bot",
        claimCode: null,
        points: 0,
        credits: 0,
        cards: [],
        livery: uniqueBotLivery(index, usedLiveries)
      }))
    });
  } catch (error) {
    // Concurrent fill: the first writer already created the bots, keep its result.
    if (!isUniqueConstraintError(error)) throw error;
  }
}
