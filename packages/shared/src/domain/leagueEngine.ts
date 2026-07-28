import { CARD_DEFINITIONS } from "../cards/definitions.js";
import { circuitIdentityForRound, circuitSeasonSeed, raceInputFromCircuit, trackSpeedProfileForCircuit, trackZonesForCircuit } from "./circuits.js";
import { isCarAssetId, CAR_ASSET_PRICES } from "../economy/carAssets.js";
import { CARD_PRICES } from "../economy/constants.js";
import { bestQualifyingRuns, createQualifyingRuns } from "../simulation/qualifyingRuns.js";
import { simulateRace } from "../simulation/simulateRace.js";
import { DEMO_RACE_INPUT } from "../simulation/demoRace.js";
import type { CardId, RaceDecision, RaceInput, RaceParticipant, TeamLivery } from "./race.js";
import { PIT_STRATEGIES, RACE_APPROACHES, TECHNICAL_PREPARATIONS } from "./race.js";
import type { LeagueState } from "./league.js";

const TEAM_NAME_LIMIT = 32;
const DEFAULT_LIVERY: TeamLivery = { primary: "#16c784", secondary: "#38bdf8" };

export class SharedLeagueRuleError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "SharedLeagueRuleError";
  }
}

export type TeamScopedInput = {
  teamId?: string;
};

export type BuyCardInput = TeamScopedInput & {
  cardId?: string;
  quantity?: number;
};

export type BuyCarAssetInput = TeamScopedInput & {
  carAssetId?: string;
};

export type SellCardInput = TeamScopedInput & {
  cardId?: string;
};

export type UpdateTeamNameInput = TeamScopedInput & {
  name?: unknown;
};

export type UpdateTeamLiveryInput = TeamScopedInput & {
  livery?: unknown;
};

export type SubmitDecisionInput = TeamScopedInput & {
  approach?: unknown;
  preparation?: unknown;
  pitStrategy?: unknown;
  cardId?: unknown;
  rivalTeamId?: unknown;
};

export type RunQualifyingInput = SubmitDecisionInput & {
  laps?: number;
};

export type ResolveGrandPrixInput = {
  allowDefaults?: boolean;
  seed?: string;
};

export function buyCard(state: LeagueState, input: BuyCardInput = {}) {
  const team = teamForInput(state, input);
  const cardId = validCardId(input.cardId);
  const quantity = clampInteger(input.quantity, 1, 1, 99);
  const totalPrice = CARD_PRICES[cardId] * quantity;
  if (team.credits < totalPrice) {
    throw new SharedLeagueRuleError("Not enough credits to buy this card.");
  }

  return updateTeam(state, team.id, {
    credits: team.credits - totalPrice,
    cards: [...team.cards, ...Array.from({ length: quantity }, () => cardId)]
  });
}

export function sellCard(state: LeagueState, input: SellCardInput = {}) {
  const team = teamForInput(state, input);
  const cardId = validCardId(input.cardId);
  if (state.decisions.some((decision) => decision.teamId === team.id && decision.cardId === cardId)) {
    throw new SharedLeagueRuleError("This card is already used in your current plan.");
  }
  if (qualifyingCardForTeam(state.currentGrandPrix.qualifyingRuns, team.id) === cardId) {
    throw new SharedLeagueRuleError("This card is already locked by your qualifying run.");
  }

  const cardIndex = team.cards.indexOf(cardId);
  if (cardIndex < 0) {
    throw new SharedLeagueRuleError("This card is not in your inventory.");
  }
  const cards = [...team.cards];
  cards.splice(cardIndex, 1);
  return updateTeam(state, team.id, {
    credits: team.credits + CARD_PRICES[cardId] / 2,
    cards
  });
}

export function buyCarAsset(state: LeagueState, input: BuyCarAssetInput = {}) {
  const team = teamForInput(state, input);
  const carAssetId = input.carAssetId;
  if (typeof carAssetId !== "string" || !isCarAssetId(carAssetId) || CAR_ASSET_PRICES[carAssetId] <= 0) {
    throw new SharedLeagueRuleError("Expected a valid paid car.");
  }
  if (team.unlockedCarAssetIds.includes(carAssetId)) {
    throw new SharedLeagueRuleError("This car is already unlocked.");
  }

  const price = CAR_ASSET_PRICES[carAssetId];
  if (team.credits < price) {
    throw new SharedLeagueRuleError("Not enough credits to buy this car.");
  }

  return updateTeam(state, team.id, {
    credits: team.credits - price,
    unlockedCarAssetIds: [...team.unlockedCarAssetIds, carAssetId],
    livery: { ...team.livery, carAssetId }
  });
}

