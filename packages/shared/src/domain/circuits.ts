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
  { city: "Istanbul", country: "TR", layoutKey: "circuit_istanbul_bosphorus_loop", laps: 8, trackLengthMeters: 6075, routeLengthMeters: 6075, mainStraightStartProgress: 0.808564, mainStraightEndProgress: 0.994411, startProgress: 0.97211, pitLaneProgress: 0.869907, traits: { grip: 74, overtaking: 72, energy: 50 }, likelyWeather: "dry" }
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

export const CIRCUIT_SPEED_PROFILES = {
  "circuit_docklands_sprint": [
    { kind: "braking", startProgress: 0.060903, endProgress: 0.07824, factor: 0.91 },
    { kind: "braking", startProgress: 0.073954, endProgress: 0.099014, factor: 0.81 },
    { kind: "corner", startProgress: 0.07624, endProgress: 0.105743, factor: 0.84 },
    { kind: "corner", startProgress: 0.097014, endProgress: 0.132309, factor: 0.68 },
    { kind: "exit", startProgress: 0.105743, endProgress: 0.123412, factor: 1.04 },
    { kind: "exit", startProgress: 0.132309, endProgress: 0.153839, factor: 1 },
    { kind: "straight", startProgress: 0.170137, endProgress: 0.250962, factor: 1.08 },
    { kind: "braking", startProgress: 0.452275, endProgress: 0.46613, factor: 0.95 },
    { kind: "corner", startProgress: 0.46413, endProgress: 0.491021, factor: 0.92 },
    { kind: "exit", startProgress: 0.491021, endProgress: 0.506948, factor: 1.05 },
    { kind: "braking", startProgress: 0.71643, endProgress: 0.74243, factor: 0.8 },
    { kind: "corner", startProgress: 0.74043, endProgress: 0.77643, factor: 0.66 },
    { kind: "braking", startProgress: 0.767499, endProgress: 0.791321, factor: 0.83 },
    { kind: "exit", startProgress: 0.77643, endProgress: 0.79843, factor: 1 },
    { kind: "corner", startProgress: 0.789321, endProgress: 0.823688, factor: 0.71 },
    { kind: "braking", startProgress: 0.821536, endProgress: 0.845537, factor: 0.82 },
    { kind: "exit", startProgress: 0.823688, endProgress: 0.844599, factor: 1.01 },
    { kind: "corner", startProgress: 0.843537, endProgress: 0.878038, factor: 0.7 },
    { kind: "exit", startProgress: 0.878038, endProgress: 0.899038, factor: 1.01 },
    { kind: "braking", startProgress: 0.898858, endProgress: 0.924858, factor: 0.8 },
    { kind: "corner", startProgress: 0.922858, endProgress: 0.958858, factor: 0.66 },
    { kind: "exit", startProgress: 0.958858, endProgress: 0.980858, factor: 1 }
  ],
  "circuit_left_bank_loop": [
    { kind: "braking", startProgress: 0.001099, endProgress: 0.023964, factor: 0.84 },
    { kind: "corner", startProgress: 0.021964, endProgress: 0.055613, factor: 0.73 },
    { kind: "straight", startProgress: 0.036893, endProgress: 0.270098, factor: 1.08 },
    { kind: "exit", startProgress: 0.055613, endProgress: 0.076045, factor: 1.01 },
    { kind: "braking", startProgress: 0.115037, endProgress: 0.137419, factor: 0.85 },
    { kind: "corner", startProgress: 0.135419, endProgress: 0.168705, factor: 0.74 },
    { kind: "exit", startProgress: 0.168705, endProgress: 0.188896, factor: 1.02 },
    { kind: "braking", startProgress: 0.236331, endProgress: 0.254265, factor: 0.9 },
    { kind: "corner", startProgress: 0.252265, endProgress: 0.282215, factor: 0.83 },
    { kind: "braking", startProgress: 0.270619, endProgress: 0.296619, factor: 0.8 },
    { kind: "exit", startProgress: 0.282215, endProgress: 0.300182, factor: 1.04 },
    { kind: "corner", startProgress: 0.294619, endProgress: 0.330619, factor: 0.66 },
    { kind: "exit", startProgress: 0.330619, endProgress: 0.352619, factor: 1 },
    { kind: "braking", startProgress: 0.40109, endProgress: 0.425276, factor: 0.82 },
    { kind: "corner", startProgress: 0.423276, endProgress: 0.457915, factor: 0.7 },
    { kind: "braking", startProgress: 0.451223, endProgress: 0.477223, factor: 0.8 },
    { kind: "exit", startProgress: 0.457915, endProgress: 0.479008, factor: 1.01 },
    { kind: "corner", startProgress: 0.475223, endProgress: 0.511223, factor: 0.66 },
    { kind: "exit", startProgress: 0.511223, endProgress: 0.533223, factor: 1 },
    { kind: "braking", startProgress: 0.6186, endProgress: 0.6446, factor: 0.8 },
    { kind: "corner", startProgress: 0.6426, endProgress: 0.6786, factor: 0.66 },
    { kind: "exit", startProgress: 0.6786, endProgress: 0.7006, factor: 1 }
  ],
  "circuit_canal_loop": [
    { kind: "braking", startProgress: 0.078325, endProgress: 0.094057, factor: 0.93 },
    { kind: "corner", startProgress: 0.092057, endProgress: 0.120356, factor: 0.88 },
    { kind: "exit", startProgress: 0.120356, endProgress: 0.137222, factor: 1.04 },
    { kind: "braking", startProgress: 0.352547, endProgress: 0.375766, factor: 0.83 },
    { kind: "corner", startProgress: 0.373766, endProgress: 0.40768, factor: 0.72 },
    { kind: "braking", startProgress: 0.384675, endProgress: 0.407954, factor: 0.83 },
    { kind: "braking", startProgress: 0.403526, endProgress: 0.428115, factor: 0.82 },
    { kind: "corner", startProgress: 0.405954, endProgress: 0.439913, factor: 0.72 },
    { kind: "exit", startProgress: 0.40768, endProgress: 0.42829, factor: 1.01 },
    { kind: "corner", startProgress: 0.426115, endProgress: 0.461057, factor: 0.69 },
    { kind: "exit", startProgress: 0.439913, endProgress: 0.460553, factor: 1.01 },
    { kind: "exit", startProgress: 0.461057, endProgress: 0.482352, factor: 1.01 },
    { kind: "braking", startProgress: 0.559459, endProgress: 0.581794, factor: 0.85 },
    { kind: "braking", startProgress: 0.569964, endProgress: 0.593273, factor: 0.83 },
    { kind: "corner", startProgress: 0.579794, endProgress: 0.613046, factor: 0.74 },
    { kind: "corner", startProgress: 0.591273, endProgress: 0.625255, factor: 0.72 },
    { kind: "exit", startProgress: 0.613046, endProgress: 0.633213, factor: 1.02 },
    { kind: "exit", startProgress: 0.625255, endProgress: 0.645909, factor: 1.01 },
    { kind: "braking", startProgress: 0.65479, endProgress: 0.675051, factor: 0.87 },
    { kind: "corner", startProgress: 0.673051, endProgress: 0.704747, factor: 0.78 },
    { kind: "straight", startProgress: 0.676507, endProgress: 0.840997, factor: 1.08 },
    { kind: "exit", startProgress: 0.704747, endProgress: 0.723877, factor: 1.03 }
  ],
  "circuit_harbor_sprint": [
    { kind: "braking", startProgress: 0.062909, endProgress: 0.087621, factor: 0.82 },
    { kind: "corner", startProgress: 0.085621, endProgress: 0.120655, factor: 0.69 },
    { kind: "exit", startProgress: 0.120655, endProgress: 0.142011, factor: 1.01 },
    { kind: "braking", startProgress: 0.318678, endProgress: 0.341504, factor: 0.84 },
    { kind: "straight", startProgress: 0.32183, endProgress: 0.552661, factor: 1.08 },
    { kind: "corner", startProgress: 0.339504, endProgress: 0.373124, factor: 0.73 },
    { kind: "exit", startProgress: 0.373124, endProgress: 0.393537, factor: 1.01 },
    { kind: "braking", startProgress: 0.41192, endProgress: 0.432712, factor: 0.87 },
    { kind: "corner", startProgress: 0.430712, endProgress: 0.462806, factor: 0.77 },
    { kind: "exit", startProgress: 0.462806, endProgress: 0.482202, factor: 1.02 }
  ],
  "circuit_ring_sector": [
    { kind: "braking", startProgress: 0.606813, endProgress: 0.627315, factor: 0.87 },
    { kind: "corner", startProgress: 0.625315, endProgress: 0.657192, factor: 0.78 },
    { kind: "exit", startProgress: 0.657192, endProgress: 0.676443, factor: 1.02 },
    { kind: "straight", startProgress: 0.692274, endProgress: 0.836726, factor: 1.08 },
    { kind: "braking", startProgress: 0.726674, endProgress: 0.748591, factor: 0.85 },
    { kind: "corner", startProgress: 0.746591, endProgress: 0.779529, factor: 0.75 },
    { kind: "exit", startProgress: 0.779529, endProgress: 0.799487, factor: 1.02 },
    { kind: "braking", startProgress: 0.782783, endProgress: 0.806096, factor: 0.83 },
    { kind: "corner", startProgress: 0.804096, endProgress: 0.838081, factor: 0.72 },
    { kind: "exit", startProgress: 0.838081, endProgress: 0.858737, factor: 1.01 }
  ],
  "circuit_mitte_dash": [
    { kind: "braking", startProgress: 0.091779, endProgress: 0.117779, factor: 0.8 },
    { kind: "corner", startProgress: 0.115779, endProgress: 0.151779, factor: 0.66 },
    { kind: "braking", startProgress: 0.142179, endProgress: 0.168179, factor: 0.8 },
    { kind: "exit", startProgress: 0.151779, endProgress: 0.173779, factor: 1 },
    { kind: "corner", startProgress: 0.166179, endProgress: 0.202179, factor: 0.66 },
    { kind: "exit", startProgress: 0.202179, endProgress: 0.224179, factor: 1 },
    { kind: "straight", startProgress: 0.260941, endProgress: 0.358161, factor: 1.08 },
    { kind: "braking", startProgress: 0.318131, endProgress: 0.344131, factor: 0.8 },
    { kind: "corner", startProgress: 0.342131, endProgress: 0.378131, factor: 0.66 },
    { kind: "exit", startProgress: 0.378131, endProgress: 0.400131, factor: 1 },
    { kind: "braking", startProgress: 0.424358, endProgress: 0.44971, factor: 0.81 },
    { kind: "corner", startProgress: 0.44771, endProgress: 0.483224, factor: 0.67 },
    { kind: "braking", startProgress: 0.448448, endProgress: 0.47045, factor: 0.85 },
    { kind: "corner", startProgress: 0.46845, endProgress: 0.501451, factor: 0.74 },
    { kind: "exit", startProgress: 0.483224, endProgress: 0.5049, factor: 1 },
    { kind: "exit", startProgress: 0.501451, endProgress: 0.521452, factor: 1.02 },
    { kind: "braking", startProgress: 0.572871, endProgress: 0.596381, factor: 0.83 },
    { kind: "corner", startProgress: 0.594381, endProgress: 0.628513, factor: 0.71 },
    { kind: "braking", startProgress: 0.622443, endProgress: 0.64358, factor: 0.86 },
    { kind: "exit", startProgress: 0.628513, endProgress: 0.649268, factor: 1.01 },
    { kind: "corner", startProgress: 0.64158, endProgress: 0.673933, factor: 0.76 },
    { kind: "exit", startProgress: 0.673933, endProgress: 0.693501, factor: 1.02 }
  ],
  "circuit_rome_tiber_loop": [
    { kind: "braking", startProgress: 0.063424, endProgress: 0.089424, factor: 0.8 },
    { kind: "corner", startProgress: 0.087424, endProgress: 0.123424, factor: 0.66 },
    { kind: "exit", startProgress: 0.123424, endProgress: 0.145424, factor: 1 },
    { kind: "braking", startProgress: 0.333284, endProgress: 0.356071, factor: 0.84 },
    { kind: "corner", startProgress: 0.354071, endProgress: 0.387661, factor: 0.73 },
    { kind: "exit", startProgress: 0.387661, endProgress: 0.408055, factor: 1.01 },
    { kind: "straight", startProgress: 0.44991, endProgress: 0.655415, factor: 1.08 },
    { kind: "braking", startProgress: 0.475441, endProgress: 0.498871, factor: 0.83 },
    { kind: "braking", startProgress: 0.483609, endProgress: 0.506749, factor: 0.84 },
    { kind: "corner", startProgress: 0.496871, endProgress: 0.530943, factor: 0.71 },
    { kind: "corner", startProgress: 0.504749, endProgress: 0.538604, factor: 0.72 },
    { kind: "exit", startProgress: 0.530943, endProgress: 0.551658, factor: 1.01 },
    { kind: "exit", startProgress: 0.538604, endProgress: 0.559174, factor: 1.01 },
    { kind: "braking", startProgress: 0.631257, endProgress: 0.653328, factor: 0.85 },
    { kind: "corner", startProgress: 0.651328, endProgress: 0.684381, factor: 0.74 },
    { kind: "exit", startProgress: 0.684381, endProgress: 0.704416, factor: 1.02 }
  ],
  "circuit_lisbon_baixa_loop": [
    { kind: "braking", startProgress: 0.465833, endProgress: 0.490598, factor: 0.82 },
    { kind: "corner", startProgress: 0.488598, endProgress: 0.523672, factor: 0.69 },
    { kind: "exit", startProgress: 0.523672, endProgress: 0.545055, factor: 1.01 },
    { kind: "braking", startProgress: 0.593335, endProgress: 0.618174, factor: 0.81 },
    { kind: "corner", startProgress: 0.616174, endProgress: 0.651303, factor: 0.68 },
    { kind: "exit", startProgress: 0.651303, endProgress: 0.672723, factor: 1.01 },
    { kind: "straight", startProgress: 0.679354, endProgress: 0.826144, factor: 1.08 }
  ],
  "circuit_vienna_ring_loop": [
    { kind: "straight", startProgress: 0.13091, endProgress: 0.279342, factor: 1.08 },
    { kind: "braking", startProgress: 0.601413, endProgress: 0.624427, factor: 0.84 },
    { kind: "corner", startProgress: 0.622427, endProgress: 0.656188, factor: 0.72 },
    { kind: "braking", startProgress: 0.640578, endProgress: 0.665564, factor: 0.81 },
    { kind: "braking", startProgress: 0.655419, endProgress: 0.677828, factor: 0.84 },
    { kind: "exit", startProgress: 0.656188, endProgress: 0.676695, factor: 1.01 },
    { kind: "corner", startProgress: 0.663564, endProgress: 0.698803, factor: 0.68 },
    { kind: "corner", startProgress: 0.675828, endProgress: 0.709135, factor: 0.74 },
    { kind: "braking", startProgress: 0.689735, endProgress: 0.71319, factor: 0.83 },
    { kind: "exit", startProgress: 0.698803, endProgress: 0.720296, factor: 1 },
    { kind: "exit", startProgress: 0.709135, endProgress: 0.729339, factor: 1.02 },
    { kind: "corner", startProgress: 0.71119, endProgress: 0.745281, factor: 0.71 },
    { kind: "exit", startProgress: 0.745281, endProgress: 0.766009, factor: 1.01 },
    { kind: "braking", startProgress: 0.841542, endProgress: 0.855382, factor: 0.95 },
    { kind: "corner", startProgress: 0.853382, endProgress: 0.880262, factor: 0.92 },
    { kind: "exit", startProgress: 0.880262, endProgress: 0.896182, factor: 1.05 }
  ],
  "circuit_porto_boavista_loop": [
    { kind: "braking", startProgress: 0.007417, endProgress: 0.030428, factor: 0.84 },
    { kind: "corner", startProgress: 0.028428, endProgress: 0.062187, factor: 0.72 },
    { kind: "exit", startProgress: 0.062187, endProgress: 0.082692, factor: 1.01 },
    { kind: "braking", startProgress: 0.082001, endProgress: 0.103966, factor: 0.85 },
    { kind: "corner", startProgress: 0.101966, endProgress: 0.13494, factor: 0.75 },
    { kind: "exit", startProgress: 0.13494, endProgress: 0.154922, factor: 1.02 },
    { kind: "braking", startProgress: 0.135079, endProgress: 0.161079, factor: 0.8 },
    { kind: "corner", startProgress: 0.159079, endProgress: 0.195079, factor: 0.66 },
    { kind: "exit", startProgress: 0.195079, endProgress: 0.217079, factor: 1 },
    { kind: "braking", startProgress: 0.302032, endProgress: 0.318266, factor: 0.92 },
    { kind: "corner", startProgress: 0.316266, endProgress: 0.344941, factor: 0.87 },
    { kind: "exit", startProgress: 0.344941, endProgress: 0.362058, factor: 1.04 },
    { kind: "braking", startProgress: 0.506967, endProgress: 0.519955, factor: 0.96 },
    { kind: "corner", startProgress: 0.517955, endProgress: 0.544196, factor: 0.94 },
    { kind: "exit", startProgress: 0.544196, endProgress: 0.55969, factor: 1.06 },
    { kind: "braking", startProgress: 0.593335, endProgress: 0.618871, factor: 0.81 },
    { kind: "corner", startProgress: 0.616871, endProgress: 0.652523, factor: 0.67 },
    { kind: "exit", startProgress: 0.652523, endProgress: 0.674291, factor: 1 },
    { kind: "braking", startProgress: 0.709677, endProgress: 0.731849, factor: 0.85 },
    { kind: "corner", startProgress: 0.729849, endProgress: 0.762978, factor: 0.74 },
    { kind: "exit", startProgress: 0.762978, endProgress: 0.783064, factor: 1.02 },
    { kind: "straight", startProgress: 0.81717, endProgress: 0.965443, factor: 1.08 }
  ],
  "circuit_madrid_centro_loop": [
    { kind: "braking", startProgress: 0.121976, endProgress: 0.146298, factor: 0.82 },
    { kind: "braking", startProgress: 0.139444, endProgress: 0.163048, factor: 0.83 },
    { kind: "corner", startProgress: 0.144298, endProgress: 0.179039, factor: 0.7 },
    { kind: "braking", startProgress: 0.147432, endProgress: 0.173432, factor: 0.8 },
    { kind: "braking", startProgress: 0.158901, endProgress: 0.181381, factor: 0.84 },
    { kind: "corner", startProgress: 0.161048, endProgress: 0.195251, factor: 0.71 },
    { kind: "corner", startProgress: 0.171432, endProgress: 0.207432, factor: 0.66 },
    { kind: "exit", startProgress: 0.179039, endProgress: 0.2002, factor: 1.01 },
    { kind: "corner", startProgress: 0.179381, endProgress: 0.212741, factor: 0.73 },
    { kind: "exit", startProgress: 0.195251, endProgress: 0.216054, factor: 1.01 },
    { kind: "exit", startProgress: 0.207432, endProgress: 0.229432, factor: 1 },
    { kind: "exit", startProgress: 0.212741, endProgress: 0.232981, factor: 1.02 },
    { kind: "braking", startProgress: 0.50271, endProgress: 0.515514, factor: 0.96 },
    { kind: "corner", startProgress: 0.513514, endProgress: 0.539617, factor: 0.94 },
    { kind: "exit", startProgress: 0.539617, endProgress: 0.555019, factor: 1.06 },
    { kind: "braking", startProgress: 0.718214, endProgress: 0.744214, factor: 0.8 },
    { kind: "straight", startProgress: 0.723627, endProgress: 0.882152, factor: 1.08 },
    { kind: "corner", startProgress: 0.742214, endProgress: 0.778214, factor: 0.66 },
    { kind: "exit", startProgress: 0.778214, endProgress: 0.800214, factor: 1 },
    { kind: "braking", startProgress: 0.782735, endProgress: 0.806535, factor: 0.83 },
    { kind: "corner", startProgress: 0.804535, endProgress: 0.838885, factor: 0.71 },
    { kind: "exit", startProgress: 0.838885, endProgress: 0.859785, factor: 1.01 }
  ],
  "circuit_monaco_harbor_loop": [
    { kind: "braking", startProgress: 0.255885, endProgress: 0.2763, factor: 0.87 },
    { kind: "braking", startProgress: 0.264523, endProgress: 0.286405, factor: 0.85 },
    { kind: "corner", startProgress: 0.2743, endProgress: 0.306111, factor: 0.78 },
    { kind: "corner", startProgress: 0.284405, endProgress: 0.317316, factor: 0.75 },
    { kind: "braking", startProgress: 0.290444, endProgress: 0.316444, factor: 0.8 },
    { kind: "exit", startProgress: 0.306111, endProgress: 0.325319, factor: 1.02 },
    { kind: "corner", startProgress: 0.314444, endProgress: 0.350444, factor: 0.66 },
    { kind: "exit", startProgress: 0.317316, endProgress: 0.337257, factor: 1.02 },
    { kind: "exit", startProgress: 0.350444, endProgress: 0.372444, factor: 1 },
    { kind: "braking", startProgress: 0.464432, endProgress: 0.488101, factor: 0.83 },
    { kind: "corner", startProgress: 0.486101, endProgress: 0.520353, factor: 0.71 },
    { kind: "braking", startProgress: 0.486228, endProgress: 0.502604, factor: 0.92 },
    { kind: "corner", startProgress: 0.500604, endProgress: 0.529386, factor: 0.86 },
    { kind: "exit", startProgress: 0.520353, endProgress: 0.541187, factor: 1.01 },
    { kind: "exit", startProgress: 0.529386, endProgress: 0.546574, factor: 1.04 },
    { kind: "braking", startProgress: 0.558631, endProgress: 0.57539, factor: 0.92 },
    { kind: "corner", startProgress: 0.57339, endProgress: 0.602459, factor: 0.86 },
    { kind: "braking", startProgress: 0.59474, endProgress: 0.610104, factor: 0.93 },
    { kind: "exit", startProgress: 0.602459, endProgress: 0.619838, factor: 1.04 },
    { kind: "corner", startProgress: 0.608104, endProgress: 0.636127, factor: 0.89 },
    { kind: "exit", startProgress: 0.636127, endProgress: 0.652809, factor: 1.05 },
    { kind: "straight", startProgress: 0.894383, endProgress: 0.979826, factor: 1.08 }
  ],
  "circuit_monaco_casino_sprint": [
    { kind: "braking", startProgress: 0.256384, endProgress: 0.280433, factor: 0.82 },
    { kind: "braking", startProgress: 0.268869, endProgress: 0.29303, factor: 0.82 },
    { kind: "corner", startProgress: 0.278433, endProgress: 0.31297, factor: 0.7 },
    { kind: "corner", startProgress: 0.29103, endProgress: 0.325651, factor: 0.7 },
    { kind: "exit", startProgress: 0.31297, endProgress: 0.333994, factor: 1.01 },
    { kind: "braking", startProgress: 0.323328, endProgress: 0.341393, factor: 0.9 },
    { kind: "exit", startProgress: 0.325651, endProgress: 0.346732, factor: 1.01 },
    { kind: "braking", startProgress: 0.326118, endProgress: 0.344385, factor: 0.9 },
    { kind: "corner", startProgress: 0.339393, endProgress: 0.369442, factor: 0.83 },
    { kind: "corner", startProgress: 0.342385, endProgress: 0.372585, factor: 0.82 },
    { kind: "braking", startProgress: 0.357776, endProgress: 0.381445, factor: 0.83 },
    { kind: "exit", startProgress: 0.369442, endProgress: 0.387474, factor: 1.03 },
    { kind: "exit", startProgress: 0.372585, endProgress: 0.390719, factor: 1.03 },
    { kind: "braking", startProgress: 0.377099, endProgress: 0.393858, factor: 0.92 },
    { kind: "corner", startProgress: 0.379445, endProgress: 0.413697, factor: 0.71 },
    { kind: "corner", startProgress: 0.391858, endProgress: 0.420927, factor: 0.86 },
    { kind: "exit", startProgress: 0.413697, endProgress: 0.434531, factor: 1.01 },
    { kind: "exit", startProgress: 0.420927, endProgress: 0.438306, factor: 1.04 },
    { kind: "braking", startProgress: 0.772752, endProgress: 0.796624, factor: 0.83 },
    { kind: "corner", startProgress: 0.794624, endProgress: 0.829028, factor: 0.71 },
    { kind: "exit", startProgress: 0.829028, endProgress: 0.849964, factor: 1.01 },
    { kind: "straight", startProgress: 0.891164, endProgress: 0.93943, factor: 1.08 }
  ],
  "circuit_london_thames_loop": [
    { kind: "braking", startProgress: 0.004667, endProgress: 0.016655, factor: 0.98 },
    { kind: "straight", startProgress: 0.011322, endProgress: 0.151985, factor: 1.08 },
    { kind: "corner", startProgress: 0.014655, endProgress: 0.040146, factor: 0.96 },
    { kind: "exit", startProgress: 0.040146, endProgress: 0.05514, factor: 1.06 },
    { kind: "braking", startProgress: 0.128119, endProgress: 0.152642, factor: 0.82 },
    { kind: "corner", startProgress: 0.150642, endProgress: 0.185534, factor: 0.69 },
    { kind: "exit", startProgress: 0.185534, endProgress: 0.206796, factor: 1.01 },
    { kind: "braking", startProgress: 0.190504, endProgress: 0.216504, factor: 0.8 },
    { kind: "corner", startProgress: 0.214504, endProgress: 0.250504, factor: 0.66 },
    { kind: "exit", startProgress: 0.250504, endProgress: 0.272504, factor: 1 },
    { kind: "braking", startProgress: 0.26501, endProgress: 0.289699, factor: 0.82 },
    { kind: "corner", startProgress: 0.287699, endProgress: 0.322716, factor: 0.69 },
    { kind: "exit", startProgress: 0.322716, endProgress: 0.344061, factor: 1.01 },
    { kind: "braking", startProgress: 0.563641, endProgress: 0.574421, factor: 0.99 },
    { kind: "corner", startProgress: 0.572421, endProgress: 0.597006, factor: 0.98 },
    { kind: "exit", startProgress: 0.597006, endProgress: 0.611396, factor: 1.07 },
    { kind: "braking", startProgress: 0.680512, endProgress: 0.705282, factor: 0.82 },
    { kind: "corner", startProgress: 0.703282, endProgress: 0.73836, factor: 0.69 },
    { kind: "braking", startProgress: 0.73333, endProgress: 0.753513, factor: 0.87 },
    { kind: "exit", startProgress: 0.73836, endProgress: 0.759745, factor: 1.01 },
    { kind: "corner", startProgress: 0.751513, endProgress: 0.78315, factor: 0.78 },
    { kind: "exit", startProgress: 0.78315, endProgress: 0.802242, factor: 1.03 }
  ],
  "circuit_brussels_grand_place_loop": [
    { kind: "braking", startProgress: 0.534468, endProgress: 0.55938, factor: 0.81 },
    { kind: "braking", startProgress: 0.553146, endProgress: 0.574695, factor: 0.86 },
    { kind: "corner", startProgress: 0.55738, endProgress: 0.592564, factor: 0.68 },
    { kind: "braking", startProgress: 0.565919, endProgress: 0.589113, factor: 0.84 },
    { kind: "corner", startProgress: 0.572695, endProgress: 0.605357, factor: 0.75 },
    { kind: "braking", startProgress: 0.581913, endProgress: 0.607913, factor: 0.8 },
    { kind: "corner", startProgress: 0.587113, endProgress: 0.621009, factor: 0.72 },
    { kind: "exit", startProgress: 0.592564, endProgress: 0.61402, factor: 1 },
    { kind: "exit", startProgress: 0.605357, endProgress: 0.625131, factor: 1.02 },
    { kind: "corner", startProgress: 0.605913, endProgress: 0.641913, factor: 0.66 },
    { kind: "braking", startProgress: 0.61434, endProgress: 0.637845, factor: 0.83 },
    { kind: "exit", startProgress: 0.621009, endProgress: 0.641606, factor: 1.01 },
    { kind: "corner", startProgress: 0.635845, endProgress: 0.669974, factor: 0.71 },
    { kind: "exit", startProgress: 0.641913, endProgress: 0.663913, factor: 1 },
    { kind: "exit", startProgress: 0.669974, endProgress: 0.690726, factor: 1.01 },
    { kind: "braking", startProgress: 0.674335, endProgress: 0.696488, factor: 0.85 },
    { kind: "corner", startProgress: 0.694488, endProgress: 0.727603, factor: 0.74 },
    { kind: "exit", startProgress: 0.727603, endProgress: 0.747679, factor: 1.02 },
    { kind: "braking", startProgress: 0.797305, endProgress: 0.822047, factor: 0.82 },
    { kind: "corner", startProgress: 0.820047, endProgress: 0.855103, factor: 0.69 },
    { kind: "straight", startProgress: 0.836094, endProgress: 0.936105, factor: 1.08 },
    { kind: "exit", startProgress: 0.855103, endProgress: 0.876474, factor: 1.01 }
  ],
  "circuit_prague_vltava_loop": [
    { kind: "braking", startProgress: 0.188796, endProgress: 0.213571, factor: 0.82 },
    { kind: "straight", startProgress: 0.192735, endProgress: 0.568766, factor: 1.08 },
    { kind: "braking", startProgress: 0.209436, endProgress: 0.225079, factor: 0.93 },
    { kind: "corner", startProgress: 0.211571, endProgress: 0.246653, factor: 0.69 },
    { kind: "corner", startProgress: 0.223079, endProgress: 0.251312, factor: 0.88 },
    { kind: "exit", startProgress: 0.246653, endProgress: 0.26804, factor: 1.01 },
    { kind: "exit", startProgress: 0.251312, endProgress: 0.268133, factor: 1.05 },
    { kind: "braking", startProgress: 0.451553, endProgress: 0.476958, factor: 0.81 },
    { kind: "braking", startProgress: 0.466097, endProgress: 0.48793, factor: 0.85 },
    { kind: "corner", startProgress: 0.474958, endProgress: 0.510512, factor: 0.67 },
    { kind: "braking", startProgress: 0.477476, endProgress: 0.499342, factor: 0.85 },
    { kind: "corner", startProgress: 0.48593, endProgress: 0.518805, factor: 0.75 },
    { kind: "corner", startProgress: 0.497342, endProgress: 0.530242, factor: 0.75 },
    { kind: "exit", startProgress: 0.510512, endProgress: 0.532214, factor: 1 },
    { kind: "exit", startProgress: 0.518805, endProgress: 0.538722, factor: 1.02 },
    { kind: "braking", startProgress: 0.52644, endProgress: 0.538355, factor: 0.98 },
    { kind: "exit", startProgress: 0.530242, endProgress: 0.550175, factor: 1.02 },
    { kind: "corner", startProgress: 0.536355, endProgress: 0.561791, factor: 0.96 },
    { kind: "exit", startProgress: 0.561791, endProgress: 0.576748, factor: 1.06 },
    { kind: "braking", startProgress: 0.639268, endProgress: 0.665124, factor: 0.8 },
    { kind: "corner", startProgress: 0.663124, endProgress: 0.699016, factor: 0.66 },
    { kind: "exit", startProgress: 0.699016, endProgress: 0.720944, factor: 1 }
  ],
  "circuit_copenhagen_harbor_loop": [
    { kind: "braking", startProgress: 0.015923, endProgress: 0.038388, factor: 0.84 },
    { kind: "corner", startProgress: 0.036388, endProgress: 0.069737, factor: 0.74 },
    { kind: "exit", startProgress: 0.069737, endProgress: 0.08997, factor: 1.02 },
    { kind: "braking", startProgress: 0.165407, endProgress: 0.186655, factor: 0.86 },
    { kind: "corner", startProgress: 0.184655, endProgress: 0.217091, factor: 0.76 },
    { kind: "exit", startProgress: 0.217091, endProgress: 0.236715, factor: 1.02 },
    { kind: "braking", startProgress: 0.282022, endProgress: 0.296048, factor: 0.95 },
    { kind: "corner", startProgress: 0.294048, endProgress: 0.321068, factor: 0.91 },
    { kind: "exit", startProgress: 0.321068, endProgress: 0.337081, factor: 1.05 },
    { kind: "braking", startProgress: 0.361921, endProgress: 0.381928, factor: 0.87 },
    { kind: "corner", startProgress: 0.379928, endProgress: 0.411433, factor: 0.79 },
    { kind: "braking", startProgress: 0.393473, endProgress: 0.41133, factor: 0.9 },
    { kind: "corner", startProgress: 0.40933, endProgress: 0.439223, factor: 0.83 },
    { kind: "exit", startProgress: 0.411433, endProgress: 0.430437, factor: 1.03 },
    { kind: "straight", startProgress: 0.416737, endProgress: 0.76963, factor: 1.08 },
    { kind: "exit", startProgress: 0.439223, endProgress: 0.457151, factor: 1.04 },
    { kind: "braking", startProgress: 0.609841, endProgress: 0.627953, factor: 0.9 },
    { kind: "corner", startProgress: 0.625953, endProgress: 0.656037, factor: 0.83 },
    { kind: "exit", startProgress: 0.656037, endProgress: 0.674093, factor: 1.03 }
  ],
  "circuit_stockholm_gamla_stan_loop": [
    { kind: "braking", startProgress: 0.223571, endProgress: 0.236328, factor: 0.97 },
    { kind: "corner", startProgress: 0.234328, endProgress: 0.260396, factor: 0.94 },
    { kind: "exit", startProgress: 0.260396, endProgress: 0.275775, factor: 1.06 },
    { kind: "straight", startProgress: 0.537846, endProgress: 0.640873, factor: 1.08 },
    { kind: "braking", startProgress: 0.602758, endProgress: 0.622373, factor: 0.88 },
    { kind: "braking", startProgress: 0.611228, endProgress: 0.633766, factor: 0.84 },
    { kind: "corner", startProgress: 0.620373, endProgress: 0.651584, factor: 0.8 },
    { kind: "corner", startProgress: 0.631766, endProgress: 0.665169, factor: 0.73 },
    { kind: "braking", startProgress: 0.632859, endProgress: 0.657914, factor: 0.81 },
    { kind: "exit", startProgress: 0.651584, endProgress: 0.670392, factor: 1.03 },
    { kind: "corner", startProgress: 0.655914, endProgress: 0.691206, factor: 0.68 },
    { kind: "exit", startProgress: 0.665169, endProgress: 0.685438, factor: 1.02 },
    { kind: "exit", startProgress: 0.691206, endProgress: 0.712733, factor: 1 },
    { kind: "braking", startProgress: 0.72824, endProgress: 0.748394, factor: 0.87 },
    { kind: "corner", startProgress: 0.746394, endProgress: 0.77801, factor: 0.78 },
    { kind: "exit", startProgress: 0.77801, endProgress: 0.797087, factor: 1.03 },
    { kind: "braking", startProgress: 0.810786, endProgress: 0.829057, factor: 0.9 },
    { kind: "corner", startProgress: 0.827057, endProgress: 0.85726, factor: 0.82 },
    { kind: "exit", startProgress: 0.85726, endProgress: 0.875396, factor: 1.03 },
    { kind: "braking", startProgress: 0.890243, endProgress: 0.90537, factor: 0.94 },
    { kind: "corner", startProgress: 0.90337, endProgress: 0.931215, factor: 0.89 },
    { kind: "exit", startProgress: 0.931215, endProgress: 0.947778, factor: 1.05 }
  ],
  "circuit_cannes_houssam_loop": [
    { kind: "braking", startProgress: 0.026534, endProgress: 0.052534, factor: 0.8 },
    { kind: "corner", startProgress: 0.050534, endProgress: 0.086534, factor: 0.66 },
    { kind: "exit", startProgress: 0.086534, endProgress: 0.108534, factor: 1 },
    { kind: "straight", startProgress: 0.103768, endProgress: 0.288298, factor: 1.08 },
    { kind: "braking", startProgress: 0.108229, endProgress: 0.122492, factor: 0.95 },
    { kind: "corner", startProgress: 0.120492, endProgress: 0.147689, factor: 0.91 },
    { kind: "exit", startProgress: 0.147689, endProgress: 0.163821, factor: 1.05 },
    { kind: "braking", startProgress: 0.17512, endProgress: 0.196303, factor: 0.86 },
    { kind: "corner", startProgress: 0.194303, endProgress: 0.22669, factor: 0.76 },
    { kind: "exit", startProgress: 0.22669, endProgress: 0.246281, factor: 1.02 },
    { kind: "braking", startProgress: 0.236182, endProgress: 0.250647, factor: 0.94 },
    { kind: "corner", startProgress: 0.248647, endProgress: 0.275996, factor: 0.91 },
    { kind: "exit", startProgress: 0.275996, endProgress: 0.292229, factor: 1.05 },
    { kind: "braking", startProgress: 0.474153, endProgress: 0.499523, factor: 0.81 },
    { kind: "corner", startProgress: 0.497523, endProgress: 0.53305, factor: 0.67 },
    { kind: "exit", startProgress: 0.53305, endProgress: 0.554735, factor: 1 },
    { kind: "braking", startProgress: 0.729744, endProgress: 0.74219, factor: 0.97 },
    { kind: "corner", startProgress: 0.74019, endProgress: 0.766024, factor: 0.95 },
    { kind: "exit", startProgress: 0.766024, endProgress: 0.781247, factor: 1.06 },
    { kind: "braking", startProgress: 0.818424, endProgress: 0.831567, factor: 0.96 },
    { kind: "corner", startProgress: 0.829567, endProgress: 0.855924, factor: 0.93 },
    { kind: "exit", startProgress: 0.855924, endProgress: 0.871496, factor: 1.06 }
  ],
  "circuit_tokyo_bay_loop": [
    { kind: "braking", startProgress: 0.106897, endProgress: 0.132897, factor: 0.8 },
    { kind: "braking", startProgress: 0.129015, endProgress: 0.148012, factor: 0.89 },
    { kind: "corner", startProgress: 0.130897, endProgress: 0.166897, factor: 0.66 },
    { kind: "corner", startProgress: 0.146012, endProgress: 0.17676, factor: 0.81 },
    { kind: "braking", startProgress: 0.154735, endProgress: 0.171416, factor: 0.92 },
    { kind: "exit", startProgress: 0.166897, endProgress: 0.188897, factor: 1 },
    { kind: "corner", startProgress: 0.169416, endProgress: 0.198427, factor: 0.86 },
    { kind: "braking", startProgress: 0.170901, endProgress: 0.196901, factor: 0.8 },
    { kind: "exit", startProgress: 0.17676, endProgress: 0.195259, factor: 1.03 },
    { kind: "braking", startProgress: 0.18888, endProgress: 0.210118, factor: 0.86 },
    { kind: "corner", startProgress: 0.194901, endProgress: 0.230901, factor: 0.66 },
    { kind: "exit", startProgress: 0.198427, endProgress: 0.215768, factor: 1.04 },
    { kind: "corner", startProgress: 0.208118, endProgress: 0.240547, factor: 0.76 },
    { kind: "exit", startProgress: 0.230901, endProgress: 0.252901, factor: 1 },
    { kind: "exit", startProgress: 0.240547, endProgress: 0.260166, factor: 1.02 },
    { kind: "braking", startProgress: 0.412461, endProgress: 0.43039, factor: 0.9 },
    { kind: "corner", startProgress: 0.42839, endProgress: 0.458337, factor: 0.83 },
    { kind: "exit", startProgress: 0.458337, endProgress: 0.476302, factor: 1.04 },
    { kind: "straight", startProgress: 0.603779, endProgress: 0.805249, factor: 1.08 },
    { kind: "braking", startProgress: 0.626796, endProgress: 0.646754, factor: 0.88 },
    { kind: "corner", startProgress: 0.644754, endProgress: 0.676222, factor: 0.79 },
    { kind: "exit", startProgress: 0.676222, endProgress: 0.695201, factor: 1.03 }
  ],
  "circuit_rio_flamengo_loop": [
    { kind: "corner", startProgress: 0.015571, endProgress: 0.051423, factor: 0.66 },
    { kind: "exit", startProgress: 0.051423, endProgress: 0.073324, factor: 1 },
    { kind: "braking", startProgress: 0.130064, endProgress: 0.149002, factor: 0.89 },
    { kind: "corner", startProgress: 0.147002, endProgress: 0.177706, factor: 0.81 },
    { kind: "exit", startProgress: 0.177706, endProgress: 0.196175, factor: 1.03 },
    { kind: "straight", startProgress: 0.472343, endProgress: 0.652043, factor: 1.08 },
    { kind: "braking", startProgress: 0.505168, endProgress: 0.531168, factor: 0.8 },
    { kind: "corner", startProgress: 0.529168, endProgress: 0.565168, factor: 0.66 },
    { kind: "braking", startProgress: 0.538048, endProgress: 0.558419, factor: 0.87 },
    { kind: "corner", startProgress: 0.556419, endProgress: 0.588197, factor: 0.78 },
    { kind: "exit", startProgress: 0.565168, endProgress: 0.587168, factor: 1 },
    { kind: "exit", startProgress: 0.588197, endProgress: 0.607383, factor: 1.02 },
    { kind: "braking", startProgress: 0.616616, endProgress: 0.642616, factor: 0.8 },
    { kind: "corner", startProgress: 0.640616, endProgress: 0.676616, factor: 0.66 },
    { kind: "exit", startProgress: 0.676616, endProgress: 0.698616, factor: 1 },
    { kind: "braking", startProgress: 0.809631, endProgress: 0.835154, factor: 0.81 },
    { kind: "braking", startProgress: 0.816149, endProgress: 0.837865, factor: 0.85 },
    { kind: "corner", startProgress: 0.833154, endProgress: 0.868796, factor: 0.67 },
    { kind: "corner", startProgress: 0.835865, endProgress: 0.868652, factor: 0.75 },
    { kind: "exit", startProgress: 0.868652, endProgress: 0.88851, factor: 1.02 },
    { kind: "exit", startProgress: 0.868796, endProgress: 0.890558, factor: 1 },
    { kind: "braking", startProgress: 0.991769, endProgress: 0.017571, factor: 0.8 }
  ],
  "circuit_cape_town_waterfront_loop": [
    { kind: "straight", startProgress: 0.052208, endProgress: 0.235427, factor: 1.08 },
    { kind: "braking", startProgress: 0.119403, endProgress: 0.143114, factor: 0.83 },
    { kind: "corner", startProgress: 0.141114, endProgress: 0.175397, factor: 0.71 },
    { kind: "exit", startProgress: 0.175397, endProgress: 0.196252, factor: 1.01 },
    { kind: "braking", startProgress: 0.229078, endProgress: 0.25185, factor: 0.84 },
    { kind: "braking", startProgress: 0.248984, endProgress: 0.274415, factor: 0.81 },
    { kind: "corner", startProgress: 0.24985, endProgress: 0.283429, factor: 0.73 },
    { kind: "corner", startProgress: 0.272415, endProgress: 0.307989, factor: 0.67 },
    { kind: "exit", startProgress: 0.283429, endProgress: 0.303815, factor: 1.01 },
    { kind: "braking", startProgress: 0.300114, endProgress: 0.317795, factor: 0.9 },
    { kind: "exit", startProgress: 0.307989, endProgress: 0.329704, factor: 1 },
    { kind: "corner", startProgress: 0.315795, endProgress: 0.345556, factor: 0.84 },
    { kind: "exit", startProgress: 0.345556, endProgress: 0.363396, factor: 1.04 },
    { kind: "braking", startProgress: 0.498187, endProgress: 0.521539, factor: 0.83 },
    { kind: "braking", startProgress: 0.51407, endProgress: 0.537481, factor: 0.83 },
    { kind: "corner", startProgress: 0.519539, endProgress: 0.553553, factor: 0.72 },
    { kind: "corner", startProgress: 0.535481, endProgress: 0.569539, factor: 0.72 },
    { kind: "exit", startProgress: 0.553553, endProgress: 0.574228, factor: 1.01 },
    { kind: "exit", startProgress: 0.569539, endProgress: 0.590245, factor: 1.01 },
    { kind: "braking", startProgress: 0.782454, endProgress: 0.804086, factor: 0.85 },
    { kind: "corner", startProgress: 0.802086, endProgress: 0.83481, factor: 0.75 },
    { kind: "exit", startProgress: 0.83481, endProgress: 0.854625, factor: 1.02 }
  ],
  "circuit_seoul_yeouido_loop": [
    { kind: "braking", startProgress: 0.009923, endProgress: 0.035923, factor: 0.8 },
    { kind: "corner", startProgress: 0.033923, endProgress: 0.069923, factor: 0.66 },
    { kind: "exit", startProgress: 0.069923, endProgress: 0.091923, factor: 1 },
    { kind: "braking", startProgress: 0.175335, endProgress: 0.189111, factor: 0.95 },
    { kind: "corner", startProgress: 0.187111, endProgress: 0.213943, factor: 0.92 },
    { kind: "exit", startProgress: 0.213943, endProgress: 0.229831, factor: 1.05 },
    { kind: "braking", startProgress: 0.285353, endProgress: 0.302382, factor: 0.91 },
    { kind: "corner", startProgress: 0.300382, endProgress: 0.329654, factor: 0.85 },
    { kind: "braking", startProgress: 0.32951, endProgress: 0.341835, factor: 0.97 },
    { kind: "exit", startProgress: 0.329654, endProgress: 0.347169, factor: 1.04 },
    { kind: "corner", startProgress: 0.339835, endProgress: 0.365579, factor: 0.95 },
    { kind: "exit", startProgress: 0.365579, endProgress: 0.380741, factor: 1.06 },
    { kind: "braking", startProgress: 0.484863, endProgress: 0.510863, factor: 0.8 },
    { kind: "straight", startProgress: 0.490638, endProgress: 0.823405, factor: 1.08 },
    { kind: "corner", startProgress: 0.508863, endProgress: 0.544863, factor: 0.66 },
    { kind: "exit", startProgress: 0.544863, endProgress: 0.566863, factor: 1 },
    { kind: "braking", startProgress: 0.685678, endProgress: 0.703147, factor: 0.91 },
    { kind: "corner", startProgress: 0.701147, endProgress: 0.730749, factor: 0.84 },
    { kind: "exit", startProgress: 0.730749, endProgress: 0.748483, factor: 1.04 }
  ],
  "circuit_montreal_island_loop": [
    { kind: "straight", startProgress: 0.013805, endProgress: 0.442123, factor: 1.08 },
    { kind: "braking", startProgress: 0.021401, endProgress: 0.047401, factor: 0.8 },
    { kind: "corner", startProgress: 0.045401, endProgress: 0.081401, factor: 0.66 },
    { kind: "exit", startProgress: 0.081401, endProgress: 0.103401, factor: 1 },
    { kind: "braking", startProgress: 0.117231, endProgress: 0.137804, factor: 0.87 },
    { kind: "corner", startProgress: 0.135804, endProgress: 0.167734, factor: 0.78 },
    { kind: "braking", startProgress: 0.151961, endProgress: 0.173753, factor: 0.85 },
    { kind: "exit", startProgress: 0.167734, endProgress: 0.18702, factor: 1.02 },
    { kind: "corner", startProgress: 0.171753, endProgress: 0.204597, factor: 0.75 },
    { kind: "braking", startProgress: 0.180922, endProgress: 0.203235, factor: 0.85 },
    { kind: "corner", startProgress: 0.201235, endProgress: 0.23447, factor: 0.74 },
    { kind: "exit", startProgress: 0.204597, endProgress: 0.224493, factor: 1.02 },
    { kind: "exit", startProgress: 0.23447, endProgress: 0.254626, factor: 1.02 },
    { kind: "braking", startProgress: 0.446941, endProgress: 0.465591, factor: 0.89 },
    { kind: "corner", startProgress: 0.463591, endProgress: 0.494079, factor: 0.82 },
    { kind: "exit", startProgress: 0.494079, endProgress: 0.512404, factor: 1.03 },
    { kind: "braking", startProgress: 0.502354, endProgress: 0.517967, factor: 0.93 },
    { kind: "corner", startProgress: 0.515967, endProgress: 0.544177, factor: 0.88 },
    { kind: "exit", startProgress: 0.544177, endProgress: 0.560983, factor: 1.05 },
    { kind: "braking", startProgress: 0.593079, endProgress: 0.619079, factor: 0.8 },
    { kind: "corner", startProgress: 0.617079, endProgress: 0.653079, factor: 0.66 },
    { kind: "exit", startProgress: 0.653079, endProgress: 0.675079, factor: 1 }
  ],
  "circuit_istanbul_bosphorus_loop": [
    { kind: "braking", startProgress: 0.098189, endProgress: 0.124189, factor: 0.8 },
    { kind: "corner", startProgress: 0.122189, endProgress: 0.158189, factor: 0.66 },
    { kind: "exit", startProgress: 0.158189, endProgress: 0.180189, factor: 1 },
    { kind: "braking", startProgress: 0.198347, endProgress: 0.224347, factor: 0.8 },
    { kind: "corner", startProgress: 0.222347, endProgress: 0.258347, factor: 0.66 },
    { kind: "exit", startProgress: 0.258347, endProgress: 0.280347, factor: 1 },
    { kind: "braking", startProgress: 0.692309, endProgress: 0.713791, factor: 0.86 },
    { kind: "braking", startProgress: 0.711689, endProgress: 0.732922, factor: 0.86 },
    { kind: "corner", startProgress: 0.711791, endProgress: 0.744402, factor: 0.76 },
    { kind: "corner", startProgress: 0.730922, endProgress: 0.763347, factor: 0.76 },
    { kind: "exit", startProgress: 0.744402, endProgress: 0.764143, factor: 1.02 },
    { kind: "braking", startProgress: 0.749381, endProgress: 0.77273, factor: 0.83 },
    { kind: "braking", startProgress: 0.76147, endProgress: 0.784397, factor: 0.84 },
    { kind: "exit", startProgress: 0.763347, endProgress: 0.782964, factor: 1.02 },
    { kind: "corner", startProgress: 0.77073, endProgress: 0.804742, factor: 0.72 },
    { kind: "braking", startProgress: 0.779728, endProgress: 0.803472, factor: 0.83 },
    { kind: "corner", startProgress: 0.782397, endProgress: 0.816092, factor: 0.73 },
    { kind: "corner", startProgress: 0.801472, endProgress: 0.83578, factor: 0.71 },
    { kind: "exit", startProgress: 0.804742, endProgress: 0.825416, factor: 1.01 },
    { kind: "straight", startProgress: 0.808564, endProgress: 0.994411, factor: 1.08 },
    { kind: "exit", startProgress: 0.816092, endProgress: 0.836556, factor: 1.01 },
    { kind: "exit", startProgress: 0.83578, endProgress: 0.856652, factor: 1.01 }
  ]
} as const satisfies Record<CityCircuitIdentity["layoutKey"], TrackSpeedProfile>;

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
