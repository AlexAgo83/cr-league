import type { CircuitTrait, RaceInput, RaceTraits, Weather } from "./race.js";

export const CITY_CIRCUIT_IDENTITIES = [
  { city: "Paris", country: "FR", layoutKey: "circuit_docklands_sprint", laps: 7, traits: { grip: 64, overtaking: 72, energy: 58 }, likelyWeather: "light_rain" },
  { city: "Paris", country: "FR", layoutKey: "circuit_left_bank_loop", laps: 9, traits: { grip: 70, overtaking: 55, energy: 62 }, likelyWeather: "dry" },
  { city: "Amsterdam", country: "NL", layoutKey: "circuit_canal_loop", laps: 5, traits: { grip: 60, overtaking: 68, energy: 66 }, likelyWeather: "light_rain" },
  { city: "Amsterdam", country: "NL", layoutKey: "circuit_harbor_sprint", laps: 10, traits: { grip: 58, overtaking: 78, energy: 52 }, likelyWeather: "heavy_rain" },
  { city: "Berlin", country: "DE", layoutKey: "circuit_ring_sector", laps: 6, traits: { grip: 76, overtaking: 62, energy: 70 }, likelyWeather: "dry" },
  { city: "Berlin", country: "DE", layoutKey: "circuit_mitte_dash", laps: 5, traits: { grip: 68, overtaking: 74, energy: 60 }, likelyWeather: "dry" },
  { city: "Rome", country: "IT", layoutKey: "circuit_rome_tiber_loop", laps: 8, traits: { grip: 58, overtaking: 74, energy: 62 }, likelyWeather: "dry" },
  { city: "Lisbon", country: "PT", layoutKey: "circuit_lisbon_baixa_loop", laps: 9, traits: { grip: 54, overtaking: 78, energy: 57 }, likelyWeather: "dry" },
  { city: "Vienna", country: "AT", layoutKey: "circuit_vienna_ring_loop", laps: 5, traits: { grip: 70, overtaking: 66, energy: 72 }, likelyWeather: "light_rain" },
  { city: "Porto", country: "PT", layoutKey: "circuit_porto_boavista_loop", laps: 8, traits: { grip: 56, overtaking: 76, energy: 60 }, likelyWeather: "light_rain" },
  { city: "Madrid", country: "ES", layoutKey: "circuit_madrid_centro_loop", laps: 5, traits: { grip: 62, overtaking: 80, energy: 55 }, likelyWeather: "dry" },
  { city: "Monaco", country: "MC", layoutKey: "circuit_monaco_harbor_loop", laps: 18, traits: { grip: 82, overtaking: 48, energy: 58 }, likelyWeather: "dry" },
  { city: "Monaco", country: "MC", layoutKey: "circuit_monaco_casino_sprint", laps: 21, traits: { grip: 78, overtaking: 52, energy: 54 }, likelyWeather: "light_rain" }
] as const satisfies readonly [
  CityCircuitIdentitySource,
  ...CityCircuitIdentitySource[]
];

type CityCircuitIdentitySource = {
  city: string;
  country: string;
  layoutKey: string;
  laps: number;
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

export function raceInputFromCircuit(circuit: CityCircuitIdentity): Pick<RaceInput, "primaryTrait" | "secondaryTrait" | "forecast"> {
  const [primaryTrait, secondaryTrait] = rankedCircuitTraits(circuit);
  return {
    primaryTrait,
    secondaryTrait,
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
