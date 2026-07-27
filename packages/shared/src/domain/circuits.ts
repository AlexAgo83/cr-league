import type { CircuitTrait, RaceInput, RaceSegment, RaceTrackSpeedProfile, RaceTrackZone, RaceTraits, Weather } from "./race.js";
import { RACE_SEGMENTS } from "./race.js";

export const CITY_CIRCUIT_IDENTITIES = [
  { city: "Paris", country: "FR", layoutKey: "circuit_docklands_sprint", laps: 7, trackLengthMeters: 2800, routeLengthMeters: 6796, mainStraightStartProgress: 0.170137, mainStraightEndProgress: 0.250962, startProgress: 0.241263, pitLaneProgress: 0.943422, traits: { grip: 64, overtaking: 72, energy: 58 }, likelyWeather: "light_rain" },
  { city: "Paris", country: "FR", layoutKey: "circuit_left_bank_loop", laps: 9, trackLengthMeters: 2300, routeLengthMeters: 5320, mainStraightStartProgress: 0.036893, mainStraightEndProgress: 0.270098, startProgress: 0.242113, pitLaneProgress: 0.836757, traits: { grip: 70, overtaking: 55, energy: 62 }, likelyWeather: "dry" },
  { city: "Amsterdam", country: "NL", layoutKey: "circuit_canal_loop", laps: 7, trackLengthMeters: 3100, routeLengthMeters: 6432, mainStraightStartProgress: 0.676507, mainStraightEndProgress: 0.840997, startProgress: 0.821258, pitLaneProgress: 0.884857, traits: { grip: 60, overtaking: 68, energy: 66 }, likelyWeather: "light_rain" },
  { city: "Amsterdam", country: "NL", layoutKey: "circuit_harbor_sprint", laps: 10, trackLengthMeters: 2100, routeLengthMeters: 4816, mainStraightStartProgress: 0.32183, mainStraightEndProgress: 0.552661, startProgress: 0.524962, pitLaneProgress: 0.838418, traits: { grip: 58, overtaking: 78, energy: 52 }, likelyWeather: "heavy_rain" },
  { city: "Berlin", country: "DE", layoutKey: "circuit_ring_sector", laps: 6, trackLengthMeters: 3600, routeLengthMeters: 7541, mainStraightStartProgress: 0.692274, mainStraightEndProgress: 0.836726, startProgress: 0.819392, pitLaneProgress: 0.898884, traits: { grip: 76, overtaking: 62, energy: 70 }, likelyWeather: "dry" },
  { city: "Berlin", country: "DE", layoutKey: "circuit_mitte_dash", laps: 5, trackLengthMeters: 3900, routeLengthMeters: 7522, mainStraightStartProgress: 0.260941, mainStraightEndProgress: 0.358161, startProgress: 0.346495, pitLaneProgress: 0.931945, traits: { grip: 68, overtaking: 74, energy: 60 }, likelyWeather: "dry" },
  { city: "Rome", country: "IT", layoutKey: "circuit_rome_tiber_loop", laps: 8, trackLengthMeters: 2600, routeLengthMeters: 6119, mainStraightStartProgress: 0.44991, mainStraightEndProgress: 0.655415, startProgress: 0.630755, pitLaneProgress: 0.856147, traits: { grip: 58, overtaking: 74, energy: 62 }, likelyWeather: "dry" },
  { city: "Lisbon", country: "PT", layoutKey: "circuit_lisbon_baixa_loop", laps: 9, trackLengthMeters: 2400, routeLengthMeters: 5537, mainStraightStartProgress: 0.679354, mainStraightEndProgress: 0.826144, startProgress: 0.808529, pitLaneProgress: 0.897247, traits: { grip: 54, overtaking: 78, energy: 57 }, likelyWeather: "dry" },
  { city: "Vienna", country: "AT", layoutKey: "circuit_vienna_ring_loop", laps: 5, trackLengthMeters: 4200, routeLengthMeters: 9820, mainStraightStartProgress: 0.13091, mainStraightEndProgress: 0.279342, startProgress: 0.26153, pitLaneProgress: 0.896097, traits: { grip: 70, overtaking: 66, energy: 72 }, likelyWeather: "light_rain" },
  { city: "Porto", country: "PT", layoutKey: "circuit_porto_boavista_loop", laps: 8, trackLengthMeters: 2700, routeLengthMeters: 5849, mainStraightStartProgress: 0.81717, mainStraightEndProgress: 0.965443, startProgress: 0.94765, pitLaneProgress: 0.896209, traits: { grip: 56, overtaking: 76, energy: 60 }, likelyWeather: "light_rain" },
  { city: "Madrid", country: "ES", layoutKey: "circuit_madrid_centro_loop", laps: 5, trackLengthMeters: 4000, routeLengthMeters: 8084, mainStraightStartProgress: 0.723627, mainStraightEndProgress: 0.882152, startProgress: 0.863129, pitLaneProgress: 0.889033, traits: { grip: 62, overtaking: 80, energy: 55 }, likelyWeather: "dry" },
  { city: "Monaco", country: "MC", layoutKey: "circuit_monaco_harbor_loop", laps: 8, trackLengthMeters: 5975, routeLengthMeters: 5975, mainStraightStartProgress: 0.894383, mainStraightEndProgress: 0.979826, startProgress: 0.969573, pitLaneProgress: 0.94019, traits: { grip: 82, overtaking: 48, energy: 58 }, likelyWeather: "dry" },
  { city: "Monaco", country: "MC", layoutKey: "circuit_monaco_casino_sprint", laps: 6, trackLengthMeters: 3300, routeLengthMeters: 8171, mainStraightStartProgress: 0.891164, mainStraightEndProgress: 0.93943, startProgress: 0.933638, pitLaneProgress: 0.966214, traits: { grip: 78, overtaking: 52, energy: 54 }, likelyWeather: "light_rain" },
  { city: "London", country: "GB", layoutKey: "circuit_london_thames_loop", laps: 7, trackLengthMeters: 3000, routeLengthMeters: 6902, mainStraightStartProgress: 0.011322, mainStraightEndProgress: 0.151985, startProgress: 0.135106, pitLaneProgress: 0.901535, traits: { grip: 66, overtaking: 64, energy: 61 }, likelyWeather: "light_rain" },
  { city: "Brussels", country: "BE", layoutKey: "circuit_brussels_grand_place_loop", laps: 3, trackLengthMeters: 6100, routeLengthMeters: 15394, mainStraightStartProgress: 0.836094, mainStraightEndProgress: 0.936105, startProgress: 0.924103, pitLaneProgress: 0.929992, traits: { grip: 63, overtaking: 67, energy: 59 }, likelyWeather: "light_rain" },
  { city: "Prague", country: "CZ", layoutKey: "circuit_prague_vltava_loop", laps: 7, trackLengthMeters: 2900, routeLengthMeters: 6089, mainStraightStartProgress: 0.192735, mainStraightEndProgress: 0.568766, startProgress: 0.523642, pitLaneProgress: 0.736778, traits: { grip: 68, overtaking: 60, energy: 64 }, likelyWeather: "dry" },
  { city: "Copenhagen", country: "DK", layoutKey: "circuit_copenhagen_harbor_loop", laps: 7, trackLengthMeters: 3050, routeLengthMeters: 5881, mainStraightStartProgress: 0.416737, mainStraightEndProgress: 0.76963, startProgress: 0.727282, pitLaneProgress: 0.752976, traits: { grip: 71, overtaking: 58, energy: 70 }, likelyWeather: "heavy_rain" },
  { city: "Stockholm", country: "SE", layoutKey: "circuit_stockholm_gamla_stan_loop", laps: 8, trackLengthMeters: 2550, routeLengthMeters: 5182, mainStraightStartProgress: 0.537846, mainStraightEndProgress: 0.640873, startProgress: 0.62851, pitLaneProgress: 0.927881, traits: { grip: 72, overtaking: 56, energy: 69 }, likelyWeather: "light_rain" },
  { city: "Cannes", country: "FR", layoutKey: "circuit_cannes_houssam_loop", laps: 8, trackLengthMeters: 5530, routeLengthMeters: 5535, mainStraightStartProgress: 0.103768, mainStraightEndProgress: 0.288298, startProgress: 0.266155, pitLaneProgress: 0.870829, traits: { grip: 70, overtaking: 76, energy: 57 }, likelyWeather: "dry" },
  { city: "Tokyo", country: "JP", layoutKey: "circuit_tokyo_bay_loop", laps: 9, trackLengthMeters: 5720, routeLengthMeters: 5715, mainStraightStartProgress: 0.603779, mainStraightEndProgress: 0.805249, startProgress: 0.781073, pitLaneProgress: 0.858971, traits: { grip: 72, overtaking: 70, energy: 58 }, likelyWeather: "light_rain" },
  { city: "Rio de Janeiro", country: "BR", layoutKey: "circuit_rio_flamengo_loop", laps: 8, trackLengthMeters: 5907, routeLengthMeters: 5907, mainStraightStartProgress: 0.472343, mainStraightEndProgress: 0.652043, startProgress: 0.630479, pitLaneProgress: 0.87421, traits: { grip: 63, overtaking: 76, energy: 55 }, likelyWeather: "dry" },
  { city: "Cape Town", country: "ZA", layoutKey: "circuit_cape_town_waterfront_loop", laps: 9, trackLengthMeters: 5373, routeLengthMeters: 5373, mainStraightStartProgress: 0.052208, mainStraightEndProgress: 0.235427, startProgress: 0.21344, pitLaneProgress: 0.871747, traits: { grip: 67, overtaking: 74, energy: 58 }, likelyWeather: "dry" },
  { city: "Seoul", country: "KR", layoutKey: "circuit_seoul_yeouido_loop", laps: 12, trackLengthMeters: 3976, routeLengthMeters: 3980, mainStraightStartProgress: 0.490638, mainStraightEndProgress: 0.823405, startProgress: 0.783473, pitLaneProgress: 0.767064, traits: { grip: 68, overtaking: 73, energy: 60 }, likelyWeather: "light_rain" },
  { city: "Montreal", country: "CA", layoutKey: "circuit_montreal_island_loop", laps: 12, trackLengthMeters: 4185, routeLengthMeters: 4190, mainStraightStartProgress: 0.013805, mainStraightEndProgress: 0.442123, startProgress: 0.390725, pitLaneProgress: 0.700178, traits: { grip: 72, overtaking: 82, energy: 61 }, likelyWeather: "light_rain" },
  { city: "Istanbul", country: "TR", layoutKey: "circuit_istanbul_bosphorus_loop", laps: 8, trackLengthMeters: 6075, routeLengthMeters: 6075, mainStraightStartProgress: 0.808564, mainStraightEndProgress: 0.994411, startProgress: 0.97211, pitLaneProgress: 0.869907, traits: { grip: 74, overtaking: 72, energy: 50 }, likelyWeather: "dry" },
  { city: "Budapest", country: "HU", layoutKey: "circuit_danube", laps: 8, trackLengthMeters: 6100, routeLengthMeters: 6100, mainStraightStartProgress: 0.661614, mainStraightEndProgress: 0.940384, startProgress: 0.906932, pitLaneProgress: 0.804861, traits: { grip: 69, overtaking: 66, energy: 67 }, likelyWeather: "light_rain" },
  { city: "Naples", country: "IT", layoutKey: "circuit_lungomare", laps: 8, trackLengthMeters: 6116, routeLengthMeters: 6116, mainStraightStartProgress: 0.809335, mainStraightEndProgress: 0.984499, startProgress: 0.963479, pitLaneProgress: 0.877385, traits: { grip: 60, overtaking: 77, energy: 56 }, likelyWeather: "dry" },
  { city: "Athens", country: "GR", layoutKey: "circuit_plaka", laps: 8, trackLengthMeters: 5969, routeLengthMeters: 5969, mainStraightStartProgress: 0.468924, mainStraightEndProgress: 0.486939, startProgress: 0.484777, pitLaneProgress: 0.98739, traits: { grip: 57, overtaking: 62, energy: 72 }, likelyWeather: "dry" },
  { city: "Helsinki", country: "FI", layoutKey: "circuit_esplanadi", laps: 8, trackLengthMeters: 6061, routeLengthMeters: 6061, mainStraightStartProgress: 0.564147, mainStraightEndProgress: 0.602834, startProgress: 0.598192, pitLaneProgress: 0.972919, traits: { grip: 73, overtaking: 61, energy: 68 }, likelyWeather: "light_rain" },
  { city: "Edinburgh", country: "GB", layoutKey: "circuit_royal_mile", laps: 8, trackLengthMeters: 6035, routeLengthMeters: 6035, mainStraightStartProgress: 0.912969, mainStraightEndProgress: 0.944625, startProgress: 0.940826, pitLaneProgress: 0.977841, traits: { grip: 66, overtaking: 58, energy: 74 }, likelyWeather: "light_rain" },
  { city: "Valletta", country: "MT", layoutKey: "circuit_grand_harbour", laps: 11, trackLengthMeters: 4521, routeLengthMeters: 4521, mainStraightStartProgress: 0.580598, mainStraightEndProgress: 0.61065, startProgress: 0.607044, pitLaneProgress: 0.978964, traits: { grip: 61, overtaking: 69, energy: 64 }, likelyWeather: "dry" },
  { city: "Amsterdam", country: "NL", layoutKey: "circuit_jordaan", laps: 9, trackLengthMeters: 5897, routeLengthMeters: 5897, mainStraightStartProgress: 0.676709, mainStraightEndProgress: 0.710406, startProgress: 0.706362, pitLaneProgress: 0.976412, traits: { grip: 59, overtaking: 67, energy: 66 }, likelyWeather: "light_rain" },
  { city: "New York", country: "US", layoutKey: "circuit_battery", laps: 11, trackLengthMeters: 4380, routeLengthMeters: 4380, mainStraightStartProgress: 0.310362, mainStraightEndProgress: 0.343757, startProgress: 0.33975, pitLaneProgress: 0.976623, traits: { grip: 65, overtaking: 78, energy: 57 }, likelyWeather: "dry" },
  { city: "Miami", country: "US", layoutKey: "circuit_ocean_drive", laps: 9, trackLengthMeters: 5725, routeLengthMeters: 5725, mainStraightStartProgress: 0.811006, mainStraightEndProgress: 0.849418, startProgress: 0.844809, pitLaneProgress: 0.973111, traits: { grip: 62, overtaking: 76, energy: 55 }, likelyWeather: "dry" },
  { city: "Chicago", country: "US", layoutKey: "circuit_lakefront", laps: 9, trackLengthMeters: 5781, routeLengthMeters: 5781, mainStraightStartProgress: 0.970992, mainStraightEndProgress: 0, startProgress: 0.996519, pitLaneProgress: 0.979694, traits: { grip: 67, overtaking: 72, energy: 61 }, likelyWeather: "light_rain" },
  { city: "Mexico City", country: "MX", layoutKey: "circuit_reforma", laps: 9, trackLengthMeters: 5635, routeLengthMeters: 5635, mainStraightStartProgress: 0.529517, mainStraightEndProgress: 0.56001, startProgress: 0.556351, pitLaneProgress: 0.978655, traits: { grip: 64, overtaking: 70, energy: 69 }, likelyWeather: "dry" },
  { city: "Dubai", country: "AE", layoutKey: "circuit_dubai_marina", laps: 6, trackLengthMeters: 8114, routeLengthMeters: 8114, mainStraightStartProgress: 0.149327, mainStraightEndProgress: 0.171133, startProgress: 0.168517, pitLaneProgress: 0.984735, traits: { grip: 70, overtaking: 76, energy: 53 }, likelyWeather: "dry" },
  { city: "Sydney", country: "AU", layoutKey: "circuit_darling_harbour", laps: 9, trackLengthMeters: 5694, routeLengthMeters: 5694, mainStraightStartProgress: 0.28903, mainStraightEndProgress: 0.312385, startProgress: 0.309582, pitLaneProgress: 0.983652, traits: { grip: 68, overtaking: 71, energy: 60 }, likelyWeather: "dry" },
  { city: "Singapore", country: "SG", layoutKey: "circuit_marina", laps: 10, trackLengthMeters: 5148, routeLengthMeters: 5148, mainStraightStartProgress: 0.384368, mainStraightEndProgress: 0.404193, startProgress: 0.401814, pitLaneProgress: 0.986122, traits: { grip: 71, overtaking: 68, energy: 62 }, likelyWeather: "heavy_rain" },
  { city: "Hong Kong", country: "HK", layoutKey: "circuit_victoria", laps: 9, trackLengthMeters: 5459, routeLengthMeters: 5459, mainStraightStartProgress: 0.59965, mainStraightEndProgress: 0.622789, startProgress: 0.620013, pitLaneProgress: 0.983802, traits: { grip: 64, overtaking: 66, energy: 70 }, likelyWeather: "light_rain" },
  { city: "Osaka", country: "JP", layoutKey: "circuit_dotonbori", laps: 10, trackLengthMeters: 5188, routeLengthMeters: 5188, mainStraightStartProgress: 0.304445, mainStraightEndProgress: 0.324283, startProgress: 0.321903, pitLaneProgress: 0.986113, traits: { grip: 67, overtaking: 69, energy: 65 }, likelyWeather: "light_rain" },
  { city: "Marseille", country: "FR", layoutKey: "circuit_vieux_port", laps: 8, trackLengthMeters: 6385, routeLengthMeters: 6385, mainStraightStartProgress: 0.86484, mainStraightEndProgress: 0.884484, startProgress: 0.882127, pitLaneProgress: 0.986249, traits: { grip: 63, overtaking: 74, energy: 57 }, likelyWeather: "dry" },
  { city: "San Francisco", country: "US", layoutKey: "circuit_embarcadero", laps: 11, trackLengthMeters: 4448, routeLengthMeters: 4448, mainStraightStartProgress: 0.481081, mainStraightEndProgress: 0.50241, startProgress: 0.49985, pitLaneProgress: 0.98507, traits: { grip: 66, overtaking: 72, energy: 59 }, likelyWeather: "dry" },
  { city: "Buenos Aires", country: "AR", layoutKey: "circuit_madero", laps: 11, trackLengthMeters: 4754, routeLengthMeters: 4754, mainStraightStartProgress: 0.05758, mainStraightEndProgress: 0.106235, startProgress: 0.100397, pitLaneProgress: 0.965941, traits: { grip: 62, overtaking: 75, energy: 58 }, likelyWeather: "dry" },
  { city: "Shanghai", country: "CN", layoutKey: "circuit_bund", laps: 10, trackLengthMeters: 5195, routeLengthMeters: 5195, mainStraightStartProgress: 0.927011, mainStraightEndProgress: 0.972098, startProgress: 0.966688, pitLaneProgress: 0.968439, traits: { grip: 68, overtaking: 69, energy: 63 }, likelyWeather: "light_rain" },
  { city: "Kyoto", country: "JP", layoutKey: "circuit_kyoto_neon_loop", laps: 9, trackLengthMeters: 5587, routeLengthMeters: 5587, mainStraightStartProgress: 0.163021, mainStraightEndProgress: 0.202031, startProgress: 0.19735, pitLaneProgress: 0.972693, traits: { grip: 66, overtaking: 63, energy: 70 }, likelyWeather: "light_rain" },
  { city: "Reykjavik", country: "IS", layoutKey: "circuit_reykjavik_harbor_sprint", laps: 11, trackLengthMeters: 4673, routeLengthMeters: 4673, mainStraightStartProgress: 0.157724, mainStraightEndProgress: 0.195723, startProgress: 0.191163, pitLaneProgress: 0.973401, traits: { grip: 58, overtaking: 72, energy: 64 }, likelyWeather: "heavy_rain" },
  { city: "Marrakech", country: "MA", layoutKey: "circuit_marrakech_heat_ring", laps: 9, trackLengthMeters: 5714, routeLengthMeters: 5714, mainStraightStartProgress: 0.870657, mainStraightEndProgress: 0.895265, startProgress: 0.892312, pitLaneProgress: 0.982775, traits: { grip: 66, overtaking: 54, energy: 26 }, likelyWeather: "dry" },
  { city: "Vancouver", country: "CA", layoutKey: "circuit_vancouver_rainway", laps: 9, trackLengthMeters: 5486, routeLengthMeters: 5486, mainStraightStartProgress: 0.625692, mainStraightEndProgress: 0.647435, startProgress: 0.644825, pitLaneProgress: 0.98478, traits: { grip: 63, overtaking: 74, energy: 61 }, likelyWeather: "heavy_rain" },
  { city: "Lisbon", country: "PT", layoutKey: "circuit_lisbon_tramline", laps: 10, trackLengthMeters: 4951, routeLengthMeters: 4951, mainStraightStartProgress: 0.605056, mainStraightEndProgress: 0.640868, startProgress: 0.636571, pitLaneProgress: 0.974931, traits: { grip: 72, overtaking: 60, energy: 64 }, likelyWeather: "dry" },
  { city: "Singapore", country: "SG", layoutKey: "circuit_singapore_dock_nights", laps: 9, trackLengthMeters: 5798, routeLengthMeters: 5798, mainStraightStartProgress: 0.762664, mainStraightEndProgress: 0.799831, startProgress: 0.795371, pitLaneProgress: 0.973983, traits: { grip: 69, overtaking: 64, energy: 74 }, likelyWeather: "heavy_rain" },
  { city: "Cape Town", country: "ZA", layoutKey: "circuit_cape_town_coast_run", laps: 9, trackLengthMeters: 5388, routeLengthMeters: 5388, mainStraightStartProgress: 0.931424, mainStraightEndProgress: 0.952026, startProgress: 0.949553, pitLaneProgress: 0.985579, traits: { grip: 65, overtaking: 76, energy: 57 }, likelyWeather: "dry" },
  { city: "Seoul", country: "KR", layoutKey: "circuit_seoul_overpass_gp", laps: 9, trackLengthMeters: 5412, routeLengthMeters: 5412, mainStraightStartProgress: 0.274123, mainStraightEndProgress: 0.316656, startProgress: 0.311552, pitLaneProgress: 0.970227, traits: { grip: 64, overtaking: 78, energy: 58 }, likelyWeather: "light_rain" },
  { city: "Buenos Aires", country: "AR", layoutKey: "circuit_buenos_aires_park", laps: 9, trackLengthMeters: 5508, routeLengthMeters: 5508, mainStraightStartProgress: 0.603849, mainStraightEndProgress: 0.637149, startProgress: 0.633153, pitLaneProgress: 0.97669, traits: { grip: 66, overtaking: 70, energy: 60 }, likelyWeather: "dry" },
  { city: "Helsinki", country: "FI", layoutKey: "circuit_helsinki_icebreak", laps: 10, trackLengthMeters: 5093, routeLengthMeters: 5093, mainStraightStartProgress: 0.434171, mainStraightEndProgress: 0.457602, startProgress: 0.45479, pitLaneProgress: 0.983598, traits: { grip: 68, overtaking: 58, energy: 62 }, likelyWeather: "light_rain" },
  { city: "Bastia", country: "FR", layoutKey: "circuit_bastia_citadel_loop", laps: 11, trackLengthMeters: 4773, routeLengthMeters: 4773, mainStraightStartProgress: 0.721362, mainStraightEndProgress: 0.74647, startProgress: 0.743457, pitLaneProgress: 0.982425, traits: { grip: 70, overtaking: 60, energy: 66 }, likelyWeather: "dry" }
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
  routeLengthMeters: number;
  mainStraightStartProgress: number;
  mainStraightEndProgress: number;
  startProgress: number;
  pitLaneProgress: number;
  traits: RaceTraits;
  likelyWeather: Weather;
};

