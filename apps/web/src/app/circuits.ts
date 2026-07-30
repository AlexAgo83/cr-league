import { CITY_CIRCUIT_IDENTITIES, circuitSeasonSeed, seasonCircuitIdentities, trackSpeedProfileForCircuit, trackZonesForCircuit, type TrackSpeedProfile, type TrackZone } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";

import { circuitRouteFor } from "./circuitRoutes/index.js";

export type CityCircuit = {
  city: string;
  country: string;
  layoutKey: TranslationKey;
  laps: number;
  trackLengthMeters: number;
  routeLengthMeters: number;
  mainStraightStartProgress: number;
  mainStraightEndProgress: number;
  startProgress: number;
  pitLaneProgress: number;
  trackZones: TrackZone[];
  speedProfile: TrackSpeedProfile;
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
  trackZones: trackZonesForCircuit(identity),
  speedProfile: trackSpeedProfileForCircuit(identity),
  route: circuitRouteFor(identity.layoutKey)
})) as [CityCircuit, ...CityCircuit[]];

const CIRCUIT_BY_LAYOUT = new Map(CITY_CIRCUITS.map((circuit) => [circuit.layoutKey, circuit]));

export type CircuitRegion = "europe" | "americas" | "asia" | "africa" | "oceania";
export const REGION_ORDER: CircuitRegion[] = ["europe", "americas", "asia", "africa", "oceania"];
// ponytail: flat ISO2 -> region map covers current + planned circuit countries; unknown codes simply won't match a region filter.
export const COUNTRY_REGION: Record<string, CircuitRegion> = {
  FR: "europe", NL: "europe", DE: "europe", IT: "europe", PT: "europe", ES: "europe", AT: "europe", MC: "europe", GB: "europe",
  BE: "europe", CZ: "europe", DK: "europe", SE: "europe", TR: "europe", GR: "europe", HU: "europe", FI: "europe", MT: "europe", IS: "europe",
  US: "americas", CA: "americas", BR: "americas", AR: "americas", MX: "americas",
  JP: "asia", KR: "asia", SG: "asia", HK: "asia", CN: "asia", AE: "asia",
  ZA: "africa", MA: "africa", EG: "africa", KE: "africa", RW: "africa", SN: "africa", TN: "africa", GH: "africa", ET: "africa", NG: "africa", MZ: "africa",
  AU: "oceania", NZ: "oceania"
};

/** "all" is a region choice like any other, so callers never special-case it. */
export function circuitsInRegion(region: "all" | CircuitRegion, circuits: readonly CityCircuit[] = CITY_CIRCUITS) {
  return region === "all" ? circuits : circuits.filter((circuit) => COUNTRY_REGION[circuit.country] === region);
}

export function regionsWithCircuits(circuits: readonly CityCircuit[] = CITY_CIRCUITS) {
  return REGION_ORDER.filter((region) => circuitsInRegion(region, circuits).length > 0);
}

// ponytail: returns a fresh circuit with the current cached route snapshot. A new object reference on
// each call is deliberate: consumers memoize on [circuit], so once the lazy route cache fills and the
// tree re-renders, the new reference makes their circuitScene/route memos recompute with the polyline.
export function withRoute(circuit: CityCircuit): CityCircuit {
  return { ...circuit, route: circuitRouteFor(circuit.layoutKey) };
}

export function circuitsForSeason(leagueId = "default", season = 1): [CityCircuit, ...CityCircuit[]] {
  const seed = leagueId === "default" ? "default" : circuitSeasonSeed(leagueId, season);
  const circuits = seasonCircuitIdentities(seed)
    .map((identity) => CIRCUIT_BY_LAYOUT.get(identity.layoutKey as TranslationKey))
    .filter((circuit): circuit is CityCircuit => Boolean(circuit));
  const resolved = circuits.length ? circuits : CITY_CIRCUITS;
  return resolved.map(withRoute) as [CityCircuit, ...CityCircuit[]];
}

export function circuitForRound(round: number, leagueId = "default", season = 1): CityCircuit {
  const circuits = circuitsForSeason(leagueId, season);
  return circuits[(Math.max(1, round) - 1) % circuits.length] ?? circuits[0];
}

export function circuitDistanceLabel(circuit: Pick<CityCircuit, "trackLengthMeters">) {
  return `${(circuit.trackLengthMeters / 1000).toFixed(1)} km`;
}