export function updateTeamName(state: LeagueState, input: UpdateTeamNameInput = {}) {
  const team = teamForInput(state, input);
  const name = normalizeDisplayName(input.name, TEAM_NAME_LIMIT);
  if (!name) {
    throw new SharedLeagueRuleError("Team name must be 3 to 32 readable characters.");
  }
  if (state.teams.some((candidate) => candidate.id !== team.id && candidate.name.toLowerCase() === name.toLowerCase())) {
    throw new SharedLeagueRuleError("This team name is already taken.");
  }

  return updateTeam(state, team.id, { name });
}

export function updateTeamLivery(state: LeagueState, input: UpdateTeamLiveryInput = {}) {
  const team = teamForInput(state, input);
  const livery = normalizeLivery(input.livery);
  const selectedCarAssetId = livery.carAssetId;
  if (
    selectedCarAssetId &&
    isCarAssetId(selectedCarAssetId) &&
    CAR_ASSET_PRICES[selectedCarAssetId] > 0 &&
    !team.unlockedCarAssetIds.includes(selectedCarAssetId)
  ) {
    throw new SharedLeagueRuleError("This car is locked.");
  }

  return updateTeam(state, team.id, { livery });
}

export function submitDecision(state: LeagueState, input: SubmitDecisionInput) {
  if (state.currentGrandPrix.status === "resolved") {
    throw new SharedLeagueRuleError("This Grand Prix is already resolved.");
  }
  const team = teamForInput(state, input);
  const decision = validateDecisionValues(state, input);
  const lockedCardId = qualifyingCardForTeam(state.currentGrandPrix.qualifyingRuns, team.id);
  if (lockedCardId && decision.cardId && decision.cardId !== lockedCardId) {
    throw new SharedLeagueRuleError("This Grand Prix card is already locked by your qualifying run.");
  }
  const cardId = lockedCardId ?? decision.cardId;
  if (cardId && !team.cards.includes(cardId)) {
    throw new SharedLeagueRuleError("This card is not in your inventory.");
  }

  const nextDecision = {
    teamId: team.id,
    approach: decision.approach,
    preparation: decision.preparation,
    pitStrategy: decision.pitStrategy ?? "standard",
    cardId: cardId ?? null,
    rivalTeamId: decision.rivalTeamId ?? null
  };
  const decisions = [nextDecision, ...state.decisions.filter((candidate) => candidate.teamId !== team.id)];
  return {
    ...state,
    decisions,
    actionState: buildActionState(state.teams, state.currentGrandPrix.status, decisions.map((decision) => decision.teamId))
  };
}

