import type { CircuitTrait, RaceInput, RaceTraits, Weather } from "./race.js";

export const CITY_CIRCUIT_IDENTITIES = [
  { city: "Paris", country: "FR", layoutKey: "circuit_docklands_sprint", laps: 7, trackLengthMeters: 2800, traits: { grip: 64, overtaking: 72, energy: 58 }, likelyWeather: "light_rain" },
  { city: "Paris", country: "FR", layoutKey: "circuit_left_bank_loop", laps: 9, trackLengthMeters: 2300, traits: { grip: 70, overtaking: 55, energy: 62 }, likelyWeather: "dry" },
  { city: "Amsterdam", country: "NL", layoutKey: "circuit_canal_loop", laps: 7, trackLengthMeters: 3100, traits: { grip: 60, overtaking: 68, energy: 66 }, likelyWeather: "light_rain" },
  { city: "Amsterdam", country: "NL", layoutKey: "circuit_harbor_sprint", laps: 10, trackLengthMeters: 2100, traits: { grip: 58, overtaking: 78, energy: 52 }, likelyWeather: "heavy_rain" },
  { city: "Berlin", country: "DE", layoutKey: "circuit_ring_sector", laps: 6, trackLengthMeters: 3600, traits: { grip: 76, overtaking: 62, energy: 70 }, likelyWeather: "dry" },
  { city: "Berlin", country: "DE", layoutKey: "circuit_mitte_dash", laps: 5, trackLengthMeters: 3900, traits: { grip: 68, overtaking: 74, energy: 60 }, likelyWeather: "dry" },
  { city: "Rome", country: "IT", layoutKey: "circuit_rome_tiber_loop", laps: 8, trackLengthMeters: 2600, traits: { grip: 58, overtaking: 74, energy: 62 }, likelyWeather: "dry" },
  { city: "Lisbon", country: "PT", layoutKey: "circuit_lisbon_baixa_loop", laps: 9, trackLengthMeters: 2400, traits: { grip: 54, overtaking: 78, energy: 57 }, likelyWeather: "dry" },
  { city: "Vienna", country: "AT", layoutKey: "circuit_vienna_ring_loop", laps: 5, trackLengthMeters: 4200, traits: { grip: 70, overtaking: 66, energy: 72 }, likelyWeather: "light_rain" },
  { city: "Porto", country: "PT", layoutKey: "circuit_porto_boavista_loop", laps: 8, trackLengthMeters: 2700, traits: { grip: 56, overtaking: 76, energy: 60 }, likelyWeather: "light_rain" },
  { city: "Madrid", country: "ES", layoutKey: "circuit_madrid_centro_loop", laps: 5, trackLengthMeters: 4000, traits: { grip: 62, overtaking: 80, energy: 55 }, likelyWeather: "dry" },
  { city: "Monaco", country: "MC", layoutKey: "circuit_monaco_harbor_loop", laps: 8, trackLengthMeters: 5975, traits: { grip: 82, overtaking: 48, energy: 58 }, likelyWeather: "dry" },
  { city: "Monaco", country: "MC", layoutKey: "circuit_monaco_casino_sprint", laps: 6, trackLengthMeters: 3300, traits: { grip: 78, overtaking: 52, energy: 54 }, likelyWeather: "light_rain" },
  { city: "London", country: "GB", layoutKey: "circuit_london_thames_loop", laps: 7, trackLengthMeters: 3000, traits: { grip: 66, overtaking: 64, energy: 61 }, likelyWeather: "light_rain" },
  { city: "Brussels", country: "BE", layoutKey: "circuit_brussels_grand_place_loop", laps: 3, trackLengthMeters: 6100, traits: { grip: 63, overtaking: 67, energy: 59 }, likelyWeather: "light_rain" },
  { city: "Prague", country: "CZ", layoutKey: "circuit_prague_vltava_loop", laps: 7, trackLengthMeters: 2900, traits: { grip: 68, overtaking: 60, energy: 64 }, likelyWeather: "dry" },
  { city: "Copenhagen", country: "DK", layoutKey: "circuit_copenhagen_harbor_loop", laps: 7, trackLengthMeters: 3050, traits: { grip: 71, overtaking: 58, energy: 70 }, likelyWeather: "heavy_rain" },
  { city: "Stockholm", country: "SE", layoutKey: "circuit_stockholm_gamla_stan_loop", laps: 8, trackLengthMeters: 2550, traits: { grip: 72, overtaking: 56, energy: 69 }, likelyWeather: "light_rain" },
  { city: "Cannes", country: "FR", layoutKey: "circuit_cannes_houssam_loop", laps: 8, trackLengthMeters: 5530, traits: { grip: 70, overtaking: 76, energy: 57 }, likelyWeather: "dry" },
  { city: "Tokyo", country: "JP", layoutKey: "circuit_tokyo_bay_loop", laps: 9, trackLengthMeters: 5720, traits: { grip: 72, overtaking: 70, energy: 58 }, likelyWeather: "light_rain" },
  { city: "Rio de Janeiro", country: "BR", layoutKey: "circuit_rio_flamengo_loop", laps: 8, trackLengthMeters: 5907, traits: { grip: 63, overtaking: 76, energy: 55 }, likelyWeather: "dry" },
  { city: "Cape Town", country: "ZA", layoutKey: "circuit_cape_town_waterfront_loop", laps: 9, trackLengthMeters: 5373, traits: { grip: 67, overtaking: 74, energy: 58 }, likelyWeather: "dry" },
  { city: "Seoul", country: "KR", layoutKey: "circuit_seoul_yeouido_loop", laps: 12, trackLengthMeters: 3976, traits: { grip: 68, overtaking: 73, energy: 60 }, likelyWeather: "light_rain" },
  { city: "Montreal", country: "CA", layoutKey: "circuit_montreal_island_loop", laps: 12, trackLengthMeters: 4185, traits: { grip: 72, overtaking: 82, energy: 61 }, likelyWeather: "light_rain" },
  { city: "Istanbul", country: "TR", layoutKey: "circuit_istanbul_bosphorus_loop", laps: 8, trackLengthMeters: 6075, traits: { grip: 74, overtaking: 72, energy: 50 }, likelyWeather: "dry" }
] as const satisfies readonly [
  CityCircuitIdentitySource,
  ...CityCircuitIdentitySource[]
];