export type CityCircuitIdentity = (typeof CITY_CIRCUIT_IDENTITIES)[number];

export type TrackZone = RaceTrackZone;
export type TrackSpeedProfile = RaceTrackSpeedProfile;

import { CIRCUIT_SPEED_PROFILES } from "./circuitSpeedProfiles.data.js";
export { CIRCUIT_SPEED_PROFILES };

export function circuitSeasonSeed(leagueId: string, season: number) {
  return `${leagueId}:season:${Math.max(1, season)}`;
}

export function seasonCircuitIdentities(seed = "default") {
  if (seed === "default") return [...CITY_CIRCUIT_IDENTITIES];
  const circuits = [...CITY_CIRCUIT_IDENTITIES];
  let state = hashCircuitSeed(seed);
  for (let index = circuits.length - 1; index > 0; index -= 1) {
    state = nextCircuitShuffleState(state);
    const swapIndex = Math.floor(state / 65536) % (index + 1);
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

export function trackZonesForCircuit(circuit: Pick<CityCircuitIdentitySource, "mainStraightStartProgress" | "mainStraightEndProgress" | "pitLaneProgress" | "traits">): TrackZone[] {
  const sectorZones = RACE_SEGMENTS.map((segment, index) => ({
    kind: "sector" as const,
    label: `sector_${segment}`,
    segment,
    startProgress: roundProgress(index / RACE_SEGMENTS.length),
    endProgress: roundProgress((index + 1) / RACE_SEGMENTS.length)
  }));
  const technicalProgress = circuit.traits.grip >= 70 ? 0.62 : 0.42;
  return [
    ...sectorZones,
    {
      kind: "overtake",
      label: "main_straight",
      startProgress: roundProgress(circuit.mainStraightStartProgress),
      endProgress: roundProgress(circuit.mainStraightEndProgress),
      weight: circuit.traits.overtaking
    },
    {
      kind: "pit",
      label: "pit_lane",
      startProgress: offsetProgress(circuit.pitLaneProgress, -0.035),
      endProgress: offsetProgress(circuit.pitLaneProgress, 0.035)
    },
    {
      kind: "technical",
      label: "technical_sector",
      startProgress: offsetProgress(technicalProgress, -0.08),
      endProgress: offsetProgress(technicalProgress, 0.08),
      weight: circuit.traits.grip
    }
  ];
}

export function trackSpeedProfileForCircuit(circuit: Pick<CityCircuitIdentitySource, "layoutKey">): TrackSpeedProfile {
  const profiles = CIRCUIT_SPEED_PROFILES as Record<string, TrackSpeedProfile>;
  return profiles[circuit.layoutKey] ?? [];
}

export function progressRangeForRaceSegment(segment: RaceSegment): Pick<TrackZone, "startProgress" | "endProgress"> {
  return zoneForRaceSegment(segment);
}

export function zoneForRaceSegment(segment: RaceSegment): TrackZone {
  const index = Math.max(0, RACE_SEGMENTS.indexOf(segment));
  return {
    kind: "sector",
    label: `sector_${segment}`,
    segment,
    startProgress: roundProgress(index / RACE_SEGMENTS.length),
    endProgress: roundProgress((index + 1) / RACE_SEGMENTS.length)
  };
}

export function zonesAtProgress(zones: readonly TrackZone[], progress: number, kind?: TrackZone["kind"]) {
  const value = roundProgress(progress);
  return zones.filter((zone) => (!kind || zone.kind === kind) && progressInZone(value, zone));
}

export function pitWindowForCircuit(circuit: Pick<CityCircuitIdentitySource, "pitLaneProgress" | "mainStraightStartProgress" | "mainStraightEndProgress" | "traits">) {
  return trackZonesForCircuit(circuit).find((zone) => zone.kind === "pit")!;
}

function progressInZone(progress: number, zone: Pick<TrackZone, "startProgress" | "endProgress">) {
  return zone.startProgress <= zone.endProgress
    ? progress >= zone.startProgress && progress <= zone.endProgress
    : progress >= zone.startProgress || progress <= zone.endProgress;
}

function offsetProgress(progress: number, offset: number) {
  return roundProgress(progress + offset);
}

function roundProgress(progress: number) {
  return Number((((progress % 1) + 1) % 1).toFixed(6));
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