export function runQualifying(state: LeagueState, input: RunQualifyingInput) {
  if (state.currentGrandPrix.status === "resolved") {
    throw new SharedLeagueRuleError("This Grand Prix is already resolved.");
  }
  const team = teamForInput(state, input);
  if (state.decisions.some((decision) => decision.teamId === team.id)) {
    throw new SharedLeagueRuleError("Qualifying is closed after submitting your directive.");
  }
  const decision = validateDecisionValues(state, input);
  const lockedCardId = qualifyingCardForTeam(state.currentGrandPrix.qualifyingRuns, team.id);
  if (lockedCardId && decision.cardId && decision.cardId !== lockedCardId) {
    throw new SharedLeagueRuleError("This Grand Prix card is already locked by your qualifying run.");
  }
  const cardId = lockedCardId ?? decision.cardId;
  if (cardId && !team.cards.includes(cardId)) {
    throw new SharedLeagueRuleError("This card is not in your inventory.");
  }

  const teamRuns = state.currentGrandPrix.qualifyingRuns.filter((run) => run.teamId === team.id);
  const previousBest = teamRuns.reduce<LeagueState["currentGrandPrix"]["qualifyingRuns"][number] | null>((best, run) => (!best || run.time < best.time ? run : best), null);
  const attempts = Math.max(0, ...teamRuns.map((run) => run.attempts)) + 1;
  if (attempts > state.league.qualifyingAttemptLimit) {
    throw new SharedLeagueRuleError("No qualifying attempts left.");
  }

  const circuit = circuitIdentityForRound(state.currentGrandPrix.round, circuitSeasonSeed(state.league.id, state.currentGrandPrix.season));
  const attemptRuns = createQualifyingRuns({
    seed: `${state.currentGrandPrix.id}-${team.id}-qualifying-${attempts}`,
    teamId: team.id,
    teamName: team.name,
    decision: { ...decision, pitStrategy: decision.pitStrategy ?? "standard", cardId },
    primaryTrait: state.currentGrandPrix.primaryTrait as RaceInput["primaryTrait"],
    secondaryTrait: state.currentGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
    traits: circuit.traits,
    trackLengthMeters: circuit.trackLengthMeters,
    speedProfile: trackSpeedProfileForCircuit(circuit),
    forecast: state.currentGrandPrix.forecast,
    laps: clampInteger(input.laps, 3, 1, 3),
    weatherSeed: state.currentGrandPrix.id
  });
  const nextRunsForAttempt = attemptRuns.map((run) => ({ ...run, attempts }));
  const nextRun = nextRunsForAttempt.reduce((best, run) => (run.time < best.time ? run : best), nextRunsForAttempt[0]!);
  const nextRuns = [...state.currentGrandPrix.qualifyingRuns, ...nextRunsForAttempt];

  for (const bot of state.teams.filter((candidate) => candidate.kind === "bot")) {
    const botAttempt = Math.max(0, ...nextRuns.filter((run) => run.teamId === bot.id).map((run) => run.attempts)) + 1;
    if (botAttempt > attempts || botAttempt > state.league.qualifyingAttemptLimit) continue;
    nextRuns.push(
      {
        ...createQualifyingRuns({
          seed: `${state.currentGrandPrix.id}-${bot.id}-bot-qualifying-${botAttempt}`,
          teamId: bot.id,
          teamName: bot.name,
          decision: defaultBotDecision(state, bot),
          primaryTrait: state.currentGrandPrix.primaryTrait as RaceInput["primaryTrait"],
          secondaryTrait: state.currentGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
          traits: circuit.traits,
          trackLengthMeters: circuit.trackLengthMeters,
          speedProfile: trackSpeedProfileForCircuit(circuit),
          forecast: state.currentGrandPrix.forecast,
          laps: 1,
          weatherSeed: state.currentGrandPrix.id
        })[0]!,
        attempts: botAttempt
      }
    );
  }

  return {
    state: {
      ...state,
      currentGrandPrix: {
        ...state.currentGrandPrix,
        qualifyingRuns: nextRuns
      }
    },
    run: nextRun,
    isBest: !previousBest || nextRun.time < previousBest.time
  };
}

