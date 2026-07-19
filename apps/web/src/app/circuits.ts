import { CITY_CIRCUIT_IDENTITIES, circuitSeasonSeed, seasonCircuitIdentities } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";

import { CIRCUIT_ROUTES } from "./circuitRoutes/index.js";

export type CityCircuit = {
  city: string;
  country: string;
  layoutKey: TranslationKey;
  laps: number;
  traits: {
    grip: number;
    overtaking: number;
    energy: number;
  };
  likelyWeather: "dry" | "light_rain" | "heavy_rain";
  route: Array<{ lat: number; lng: number }>;
};

export const CITY_CIRCUITS = CITY_CIRCUIT_IDENTITIES.map((identity) => ({
  ...identity,
  layoutKey: identity.layoutKey as TranslationKey,
  route: CIRCUIT_ROUTES[identity.layoutKey] ?? []
})) as [CityCircuit, ...CityCircuit[]];

const CIRCUIT_BY_LAYOUT = new Map(CITY_CIRCUITS.map((circuit) => [circuit.layoutKey, circuit]));

export function circuitsForSeason(leagueId = "default", season = 1): [CityCircuit, ...CityCircuit[]] {
  const seed = leagueId === "default" ? "default" : circuitSeasonSeed(leagueId, season);
  const circuits = seasonCircuitIdentities(seed)
    .map((identity) => CIRCUIT_BY_LAYOUT.get(identity.layoutKey as TranslationKey))
    .filter((circuit): circuit is CityCircuit => Boolean(circuit));
  return circuits.length ? (circuits as [CityCircuit, ...CityCircuit[]]) : CITY_CIRCUITS;
}

export function circuitForRound(round: number, leagueId = "default", season = 1): CityCircuit {
  const circuits = circuitsForSeason(leagueId, season);
  return circuits[(Math.max(1, round) - 1) % circuits.length] ?? circuits[0];
}
