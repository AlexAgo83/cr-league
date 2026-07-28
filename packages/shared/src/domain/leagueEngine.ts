import { CARD_DEFINITIONS } from "../cards/definitions.js";
import { isCarAssetId, CAR_ASSET_PRICES } from "../economy/carAssets.js";
import { CARD_PRICES } from "../economy/constants.js";
import type { CardId, RaceDecision, TeamLivery } from "./race.js";
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
  return {
    ...state,
    decisions: [nextDecision, ...state.decisions.filter((candidate) => candidate.teamId !== team.id)]
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
