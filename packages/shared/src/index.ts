export const APP_NAME = "CR League";

export type HealthStatus = {
  app: typeof APP_NAME;
  service: "api";
  status: "ok";
  timestamp: string;
};

export { CARD_DEFINITIONS, type CardDefinition } from "./cards/definitions.js";
export * from "./domain/race.js";
export { createPrng, type Prng } from "./simulation/prng.js";
export { simulateRace } from "./simulation/simulateRace.js";
