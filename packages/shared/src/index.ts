export const APP_NAME = "CR League";
export const APP_VERSION = "0.3.6";

export type HealthStatus = {
  app: typeof APP_NAME;
  service: "api";
  status: "ok";
  version: string;
  commit: string;
  timestamp: string;
};

export { CARD_DEFINITIONS, type CardDefinition } from "./cards/definitions.js";
export { CITY_CIRCUIT_IDENTITIES, circuitIdentityForRound, raceInputFromCircuit, type CityCircuitIdentity } from "./domain/circuits.js";
export * from "./domain/race.js";
export { CARD_PRICE, FLEET_SPONSORSHIP_CREDIT_BONUS, RACE_CREDITS_BY_POSITION, RACE_POINTS_BY_POSITION } from "./economy/constants.js";
export { DEMO_RACE_INPUT } from "./simulation/demoRace.js";
export { simulateRace } from "./simulation/simulateRace.js";
