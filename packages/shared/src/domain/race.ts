export const RACE_SEGMENTS = ["start", "early", "mid", "late", "finish"] as const;

export type RaceSegment = (typeof RACE_SEGMENTS)[number];

export type RaceApproach = "prudent" | "balanced" | "aggressive";

export type TechnicalPreparation = "speed" | "reliability" | "weather";

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
  | "fleet_sponsorship";

export type RaceDecision = {
  approach: RaceApproach;
  preparation: TechnicalPreparation;
  cardId?: CardId;
  rivalTeamId?: string;
  defaulted?: boolean;
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

export type RaceInput = {
  seed: string;
  grandPrixName: string;
  primaryTrait: CircuitTrait;
  secondaryTrait: CircuitTrait;
  forecast: WeatherForecast;
  participants: RaceParticipant[];
};

export type RaceEventType =
  | "strong_start"
  | "poor_start"
  | "weather_change"
  | "weather_gamble_paid"
  | "wrong_weather_bet"
  | "card_triggered"
  | "rival_overtake"
  | "mechanical_scare"
  | "mechanic_save"
  | "late_push_gain"
  | "late_push_failure"
  | "sponsor_payout"
  | "held_position"
  | "race_note"
  | "finish";

export type RaceEvent = {
  id: string;
  order: number;
  segment: RaceSegment;
  lap: number;
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
  order: string[];
  times: Record<string, number>;
  gaps: Record<string, number>;
};

export type RaceResult = {
  grandPrixName: string;
  seed: string;
  resolvedWeather: Record<RaceSegment, Weather>;
  classification: ClassificationEntry[];
  events: RaceEvent[];
  replayTrace?: ReplayTracePoint[];
  consumedCards: Array<{ teamId: string; cardId: CardId }>;
  report: {
    headline: string;
    blocks: ReportBlock[];
  };
};

export type InternalScores = {
  pace: number;
  control: number;
  reliability: number;
  weatherReadiness: number;
  aggression: number;
  score: number;
};