export function resolveGrandPrix(state: LeagueState, input: ResolveGrandPrixInput = {}) {
  if (state.currentGrandPrix.status === "resolved") {
    throw new SharedLeagueRuleError("This Grand Prix is already resolved.");
  }
  const missingTeamIds = missingHumanTeamIds(state);
  if (missingTeamIds.length && !input.allowDefaults) {
    throw new SharedLeagueRuleError("Some drivers still need to submit their race directive.");
  }
  if (state.teams.length < 2) {
    throw new SharedLeagueRuleError("At least two teams are required to launch the Grand Prix.");
  }

  const circuit = circuitIdentityForRound(state.currentGrandPrix.round, circuitSeasonSeed(state.league.id, state.currentGrandPrix.season));
  const result = simulateRace({
    seed: input.seed ?? state.currentGrandPrix.id,
    grandPrixName: state.currentGrandPrix.name,
    primaryTrait: state.currentGrandPrix.primaryTrait as RaceInput["primaryTrait"],
    secondaryTrait: state.currentGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
    traits: circuit.traits,
    trackLengthMeters: circuit.trackLengthMeters,
    laps: circuit.laps,
    pitLaneProgress: circuit.pitLaneProgress,
    trackZones: trackZonesForCircuit(circuit),
    speedProfile: trackSpeedProfileForCircuit(circuit),
    forecast: state.currentGrandPrix.forecast,
    participants: buildParticipants(state)
  });
  result.defaultedTeamIds = missingTeamIds;
  const consumedByTeam = new Map<string, CardId[]>();
  for (const consumed of result.consumedCards) {
    consumedByTeam.set(consumed.teamId, [...(consumedByTeam.get(consumed.teamId) ?? []), consumed.cardId]);
  }
  const rewardByTeam = new Map(result.classification.map((entry) => [entry.teamId, entry]));
  const teams = state.teams.map((team) => {
    const reward = rewardByTeam.get(team.id);
    const cards = [...team.cards];
    for (const cardId of consumedByTeam.get(team.id) ?? []) {
      const index = cards.indexOf(cardId);
      if (index >= 0) cards.splice(index, 1);
    }
    return {
      ...team,
      points: team.points + (reward?.points ?? 0),
      credits: team.credits + (reward?.credits ?? 0),
      cards,
      ready: true
    };
  });
  const currentGrandPrix = {
    ...state.currentGrandPrix,
    status: "resolved",
    result
  };

  return {
    ...state,
    currentGrandPrix,
    grandPrixHistory: upsertGrandPrixHistory(state.grandPrixHistory, currentGrandPrix),
    teams,
    actionState: buildActionState(teams, "resolved", state.decisions.map((decision) => decision.teamId))
  };
}

export function startNextGrandPrix(state: LeagueState) {
  if (state.currentGrandPrix.status !== "resolved") {
    throw new SharedLeagueRuleError("Resolve the current Grand Prix before starting the next one.");
  }
  const nextSeason = state.currentGrandPrix.round >= state.league.maxGrandPrixPerSeason ? state.currentGrandPrix.season + 1 : state.currentGrandPrix.season;
  const nextRound = state.currentGrandPrix.round >= state.league.maxGrandPrixPerSeason ? 1 : state.currentGrandPrix.round + 1;
  const nextRaceInput = raceInputFromCircuit(circuitIdentityForRound(nextRound, circuitSeasonSeed(state.league.id, nextSeason)));
  const closingSeasonSummary = nextSeason !== state.currentGrandPrix.season ? seasonSummaryFromState(state, state.currentGrandPrix.season) : null;
  const teams = state.teams.map((team) => ({
    ...team,
    points: nextSeason !== state.currentGrandPrix.season ? 0 : team.points,
    ready: false
  }));
  const currentGrandPrix = {
    id: `${state.league.id}-gp-${nextSeason}-${nextRound}`,
    name: state.currentGrandPrix.name,
    season: nextSeason,
    round: nextRound,
    status: "briefing",
    primaryTrait: nextRaceInput.primaryTrait,
    secondaryTrait: nextRaceInput.secondaryTrait,
    trackLengthMeters: nextRaceInput.trackLengthMeters ?? state.currentGrandPrix.trackLengthMeters,
    forecast: nextRaceInput.forecast,
    qualifyingRuns: [],
    result: null
  };

  return {
    ...state,
    seasonSummaries: closingSeasonSummary ? upsertSeasonSummary(state.seasonSummaries, closingSeasonSummary) : state.seasonSummaries,
    currentGrandPrix,
    grandPrixHistory: upsertGrandPrixHistory(state.grandPrixHistory, state.currentGrandPrix),
    teams,
    decisions: [],
    actionState: buildActionState(teams, "briefing", [])
  };
}