type CityCircuitIdentitySource = {
  city: string;
  country: string;
  layoutKey: string;
  laps: number;
  trackLengthMeters: number;
  traits: RaceTraits;
  likelyWeather: Weather;
};

export type CityCircuitIdentity = (typeof CITY_CIRCUIT_IDENTITIES)[number];

export function circuitSeasonSeed(leagueId: string, season: number) {
  return `${leagueId}:season:${Math.max(1, season)}`;
}

export function seasonCircuitIdentities(seed = "default") {
  if (seed === "default") return [...CITY_CIRCUIT_IDENTITIES];
  const circuits = [...CITY_CIRCUIT_IDENTITIES];
  let state = hashCircuitSeed(seed);
  for (let index = circuits.length - 1; index > 0; index -= 1) {
    state = nextCircuitShuffleState(state);
    const swapIndex = state % (index + 1);
    [circuits[index], circuits[swapIndex]] = [circuits[swapIndex]!, circuits[index]!];
  }
  return circuits;
}

export function circuitIdentityForRound(round: number, seasonSeed = "default") {
  const circuits = seasonCircuitIdentities(seasonSeed);
  return circuits[(Math.max(1, round) - 1) % circuits.length]!;
}

export function raceInputFromCircuit(circuit: CityCircuitIdentity): Pick<RaceInput, "primaryTrait" | "secondaryTrait" | "trackLengthMeters" | "forecast"> {
  const [primaryTrait, secondaryTrait] = rankedCircuitTraits(circuit);
  return {
    primaryTrait,
    secondaryTrait,
    trackLengthMeters: circuit.trackLengthMeters,
    forecast: forecastFromLikelyWeather(circuit.likelyWeather)
  };
}

function rankedCircuitTraits(circuit: CityCircuitIdentity): [CircuitTrait, CircuitTrait] {
  const candidates: Array<{ trait: CircuitTrait; score: number }> = [
    { trait: "fast", score: circuit.traits.overtaking },
    { trait: "technical", score: circuit.traits.grip },
    { trait: "urban", score: Math.round((circuit.traits.overtaking + circuit.traits.grip) / 2) },
    { trait: "high_wear", score: 100 - circuit.traits.energy },
    { trait: "weather_sensitive", score: circuit.likelyWeather === "dry" ? 0 : 82 }
  ];
  const ranked = candidates.sort((left, right) => right.score - left.score || left.trait.localeCompare(right.trait));
  return [ranked[0]!.trait, ranked[1]!.trait];
}

function forecastFromLikelyWeather(weather: Weather): RaceInput["forecast"] {
  if (weather === "heavy_rain") return { dry: 20, light_rain: 30, heavy_rain: 50 };
  if (weather === "light_rain") return { dry: 35, light_rain: 50, heavy_rain: 15 };
  return { dry: 70, light_rain: 20, heavy_rain: 10 };
}

function hashCircuitSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function nextCircuitShuffleState(state: number) {
  return (Math.imul(state, 1664525) + 1013904223) >>> 0;
}
