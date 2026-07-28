import packageJson from "../package.json" with { type: "json" };

export const APP_NAME = "CR League";
export const APP_VERSION = packageJson.version;

export type HealthStatus = {
  app: typeof APP_NAME;
  service: "api";
  status: "ok";
  version: string;
  commit: string;
  timestamp: string;
};

export { CARD_DEFINITIONS, CARD_DESCRIPTORS, type CardDefinition, type CardDescriptor, type CardStrengthBand } from "./cards/definitions.js";
export { betterCircuitTime, circuitStatsFor, circuitStatsForTeam, layoutKeyForRound, normalizeCircuitRecords, withCircuitRecord, type CircuitRecords, type CircuitTeamStats } from "./domain/circuitStats.js";
export { CITY_CIRCUIT_IDENTITIES, circuitIdentityForRound, circuitSeasonSeed, pitWindowForCircuit, progressRangeForRaceSegment, raceInputFromCircuit, seasonCircuitIdentities, trackSpeedProfileForCircuit, trackZonesForCircuit, zoneForRaceSegment, zonesAtProgress, type CityCircuitIdentity, type TrackSpeedProfile, type TrackZone } from "./domain/circuits.js";
export { safeHex } from "./domain/colors.js";
export { APPROACH_DELTAS, CARD_DELTAS, PIT_STRATEGY_DELTAS, PREPARATION_DELTAS, type DecisionDeltaKey, type DecisionDeltas } from "./domain/decisionDeltas.js";
export type { LeagueState, ProfileSession, SeasonSummary } from "./domain/league.js";
export { buyCard, buyCarAsset, qualifyingCardForTeam, resolveGrandPrix, runQualifying, sellCard, startNextGrandPrix, submitDecision, updateTeamLivery, updateTeamName, validateDecisionValues, SharedLeagueRuleError, type BuyCardInput, type BuyCarAssetInput, type ResolveGrandPrixInput, type RunQualifyingInput, type SellCardInput, type SubmitDecisionInput, type TeamScopedInput, type UpdateTeamLiveryInput, type UpdateTeamNameInput } from "./domain/leagueEngine.js";
export * from "./domain/race.js";
export { seasonStandings, standingsRival, type SeasonStanding, type StandingsRival } from "./domain/standings.js";
export { TEAM_NAME_SUGGESTIONS } from "./domain/teamNames.js";
export { strongestForecast } from "./domain/weather.js";
export {
  CARD_PRICES,
  CARD_PRICE,
  COMEBACK_CREDIT_BONUS_CAP,
  COMEBACK_CREDIT_BONUS_PER_POSITION,
  ECONOMY_MODE_CREDIT_BONUS,
  FLEET_SPONSORSHIP_CREDIT_BONUS,
  RACE_CREDITS_BY_POSITION,
  RACE_POINTS_BY_POSITION
} from "./economy/constants.js";
export { CAR_ASSET_IDS, CAR_ASSET_PRICES, DEFAULT_CAR_ASSET_ID, carAssetPrice, isCarAssetId, type CarAssetId } from "./economy/carAssets.js";
export { DEMO_RACE_INPUT } from "./simulation/demoRace.js";
export { createPrng } from "./simulation/prng.js";
export { bestQualifyingRuns, createQualifyingRuns } from "./simulation/qualifyingRuns.js";
export { RACE_REPLAY_BASE_SECONDS, resolveRaceWeather, simulateRace } from "./simulation/simulateRace.js";
export { classificationScore, lapForProgress, lapForSegment, segmentOrderLap } from "./simulation/raceProgress.js";
export { positionDeltas, replayOrderAtProgress, traceGapsAt, tracePointAt, traceTimesAt } from "./simulation/replayState.js";
export { expandedSpeedSpan, integratedSpeedProfile, progressInSpeedSpan, speedFactorAt, type SpeedProfile, type SpeedProfileFactorMode } from "./simulation/speedProfile.js";
export { validateReplayTrace } from "./simulation/validateReplayTrace.js";