export function validateDecisionValues(state: LeagueState, input: SubmitDecisionInput): RaceDecision {
  if (!RACE_APPROACHES.includes(input.approach as RaceDecision["approach"])) {
    throw new SharedLeagueRuleError("Unsupported race approach.");
  }
  if (!TECHNICAL_PREPARATIONS.includes(input.preparation as RaceDecision["preparation"])) {
    throw new SharedLeagueRuleError("Unsupported technical preparation.");
  }
  const pitStrategy = input.pitStrategy;
  if (pitStrategy != null && (typeof pitStrategy !== "string" || !(PIT_STRATEGIES as readonly string[]).includes(pitStrategy))) {
    throw new SharedLeagueRuleError("Unsupported pit strategy.");
  }
  if (input.cardId != null && (typeof input.cardId !== "string" || !isCardId(input.cardId))) {
    throw new SharedLeagueRuleError("Unknown card.");
  }
  if (input.rivalTeamId != null && (typeof input.rivalTeamId !== "string" || !state.teams.some((team) => team.id === input.rivalTeamId))) {
    throw new SharedLeagueRuleError("Unknown rival team.");
  }
  if (input.rivalTeamId === input.teamId) {
    throw new SharedLeagueRuleError("A rival must be another team.");
  }

  return {
    approach: input.approach as RaceDecision["approach"],
    preparation: input.preparation as RaceDecision["preparation"],
    pitStrategy: pitStrategy as RaceDecision["pitStrategy"] | undefined,
    cardId: input.cardId as RaceDecision["cardId"] | undefined,
    rivalTeamId: input.rivalTeamId as string | undefined
  };
}

export function qualifyingCardForTeam(runs: LeagueState["currentGrandPrix"]["qualifyingRuns"], teamId: string) {
  return runs.find((run) => run.teamId === teamId && run.decision?.cardId === "qualifying_focus")?.decision?.cardId;
}

function missingHumanTeamIds(state: LeagueState) {
  const submitted = new Set(state.decisions.map((decision) => decision.teamId));
  return state.teams.filter((team) => team.kind === "human" && !submitted.has(team.id)).map((team) => team.id);
}

function buildParticipants(state: LeagueState): RaceParticipant[] {
  const baseRank = new Map(state.teams.map((team, index) => [team.id, index + 1]));
  const qualifyingTime = new Map(bestQualifyingRuns(state.currentGrandPrix.qualifyingRuns).map((run) => [run.teamId, run.time]));
  const qualifyingRank = new Map(
    [...state.teams]
      .sort(
        (left, right) =>
          (qualifyingTime.get(left.id) ?? Number.POSITIVE_INFINITY) - (qualifyingTime.get(right.id) ?? Number.POSITIVE_INFINITY) ||
          (baseRank.get(left.id) ?? 999) - (baseRank.get(right.id) ?? 999)
      )
      .map((team, index) => [team.id, index + 1])
  );

  return state.teams.map((team, index) => {
    const demo = DEMO_RACE_INPUT.participants[index % DEMO_RACE_INPUT.participants.length];
    if (!demo) {
      throw new Error("Demo race participant template is missing.");
    }
    const decision = state.decisions.find((candidate) => candidate.teamId === team.id);
    return {
      teamId: team.id,
      teamName: team.name,
      kind: team.kind === "bot" ? "bot" : "human",
      standingsRank: qualifyingRank.get(team.id) ?? index + 1,
      botArchetype: demo.botArchetype,
      decision: team.kind === "bot" ? defaultBotDecision(state, team, demo.decision) : decision
        ? {
            approach: decision.approach,
            preparation: decision.preparation,
            pitStrategy: normalizePitStrategy(decision.pitStrategy),
            cardId: decision.cardId ?? undefined,
            rivalTeamId: decision.rivalTeamId ?? undefined
          }
        : {
            approach: "balanced",
            preparation: "reliability",
            pitStrategy: "standard"
          }
    };
  });
}

function buildActionState(teams: Array<{ id: string; kind: string }>, grandPrixStatus: string, submittedTeamIds: string[]) {
  const submitted = new Set(submittedTeamIds);
  const humanTeamIds = teams.filter((team) => team.kind === "human").map((team) => team.id);
  const missingTeamIds = grandPrixStatus === "resolved" ? [] : humanTeamIds.filter((teamId) => !submitted.has(teamId));
  const canStartNextGrandPrix = grandPrixStatus === "resolved";
  const canResolve = grandPrixStatus !== "resolved" && humanTeamIds.length > 0 && missingTeamIds.length === 0;
  const canResolveWithDefaults = grandPrixStatus !== "resolved" && missingTeamIds.length > 0;
  return {
    submittedTeamIds,
    missingTeamIds,
    canResolve,
    canResolveWithDefaults,
    canStartNextGrandPrix,
    nextAction: canStartNextGrandPrix ? "start_next_grand_prix" : canResolve ? "resolve_grand_prix" : canResolveWithDefaults ? "resolve_with_defaults" : "wait_for_directives"
  };
}

