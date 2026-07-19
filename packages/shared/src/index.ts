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

export { CARD_DEFINITIONS, type CardDefinition } from "./cards/definitions.js";
export { CITY_CIRCUIT_IDENTITIES, circuitIdentityForRound, circuitSeasonSeed, raceInputFromCircuit, seasonCircuitIdentities, type CityCircuitIdentity } from "./domain/circuits.js";
export * from "./domain/race.js";
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
export { DEMO_RACE_INPUT } from "./simulation/demoRace.js";
export { createPrng } from "./simulation/prng.js";
export { RACE_REPLAY_BASE_SECONDS, simulateRace } from "./simulation/simulateRace.js";
export { validateReplayTrace } from "./simulation/validateReplayTrace.js";
