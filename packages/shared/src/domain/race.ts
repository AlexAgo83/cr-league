export const RACE_SEGMENTS = ["start", "early", "mid", "late", "finish"] as const;

export type RaceSegment = (typeof RACE_SEGMENTS)[number];

export const RACE_APPROACHES = ["prudent", "balanced", "aggressive"] as const;

export type RaceApproach = (typeof RACE_APPROACHES)[number];

export const TECHNICAL_PREPARATIONS = ["speed", "reliability", "weather"] as const;

export type TechnicalPreparation = (typeof TECHNICAL_PREPARATIONS)[number];

export const PIT_STRATEGIES = ["heavy_pack", "standard", "mini_pack"] as const;

export type PitStrategy = (typeof PIT_STRATEGIES)[number];

export type CircuitTrait = "fast" | "technical" | "urban" | "high_wear" | "weather_sensitive";

export type Weather = "dry" | "light_rain" | "heavy_rain";

export type BotArchetype =
  | "prudent"
  | "gambler"
  | "rain_specialist"
  | "mechanic"
  | "sprinter"
  | "opportunist";

export type CardId =
  | "rain_grip"
  | "fleet_maintenance"
  | "launch_boost"
  | "urban_draft"
  | "final_surge"
  | "fleet_sponsorship"
  | "soft_tires"
  | "qualifying_focus"
  | "defensive_order"
  | "adjustable_wing"
  | "rain_mapping"
  | "economy_mode"
  | "pit_relay"
  | "hard_tires"
  | "calculated_attack";

export type RaceDecision = {
  approach: RaceApproach;
  preparation: TechnicalPreparation;
  pitStrategy?: PitStrategy;
  cardId?: CardId;
  rivalTeamId?: string;
};

export type RaceParticipant = {
  teamId: string;
  teamName: string;
  kind: "human" | "bot";
  standingsRank: number;
  botArchetype?: BotArchetype;
  decision: RaceDecision;
};

export type WeatherForecast = Record<Weather, number>;

export type RaceTraits = {
  grip: number;
  overtaking: number;
  energy: number;
};

export type TeamLivery = {
  primary: string;
  secondary: string;
};

export type RaceInput = {
  seed: string;
  grandPrixName: string;
  primaryTrait: CircuitTrait;
  secondaryTrait: CircuitTrait;
  traits?: RaceTraits;
  trackLengthMeters?: number;
  laps?: number;
  pitLaneProgress?: number;
  forecast: WeatherForecast;
  participants: RaceParticipant[];
};

export type RaceEventType =
  | "weather_change"
  | "weather_gamble_paid"
  | "wrong_weather_bet"
  | "card_triggered"
  | "rival_overtake"
  | "mechanical_scare"
  | "mechanic_save"
  | "late_push_gain"
  | "sponsor_payout"
  | "held_position"
  | "pit_stop"
  | "best_sector"
  | "pace_gain"
  | "battery_critical"
  | "pit_imminent"
  | "pit_exit"
  | "under_pressure"
  | "overtake_setup"
  | "minor_error"
  | "defense_success"
  | "dense_traffic"
  | "favorable_weather"
  | "personal_record"
  | "penalty_risk"
  | "race_note"
  | "finish";

export type RaceEvent = {
  id: string;
  order: number;
  segment: RaceSegment;
  lap: number;
  traceProgress?: number;
  type: RaceEventType;
  teamId: string;
  relatedTeamId?: string;
  cardId?: CardId;
  severity: "minor" | "major";
  positionDelta: number;
  tags: string[];
  replayText: string;
  reportText: string;
};

export type ClassificationEntry = {
  position: number;
  teamId: string;
  teamName: string;
  points: number;
  credits: number;
  score: number;
  positionChange: number;
  status: "finished";
  resultTags: string[];
};

export type ReportBlock = {
  title: string;
  body: string;
};

export type ReplayTracePoint = {
  segment: RaceSegment;
  lap: number;
  progress: number;
  distanceMeters?: number;
  order: string[];
  times: Record<string, number>;
  gaps: Record<string, number>;
  cars?: Record<
    string,
    {
      trackProgress: number;
      distanceMeters?: number;
      speed: number;
      phase: "grid" | "racing" | "pit_entry" | "pit_stop" | "pit_exit" | "overtake_approach" | "overtake_overlap" | "overtake_pass" | "overtake_settle" | "finished";
    }
  >;
};

export type ReplayOrderChangeFact = {
  type: "order_change";
  segment: RaceSegment;
  lap: number;
  progress: number;
  overtakingTeamId: string;
  overtakenTeamId: string;
  fromPosition: number;
  toPosition: number;
  gapSeconds: number;
};

export type ReplayDirectorBeatFact = {
  id: string;
  type: "grid_start" | "overtake" | "pack" | "weather" | "pit_stop" | "final";
  progress: number;
  lap: number;
  teamId?: string;
  relatedTeamId?: string;
  fromPosition?: number;
  toPosition?: number;
  weather?: Weather;
  gapSeconds?: number;
};

export type RaceReplayFacts = {
  version: 1;
  orderChanges: ReplayOrderChangeFact[];
  directorBeats?: ReplayDirectorBeatFact[];
};

export type RaceResult = {
  grandPrixName: string;
  seed: string;
  resolvedWeather: Record<RaceSegment, Weather>;
  classification: ClassificationEntry[];
  events: RaceEvent[];
  replayTrace?: ReplayTracePoint[];
  replayFacts?: RaceReplayFacts;
  consumedCards: Array<{ teamId: string; cardId: CardId }>;
  report: {
    headline: string;
    blocks: ReportBlock[];
  };
};

export type QualifyingRun = {
  teamId: string;
  time: number;
  lap?: number;
  attempts: number;
  decision: RaceDecision;
  result: RaceResult;
  createdAt: string;
};

export function clampTrait(value: number) {
  return Math.max(1, Math.min(99, Math.round(value)));
}