function upsertGrandPrixHistory(history: LeagueState["grandPrixHistory"], grandPrix: LeagueState["currentGrandPrix"]): LeagueState["grandPrixHistory"] {
  const entry = {
    id: grandPrix.id,
    name: grandPrix.name,
    season: grandPrix.season,
    round: grandPrix.round,
    status: grandPrix.status,
    result: grandPrix.result
  };
  return [entry, ...history.filter((candidate) => candidate.id !== grandPrix.id)].sort((left, right) => left.season - right.season || left.round - right.round);
}

function seasonSummaryFromState(state: LeagueState, season: number): LeagueState["seasonSummaries"][number] | null {
  const gpCount = state.grandPrixHistory.filter((grandPrix) => grandPrix.season === season && grandPrix.result).length;
  const standings = [...state.teams]
    .sort((left, right) => right.points - left.points || left.name.localeCompare(right.name))
    .map((team, index) => ({
      position: index + 1,
      teamId: team.id,
      teamName: team.name,
      points: team.points,
      livery: team.livery
    }));
  const champion = standings[0];
  return champion ? { season, gpCount, standings, champion } : null;
}

function upsertSeasonSummary(existing: LeagueState["seasonSummaries"], summary: LeagueState["seasonSummaries"][number]) {
  return [summary, ...existing.filter((candidate) => candidate.season !== summary.season)].sort((left, right) => right.season - left.season);
}

function teamForInput(state: LeagueState, input: TeamScopedInput) {
  const team = state.teams.find((candidate) => candidate.id === input.teamId);
  if (!team) {
    throw new SharedLeagueRuleError("Expected a team and a valid card.");
  }
  return team;
}

function updateTeam(state: LeagueState, teamId: string, patch: Partial<LeagueState["teams"][number]>): LeagueState {
  return {
    ...state,
    teams: state.teams.map((team) => (team.id === teamId ? { ...team, ...patch } : team))
  };
}

function validCardId(value: unknown) {
  if (typeof value !== "string" || !isCardId(value)) {
    throw new SharedLeagueRuleError("Expected a team and a valid card.");
  }
  return value;
}

function isCardId(value: string): value is CardId {
  return value in CARD_DEFINITIONS;
}

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback;
}

function normalizePitStrategy(value: unknown): NonNullable<RaceDecision["pitStrategy"]> {
  return PIT_STRATEGIES.includes(value as NonNullable<RaceDecision["pitStrategy"]>) ? value as NonNullable<RaceDecision["pitStrategy"]> : "standard";
}

function defaultBotDecision(state: LeagueState, team: LeagueState["teams"][number], fallback?: RaceDecision): RaceDecision {
  const submittedDecision = state.decisions.find((decision) => decision.teamId === team.id);
  if (submittedDecision) {
    return {
      approach: submittedDecision.approach,
      preparation: submittedDecision.preparation,
      pitStrategy: normalizePitStrategy(submittedDecision.pitStrategy),
      cardId: submittedDecision.cardId ?? undefined,
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

function defaultCardForTeam(team: LeagueState["teams"][number], preferred?: CardId) {
  return preferred && team.cards.includes(preferred) ? preferred : team.cards[0];
}

function normalizeDisplayName(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > maxLength) return "";
  return /^[\p{L}\p{N}' -]+$/u.test(name) ? name : "";
}

function normalizeLivery(value: unknown): TeamLivery {
  if (!value || typeof value !== "object") return DEFAULT_LIVERY;
  const livery = value as Partial<Record<keyof TeamLivery, unknown>>;
  return {
    primary: typeof livery.primary === "string" && isHexColor(livery.primary) ? livery.primary : DEFAULT_LIVERY.primary,
    secondary: typeof livery.secondary === "string" && isHexColor(livery.secondary) ? livery.secondary : DEFAULT_LIVERY.secondary,
    ...(typeof livery.carAssetId === "string" && isCarAssetId(livery.carAssetId) ? { carAssetId: livery.carAssetId } : {})
  };
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}
