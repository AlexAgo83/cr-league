import type { CardId, PitStrategy, RaceApproach, TechnicalPreparation } from "./race.js";

export type DecisionDeltaKey = "pace" | "control" | "reliability" | "weatherReadiness" | "aggression";
export type DecisionDeltas = Partial<Record<DecisionDeltaKey, number>>;

export const APPROACH_DELTAS: Record<RaceApproach, DecisionDeltas> = {
  prudent: { pace: -8, control: 10, reliability: 9, aggression: -12 },
  balanced: { control: 4, reliability: 4, weatherReadiness: 4 },
  aggressive: { pace: 16, control: -6, reliability: -5, aggression: 16 }
};

export const PREPARATION_DELTAS: Record<TechnicalPreparation, DecisionDeltas> = {
  speed: { pace: 9, reliability: -4 },
  reliability: { reliability: 12, control: 6, pace: -2 },
  weather: { weatherReadiness: 14, control: 4 }
};

export const PIT_STRATEGY_DELTAS: Record<PitStrategy, DecisionDeltas> = {
  heavy_pack: { pace: -14, reliability: 4, control: 2 },
  standard: {},
  mini_pack: { pace: 8, aggression: 4, reliability: -5 }
};

export const CARD_DELTAS: Partial<Record<CardId, DecisionDeltas>> = {
  soft_tires: { pace: 8, aggression: 6, reliability: -10 },
  defensive_order: { control: 6, reliability: 3, aggression: -11, pace: -8 },
  adjustable_wing: { pace: 4, aggression: 5, reliability: -6 },
  economy_mode: { pace: -4, control: 6, reliability: 2 },
  hard_tires: { pace: -6, reliability: 7, control: 3 },
  calculated_attack: { aggression: 7 }
};

