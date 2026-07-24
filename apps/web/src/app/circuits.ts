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
