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
    { kind: "braking", startProgress: 0.050775, endProgress: 0.07824, factor: 0.85 },
    { kind: "braking", startProgress: 0.059483, endProgress: 0.099014, factor: 0.7 },
    { kind: "corner", startProgress: 0.07624, endProgress: 0.116412, factor: 0.75 },
    { kind: "corner", startProgress: 0.097014, endProgress: 0.146839, factor: 0.48 },
    { kind: "exit", startProgress: 0.116412, endProgress: 0.139915, factor: 1.06 },
    { kind: "exit", startProgress: 0.146839, endProgress: 0.176133, factor: 1.11 },
    { kind: "braking", startProgress: 0.444107, endProgress: 0.46613, factor: 0.92 },
    { kind: "corner", startProgress: 0.46413, endProgress: 0.499948, factor: 0.87 },
    { kind: "exit", startProgress: 0.499948, endProgress: 0.52084, factor: 1.03 },
    { kind: "braking", startProgress: 0.70143, endProgress: 0.74243, factor: 0.68 },
    { kind: "corner", startProgress: 0.74043, endProgress: 0.79143, factor: 0.45 },
    { kind: "braking", startProgress: 0.753724, endProgress: 0.791321, factor: 0.72 },
    { kind: "corner", startProgress: 0.789321, endProgress: 0.837599, factor: 0.52 },
    { kind: "exit", startProgress: 0.79143, endProgress: 0.82143, factor: 1.12 },
    { kind: "braking", startProgress: 0.807661, endProgress: 0.845537, factor: 0.72 },
    { kind: "exit", startProgress: 0.837599, endProgress: 0.865966, factor: 1.1 },
    { kind: "corner", startProgress: 0.843537, endProgress: 0.892038, factor: 0.52 },
    { kind: "braking", startProgress: 0.883858, endProgress: 0.924858, factor: 0.68 },
    { kind: "exit", startProgress: 0.892038, endProgress: 0.920539, factor: 1.11 },
    { kind: "corner", startProgress: 0.922858, endProgress: 0.973858, factor: 0.45 },
    { kind: "straight", startProgress: 0.928874, endProgress: 0.009699, factor: 1.14 },
    { kind: "exit", startProgress: 0.973858, endProgress: 0.003858, factor: 1.12 }
  ],
  "circuit_left_bank_loop": [
    { kind: "corner", startProgress: 0.021964, endProgress: 0.069045, factor: 0.56 },
    { kind: "exit", startProgress: 0.069045, endProgress: 0.096694, factor: 1.1 },
    { kind: "braking", startProgress: 0.102072, endProgress: 0.137419, factor: 0.75 },
    { kind: "corner", startProgress: 0.135419, endProgress: 0.181896, factor: 0.57 },
    { kind: "exit", startProgress: 0.181896, endProgress: 0.209183, factor: 1.09 },
    { kind: "braking", startProgress: 0.225869, endProgress: 0.254265, factor: 0.84 },
    { kind: "corner", startProgress: 0.252265, endProgress: 0.293182, factor: 0.73 },
    { kind: "braking", startProgress: 0.255619, endProgress: 0.296619, factor: 0.68 },
    { kind: "exit", startProgress: 0.293182, endProgress: 0.317132, factor: 1.06 },
    { kind: "corner", startProgress: 0.294619, endProgress: 0.345619, factor: 0.45 },
    { kind: "exit", startProgress: 0.345619, endProgress: 0.375619, factor: 1.12 },
    { kind: "braking", startProgress: 0.387111, endProgress: 0.425276, factor: 0.72 },
    { kind: "corner", startProgress: 0.423276, endProgress: 0.472008, factor: 0.51 },
    { kind: "braking", startProgress: 0.436223, endProgress: 0.477223, factor: 0.68 },
    { kind: "exit", startProgress: 0.472008, endProgress: 0.500648, factor: 1.11 },
    { kind: "corner", startProgress: 0.475223, endProgress: 0.526223, factor: 0.45 },
    { kind: "exit", startProgress: 0.526223, endProgress: 0.556223, factor: 1.12 },
    { kind: "braking", startProgress: 0.6036, endProgress: 0.6446, factor: 0.68 },
    { kind: "corner", startProgress: 0.6426, endProgress: 0.6936, factor: 0.45 },
    { kind: "exit", startProgress: 0.6936, endProgress: 0.7236, factor: 1.12 },
    { kind: "straight", startProgress: 0.79478, endProgress: 0.027985, factor: 1.14 },
    { kind: "braking", startProgress: 0.987862, endProgress: 0.023964, factor: 0.74 }
  ],
  "circuit_canal_loop": [
    { kind: "braking", startProgress: 0.069101, endProgress: 0.094057, factor: 0.89 },
    { kind: "corner", startProgress: 0.092057, endProgress: 0.130222, factor: 0.8 },
    { kind: "exit", startProgress: 0.130222, endProgress: 0.152521, factor: 1.04 },
    { kind: "braking", startProgress: 0.339111, endProgress: 0.375766, factor: 0.74 },
    { kind: "braking", startProgress: 0.371205, endProgress: 0.407954, factor: 0.73 },
    { kind: "corner", startProgress: 0.373766, endProgress: 0.42129, factor: 0.55 },
    { kind: "braking", startProgress: 0.389319, endProgress: 0.428115, factor: 0.71 },
    { kind: "corner", startProgress: 0.405954, endProgress: 0.453553, factor: 0.54 },
    { kind: "exit", startProgress: 0.42129, endProgress: 0.449204, factor: 1.1 },
    { kind: "corner", startProgress: 0.426115, endProgress: 0.475352, factor: 0.5 },
    { kind: "exit", startProgress: 0.453553, endProgress: 0.481512, factor: 1.1 },
    { kind: "exit", startProgress: 0.475352, endProgress: 0.504294, factor: 1.11 },
    { kind: "braking", startProgress: 0.54652, endProgress: 0.581794, factor: 0.75 },
    { kind: "braking", startProgress: 0.556478, endProgress: 0.593273, factor: 0.73 },
    { kind: "corner", startProgress: 0.579794, endProgress: 0.626213, factor: 0.58 },
    { kind: "corner", startProgress: 0.591273, endProgress: 0.638909, factor: 0.54 },
    { kind: "exit", startProgress: 0.626213, endProgress: 0.653465, factor: 1.09 },
    { kind: "exit", startProgress: 0.638909, endProgress: 0.66689, factor: 1.1 },
    { kind: "braking", startProgress: 0.643018, endProgress: 0.675051, factor: 0.79 },
    { kind: "corner", startProgress: 0.673051, endProgress: 0.716877, factor: 0.65 },
    { kind: "exit", startProgress: 0.716877, endProgress: 0.742573, factor: 1.08 },
    { kind: "straight", startProgress: 0.855249, endProgress: 0.019739, factor: 1.14 }
  ],
  "circuit_harbor_sprint": [
    { kind: "braking", startProgress: 0.048633, endProgress: 0.087621, factor: 0.71 },
    { kind: "corner", startProgress: 0.085621, endProgress: 0.135011, factor: 0.49 },
    { kind: "exit", startProgress: 0.135011, endProgress: 0.164045, factor: 1.11 },
    { kind: "braking", startProgress: 0.305463, endProgress: 0.341504, factor: 0.74 },
    { kind: "corner", startProgress: 0.339504, endProgress: 0.386537, factor: 0.56 },
    { kind: "exit", startProgress: 0.386537, endProgress: 0.414157, factor: 1.1 },
    { kind: "braking", startProgress: 0.39985, endProgress: 0.432712, factor: 0.78 },
    { kind: "corner", startProgress: 0.430712, endProgress: 0.475202, factor: 0.63 },
    { kind: "exit", startProgress: 0.475202, endProgress: 0.501296, factor: 1.08 },
    { kind: "straight", startProgress: 0.796868, endProgress: 0.027699, factor: 1.14 }
  ],
  "circuit_ring_sector": [
    { kind: "braking", startProgress: 0.594905, endProgress: 0.627315, factor: 0.79 },
    { kind: "corner", startProgress: 0.625315, endProgress: 0.669443, factor: 0.64 },
    { kind: "exit", startProgress: 0.669443, endProgress: 0.695319, factor: 1.08 },
    { kind: "braking", startProgress: 0.713971, endProgress: 0.748591, factor: 0.76 },
    { kind: "corner", startProgress: 0.746591, endProgress: 0.792487, factor: 0.59 },
    { kind: "braking", startProgress: 0.769295, endProgress: 0.806096, factor: 0.73 },
    { kind: "exit", startProgress: 0.792487, endProgress: 0.819424, factor: 1.09 },
    { kind: "corner", startProgress: 0.804096, endProgress: 0.851737, factor: 0.54 },
    { kind: "exit", startProgress: 0.851737, endProgress: 0.879721, factor: 1.1 },
    { kind: "straight", startProgress: 0.872882, endProgress: 0.017334, factor: 1.14 }
  ],
  "circuit_mitte_dash": [
    { kind: "braking", startProgress: 0.076779, endProgress: 0.117779, factor: 0.68 },
    { kind: "corner", startProgress: 0.115779, endProgress: 0.166779, factor: 0.45 },
    { kind: "braking", startProgress: 0.127179, endProgress: 0.168179, factor: 0.68 },
    { kind: "corner", startProgress: 0.166179, endProgress: 0.217179, factor: 0.45 },
    { kind: "exit", startProgress: 0.166779, endProgress: 0.196779, factor: 1.12 },
    { kind: "exit", startProgress: 0.217179, endProgress: 0.247179, factor: 1.12 },
    { kind: "braking", startProgress: 0.303131, endProgress: 0.344131, factor: 0.68 },
    { kind: "corner", startProgress: 0.342131, endProgress: 0.393131, factor: 0.45 },
    { kind: "exit", startProgress: 0.393131, endProgress: 0.423131, factor: 1.12 },
    { kind: "braking", startProgress: 0.409723, endProgress: 0.44971, factor: 0.69 },
    { kind: "braking", startProgress: 0.435697, endProgress: 0.47045, factor: 0.76 },
    { kind: "corner", startProgress: 0.44771, endProgress: 0.4979, factor: 0.47 },
    { kind: "corner", startProgress: 0.46845, endProgress: 0.514452, factor: 0.59 },
    { kind: "exit", startProgress: 0.4979, endProgress: 0.527414, factor: 1.12 },
    { kind: "exit", startProgress: 0.514452, endProgress: 0.541454, factor: 1.09 },
    { kind: "braking", startProgress: 0.559272, endProgress: 0.596381, factor: 0.73 },
    { kind: "corner", startProgress: 0.594381, endProgress: 0.642268, factor: 0.54 },
    { kind: "braking", startProgress: 0.610179, endProgress: 0.64358, factor: 0.78 },
    { kind: "corner", startProgress: 0.64158, endProgress: 0.686501, factor: 0.62 },
    { kind: "exit", startProgress: 0.642268, endProgress: 0.6704, factor: 1.1 },
    { kind: "exit", startProgress: 0.686501, endProgress: 0.712854, factor: 1.08 },
    { kind: "straight", startProgress: 0.914446, endProgress: 0.011666, factor: 1.14 }
  ],
  "circuit_rome_tiber_loop": [
    { kind: "braking", startProgress: 0.048424, endProgress: 0.089424, factor: 0.68 },
    { kind: "corner", startProgress: 0.087424, endProgress: 0.138424, factor: 0.45 },
    { kind: "exit", startProgress: 0.138424, endProgress: 0.168424, factor: 1.12 },
    { kind: "braking", startProgress: 0.320091, endProgress: 0.356071, factor: 0.74 },
    { kind: "corner", startProgress: 0.354071, endProgress: 0.401055, factor: 0.56 },
    { kind: "exit", startProgress: 0.401055, endProgress: 0.428645, factor: 1.1 },
    { kind: "braking", startProgress: 0.461887, endProgress: 0.498871, factor: 0.73 },
    { kind: "braking", startProgress: 0.470217, endProgress: 0.506749, factor: 0.74 },
    { kind: "corner", startProgress: 0.496871, endProgress: 0.544658, factor: 0.54 },
    { kind: "corner", startProgress: 0.504749, endProgress: 0.552174, factor: 0.55 },
    { kind: "exit", startProgress: 0.544658, endProgress: 0.57273, factor: 1.1 },
    { kind: "exit", startProgress: 0.552174, endProgress: 0.580029, factor: 1.1 },
    { kind: "braking", startProgress: 0.618468, endProgress: 0.653328, factor: 0.76 },
    { kind: "corner", startProgress: 0.651328, endProgress: 0.697416, factor: 0.59 },
    { kind: "exit", startProgress: 0.697416, endProgress: 0.724469, factor: 1.09 },
    { kind: "straight", startProgress: 0.819155, endProgress: 0.02466, factor: 1.14 }
  ],
  "circuit_lisbon_baixa_loop": [
    { kind: "braking", startProgress: 0.451527, endProgress: 0.490598, factor: 0.7 },
    { kind: "corner", startProgress: 0.488598, endProgress: 0.538055, factor: 0.49 },
    { kind: "exit", startProgress: 0.538055, endProgress: 0.567128, factor: 1.11 },
    { kind: "braking", startProgress: 0.578988, endProgress: 0.618174, factor: 0.7 },
    { kind: "corner", startProgress: 0.616174, endProgress: 0.665723, factor: 0.49 },
    { kind: "exit", startProgress: 0.665723, endProgress: 0.694852, factor: 1.11 },
    { kind: "straight", startProgress: 0.870825, endProgress: 0.017615, factor: 1.14 }
  ],
  "circuit_vienna_ring_loop": [
    { kind: "braking", startProgress: 0.588092, endProgress: 0.624427, factor: 0.74 },
    { kind: "corner", startProgress: 0.622427, endProgress: 0.669695, factor: 0.55 },
    { kind: "braking", startProgress: 0.626149, endProgress: 0.665564, factor: 0.7 },
    { kind: "braking", startProgress: 0.642439, endProgress: 0.677828, factor: 0.75 },
    { kind: "corner", startProgress: 0.663564, endProgress: 0.713296, factor: 0.48 },
    { kind: "exit", startProgress: 0.669695, endProgress: 0.697456, factor: 1.1 },
    { kind: "corner", startProgress: 0.675828, endProgress: 0.722339, factor: 0.57 },
    { kind: "braking", startProgress: 0.676166, endProgress: 0.71319, factor: 0.73 },
    { kind: "corner", startProgress: 0.71119, endProgress: 0.759009, factor: 0.54 },
    { kind: "exit", startProgress: 0.713296, endProgress: 0.742536, factor: 1.11 },
    { kind: "exit", startProgress: 0.722339, endProgress: 0.749645, factor: 1.09 },
    { kind: "exit", startProgress: 0.759009, endProgress: 0.787101, factor: 1.1 },
    { kind: "braking", startProgress: 0.833382, endProgress: 0.855382, factor: 0.92 },
    { kind: "corner", startProgress: 0.853382, endProgress: 0.889182, factor: 0.87 },
    { kind: "straight", startProgress: 0.86938, endProgress: 0.017812, factor: 1.14 },
    { kind: "exit", startProgress: 0.889182, endProgress: 0.910062, factor: 1.03 }
  ],
  "circuit_porto_boavista_loop": [
    { kind: "corner", startProgress: 0.028428, endProgress: 0.075692, factor: 0.55 },
    { kind: "braking", startProgress: 0.06927, endProgress: 0.103966, factor: 0.76 },
    { kind: "exit", startProgress: 0.075692, endProgress: 0.103451, factor: 1.1 },
    { kind: "corner", startProgress: 0.101966, endProgress: 0.147922, factor: 0.59 },
    { kind: "braking", startProgress: 0.120079, endProgress: 0.161079, factor: 0.68 },
    { kind: "exit", startProgress: 0.147922, endProgress: 0.174896, factor: 1.09 },
    { kind: "corner", startProgress: 0.159079, endProgress: 0.210079, factor: 0.45 },
    { kind: "exit", startProgress: 0.210079, endProgress: 0.240079, factor: 1.12 },
    { kind: "braking", startProgress: 0.292525, endProgress: 0.318266, factor: 0.88 },
    { kind: "corner", startProgress: 0.316266, endProgress: 0.355058, factor: 0.79 },
    { kind: "exit", startProgress: 0.355058, endProgress: 0.377734, factor: 1.05 },
    { kind: "braking", startProgress: 0.499286, endProgress: 0.519955, factor: 0.94 },
    { kind: "corner", startProgress: 0.517955, endProgress: 0.55269, factor: 0.9 },
    { kind: "exit", startProgress: 0.55269, endProgress: 0.572931, factor: 1.02 },
    { kind: "braking", startProgress: 0.578596, endProgress: 0.618871, factor: 0.69 },
    { kind: "corner", startProgress: 0.616871, endProgress: 0.667291, factor: 0.47 },
    { kind: "exit", startProgress: 0.667291, endProgress: 0.696943, factor: 1.12 },
    { kind: "braking", startProgress: 0.69683, endProgress: 0.731849, factor: 0.76 },
    { kind: "corner", startProgress: 0.729849, endProgress: 0.776064, factor: 0.58 },
    { kind: "exit", startProgress: 0.776064, endProgress: 0.803193, factor: 1.09 },
    { kind: "straight", startProgress: 0.86952, endProgress: 0.017793, factor: 1.14 },
    { kind: "braking", startProgress: 0.994098, endProgress: 0.030428, factor: 0.74 }
  ],
  "circuit_madrid_centro_loop": [
    { kind: "braking", startProgress: 0.10792, endProgress: 0.146298, factor: 0.71 },
    { kind: "braking", startProgress: 0.125791, endProgress: 0.163048, factor: 0.73 },
    { kind: "braking", startProgress: 0.132432, endProgress: 0.173432, factor: 0.68 },
    { kind: "corner", startProgress: 0.144298, endProgress: 0.1932, factor: 0.51 },
    { kind: "braking", startProgress: 0.145881, endProgress: 0.181381, factor: 0.75 },
    { kind: "corner", startProgress: 0.161048, endProgress: 0.209054, factor: 0.53 },
    { kind: "corner", startProgress: 0.171432, endProgress: 0.222432, factor: 0.45 },
    { kind: "corner", startProgress: 0.179381, endProgress: 0.225981, factor: 0.57 },
    { kind: "exit", startProgress: 0.1932, endProgress: 0.221942, factor: 1.11 },
    { kind: "exit", startProgress: 0.209054, endProgress: 0.237257, factor: 1.1 },
    { kind: "exit", startProgress: 0.222432, endProgress: 0.252432, factor: 1.12 },
    { kind: "exit", startProgress: 0.225981, endProgress: 0.253341, factor: 1.09 },
    { kind: "braking", startProgress: 0.495132, endProgress: 0.515514, factor: 0.94 },
    { kind: "corner", startProgress: 0.513514, endProgress: 0.548019, factor: 0.9 },
    { kind: "exit", startProgress: 0.548019, endProgress: 0.568123, factor: 1.02 },
    { kind: "braking", startProgress: 0.703214, endProgress: 0.744214, factor: 0.68 },
    { kind: "corner", startProgress: 0.742214, endProgress: 0.793214, factor: 0.45 },
    { kind: "braking", startProgress: 0.768973, endProgress: 0.806535, factor: 0.72 },
    { kind: "exit", startProgress: 0.793214, endProgress: 0.823214, factor: 1.12 },
    { kind: "corner", startProgress: 0.804535, endProgress: 0.852785, factor: 0.53 },
    { kind: "exit", startProgress: 0.852785, endProgress: 0.881134, factor: 1.1 },
    { kind: "straight", startProgress: 0.860498, endProgress: 0.019023, factor: 1.14 }
  ],
  "circuit_monaco_harbor_loop": [
    { kind: "braking", startProgress: 0.244027, endProgress: 0.2763, factor: 0.79 },
    { kind: "braking", startProgress: 0.25184, endProgress: 0.286405, factor: 0.76 },
    { kind: "corner", startProgress: 0.2743, endProgress: 0.318319, factor: 0.64 },
    { kind: "braking", startProgress: 0.275444, endProgress: 0.316444, factor: 0.68 },
    { kind: "corner", startProgress: 0.284405, endProgress: 0.330257, factor: 0.59 },
    { kind: "corner", startProgress: 0.314444, endProgress: 0.365444, factor: 0.45 },
    { kind: "exit", startProgress: 0.318319, endProgress: 0.34413, factor: 1.08 },
    { kind: "exit", startProgress: 0.330257, endProgress: 0.357168, factor: 1.09 },
    { kind: "exit", startProgress: 0.365444, endProgress: 0.395444, factor: 1.12 },
    { kind: "braking", startProgress: 0.450743, endProgress: 0.488101, factor: 0.73 },
    { kind: "braking", startProgress: 0.476642, endProgress: 0.502604, factor: 0.87 },
    { kind: "corner", startProgress: 0.486101, endProgress: 0.534187, factor: 0.53 },
    { kind: "corner", startProgress: 0.500604, endProgress: 0.539574, factor: 0.78 },
    { kind: "exit", startProgress: 0.534187, endProgress: 0.562439, factor: 1.1 },
    { kind: "exit", startProgress: 0.539574, endProgress: 0.562355, factor: 1.05 },
    { kind: "braking", startProgress: 0.54883, endProgress: 0.57539, factor: 0.86 },
    { kind: "corner", startProgress: 0.57339, endProgress: 0.612838, factor: 0.77 },
    { kind: "braking", startProgress: 0.585722, endProgress: 0.610104, factor: 0.89 },
    { kind: "corner", startProgress: 0.608104, endProgress: 0.645809, factor: 0.82 },
    { kind: "exit", startProgress: 0.612838, endProgress: 0.635907, factor: 1.05 },
    { kind: "exit", startProgress: 0.645809, endProgress: 0.667832, factor: 1.04 },
    { kind: "straight", startProgress: 0.92481, endProgress: 0.010253, factor: 1.14 }
  ],
  "circuit_monaco_casino_sprint": [
    { kind: "braking", startProgress: 0.242482, endProgress: 0.280433, factor: 0.72 },
    { kind: "braking", startProgress: 0.254903, endProgress: 0.29303, factor: 0.72 },
    { kind: "corner", startProgress: 0.278433, endProgress: 0.326994, factor: 0.52 },
    { kind: "corner", startProgress: 0.29103, endProgress: 0.339732, factor: 0.51 },
    { kind: "braking", startProgress: 0.312792, endProgress: 0.341393, factor: 0.84 },
    { kind: "braking", startProgress: 0.315468, endProgress: 0.344385, factor: 0.83 },
    { kind: "exit", startProgress: 0.326994, endProgress: 0.35553, factor: 1.11 },
    { kind: "corner", startProgress: 0.339393, endProgress: 0.380474, factor: 0.72 },
    { kind: "exit", startProgress: 0.339732, endProgress: 0.368353, factor: 1.11 },
    { kind: "corner", startProgress: 0.342385, endProgress: 0.383719, factor: 0.72 },
    { kind: "braking", startProgress: 0.344087, endProgress: 0.381445, factor: 0.73 },
    { kind: "braking", startProgress: 0.367298, endProgress: 0.393858, factor: 0.86 },
    { kind: "corner", startProgress: 0.379445, endProgress: 0.427531, factor: 0.53 },
    { kind: "exit", startProgress: 0.380474, endProgress: 0.404522, factor: 1.06 },
    { kind: "exit", startProgress: 0.383719, endProgress: 0.407919, factor: 1.06 },
    { kind: "corner", startProgress: 0.391858, endProgress: 0.431306, factor: 0.77 },
    { kind: "exit", startProgress: 0.427531, endProgress: 0.455783, factor: 1.1 },
    { kind: "exit", startProgress: 0.431306, endProgress: 0.454375, factor: 1.05 },
    { kind: "braking", startProgress: 0.758949, endProgress: 0.796624, factor: 0.72 },
    { kind: "corner", startProgress: 0.794624, endProgress: 0.842964, factor: 0.52 },
    { kind: "exit", startProgress: 0.842964, endProgress: 0.871368, factor: 1.1 },
    { kind: "straight", startProgress: 0.957526, endProgress: 0.005792, factor: 1.14 }
  ],
  "circuit_london_thames_loop": [
    { kind: "corner", startProgress: 0.014655, endProgress: 0.04814, factor: 0.93 },
    { kind: "exit", startProgress: 0.04814, endProgress: 0.067631, factor: 1.01 },
    { kind: "braking", startProgress: 0.11395, endProgress: 0.152642, factor: 0.71 },
    { kind: "corner", startProgress: 0.150642, endProgress: 0.199796, factor: 0.5 },
    { kind: "braking", startProgress: 0.175504, endProgress: 0.216504, factor: 0.68 },
    { kind: "exit", startProgress: 0.199796, endProgress: 0.228688, factor: 1.11 },
    { kind: "corner", startProgress: 0.214504, endProgress: 0.265504, factor: 0.45 },
    { kind: "braking", startProgress: 0.250747, endProgress: 0.289699, factor: 0.71 },
    { kind: "exit", startProgress: 0.265504, endProgress: 0.295504, factor: 1.12 },
    { kind: "corner", startProgress: 0.287699, endProgress: 0.337061, factor: 0.5 },
    { kind: "exit", startProgress: 0.337061, endProgress: 0.366077, factor: 1.11 },
    { kind: "braking", startProgress: 0.557202, endProgress: 0.574421, factor: 0.98 },
    { kind: "corner", startProgress: 0.572421, endProgress: 0.604396, factor: 0.97 },
    { kind: "exit", startProgress: 0.604396, endProgress: 0.622981, factor: 1.01 },
    { kind: "braking", startProgress: 0.666204, endProgress: 0.705282, factor: 0.7 },
    { kind: "corner", startProgress: 0.703282, endProgress: 0.752745, factor: 0.49 },
    { kind: "braking", startProgress: 0.721602, endProgress: 0.753513, factor: 0.8 },
    { kind: "corner", startProgress: 0.751513, endProgress: 0.795242, factor: 0.65 },
    { kind: "exit", startProgress: 0.752745, endProgress: 0.781822, factor: 1.11 },
    { kind: "exit", startProgress: 0.795242, endProgress: 0.820879, factor: 1.08 },
    { kind: "straight", startProgress: 0.876216, endProgress: 0.016879, factor: 1.14 },
    { kind: "braking", startProgress: 0.997549, endProgress: 0.016655, factor: 0.96 }
  ],
  "circuit_brussels_grand_place_loop": [
    { kind: "braking", startProgress: 0.52008, endProgress: 0.55938, factor: 0.7 },
    { kind: "braking", startProgress: 0.54065, endProgress: 0.574695, factor: 0.77 },
    { kind: "braking", startProgress: 0.552497, endProgress: 0.589113, factor: 0.74 },
    { kind: "corner", startProgress: 0.55738, endProgress: 0.60702, factor: 0.49 },
    { kind: "braking", startProgress: 0.566913, endProgress: 0.607913, factor: 0.68 },
    { kind: "corner", startProgress: 0.572695, endProgress: 0.618131, factor: 0.6 },
    { kind: "corner", startProgress: 0.587113, endProgress: 0.634606, factor: 0.55 },
    { kind: "braking", startProgress: 0.600744, endProgress: 0.637845, factor: 0.73 },
    { kind: "corner", startProgress: 0.605913, endProgress: 0.656913, factor: 0.45 },
    { kind: "exit", startProgress: 0.60702, endProgress: 0.636204, factor: 1.11 },
    { kind: "exit", startProgress: 0.618131, endProgress: 0.644793, factor: 1.09 },
    { kind: "exit", startProgress: 0.634606, endProgress: 0.662502, factor: 1.1 },
    { kind: "corner", startProgress: 0.635845, endProgress: 0.683726, factor: 0.54 },
    { kind: "exit", startProgress: 0.656913, endProgress: 0.686913, factor: 1.12 },
    { kind: "braking", startProgress: 0.661499, endProgress: 0.696488, factor: 0.76 },
    { kind: "exit", startProgress: 0.683726, endProgress: 0.711855, factor: 1.1 },
    { kind: "corner", startProgress: 0.694488, endProgress: 0.740679, factor: 0.58 },
    { kind: "exit", startProgress: 0.740679, endProgress: 0.767794, factor: 1.09 },
    { kind: "braking", startProgress: 0.783013, endProgress: 0.822047, factor: 0.71 },
    { kind: "corner", startProgress: 0.820047, endProgress: 0.869474, factor: 0.49 },
    { kind: "exit", startProgress: 0.869474, endProgress: 0.898531, factor: 1.11 },
    { kind: "straight", startProgress: 0.911991, endProgress: 0.012002, factor: 1.14 }
  ],
  "circuit_prague_vltava_loop": [
    { kind: "braking", startProgress: 0.174484, endProgress: 0.213571, factor: 0.7 },
    { kind: "braking", startProgress: 0.200261, endProgress: 0.225079, factor: 0.89 },
    { kind: "corner", startProgress: 0.211571, endProgress: 0.26104, factor: 0.49 },
    { kind: "corner", startProgress: 0.223079, endProgress: 0.261133, factor: 0.81 },
    { kind: "exit", startProgress: 0.26104, endProgress: 0.290122, factor: 1.11 },
    { kind: "exit", startProgress: 0.261133, endProgress: 0.283366, factor: 1.04 },
    { kind: "braking", startProgress: 0.436888, endProgress: 0.476958, factor: 0.69 },
    { kind: "braking", startProgress: 0.45344, endProgress: 0.48793, factor: 0.76 },
    { kind: "braking", startProgress: 0.464801, endProgress: 0.499342, factor: 0.76 },
    { kind: "corner", startProgress: 0.474958, endProgress: 0.525214, factor: 0.47 },
    { kind: "corner", startProgress: 0.48593, endProgress: 0.531722, factor: 0.59 },
    { kind: "corner", startProgress: 0.497342, endProgress: 0.543175, factor: 0.59 },
    { kind: "braking", startProgress: 0.519363, endProgress: 0.538355, factor: 0.96 },
    { kind: "exit", startProgress: 0.525214, endProgress: 0.554768, factor: 1.12 },
    { kind: "exit", startProgress: 0.531722, endProgress: 0.558597, factor: 1.09 },
    { kind: "corner", startProgress: 0.536355, endProgress: 0.569748, factor: 0.93 },
    { kind: "exit", startProgress: 0.543175, endProgress: 0.570074, factor: 1.09 },
    { kind: "exit", startProgress: 0.569748, endProgress: 0.589184, factor: 1.01 },
    { kind: "braking", startProgress: 0.624349, endProgress: 0.665124, factor: 0.68 },
    { kind: "corner", startProgress: 0.663124, endProgress: 0.713944, factor: 0.45 },
    { kind: "straight", startProgress: 0.669093, endProgress: 0.045124, factor: 1.14 },
    { kind: "exit", startProgress: 0.713944, endProgress: 0.743836, factor: 1.12 }
  ],
  "circuit_copenhagen_harbor_loop": [
    { kind: "braking", startProgress: 0.002911, endProgress: 0.038388, factor: 0.75 },
    { kind: "corner", startProgress: 0.036388, endProgress: 0.08297, factor: 0.57 },
    { kind: "exit", startProgress: 0.08297, endProgress: 0.110319, factor: 1.09 },
    { kind: "braking", startProgress: 0.15308, endProgress: 0.186655, factor: 0.78 },
    { kind: "corner", startProgress: 0.184655, endProgress: 0.229715, factor: 0.61 },
    { kind: "exit", startProgress: 0.229715, endProgress: 0.256151, factor: 1.08 },
    { kind: "braking", startProgress: 0.273757, endProgress: 0.296048, factor: 0.92 },
    { kind: "corner", startProgress: 0.294048, endProgress: 0.330081, factor: 0.86 },
    { kind: "exit", startProgress: 0.330081, endProgress: 0.351101, factor: 1.03 },
    { kind: "braking", startProgress: 0.350292, endProgress: 0.381928, factor: 0.8 },
    { kind: "corner", startProgress: 0.379928, endProgress: 0.423437, factor: 0.66 },
    { kind: "braking", startProgress: 0.383054, endProgress: 0.41133, factor: 0.84 },
    { kind: "corner", startProgress: 0.40933, endProgress: 0.450151, factor: 0.73 },
    { kind: "exit", startProgress: 0.423437, endProgress: 0.448942, factor: 1.08 },
    { kind: "exit", startProgress: 0.450151, endProgress: 0.474043, factor: 1.06 },
    { kind: "braking", startProgress: 0.599278, endProgress: 0.627953, factor: 0.84 },
    { kind: "corner", startProgress: 0.625953, endProgress: 0.667093, factor: 0.72 },
    { kind: "exit", startProgress: 0.667093, endProgress: 0.691176, factor: 1.06 },
    { kind: "straight", startProgress: 0.689455, endProgress: 0.042348, factor: 1.14 }
  ],
  "circuit_stockholm_gamla_stan_loop": [
    { kind: "braking", startProgress: 0.216019, endProgress: 0.236328, factor: 0.94 },
    { kind: "corner", startProgress: 0.234328, endProgress: 0.268775, factor: 0.91 },
    { kind: "exit", startProgress: 0.268775, endProgress: 0.288843, factor: 1.02 },
    { kind: "braking", startProgress: 0.591349, endProgress: 0.622373, factor: 0.81 },
    { kind: "braking", startProgress: 0.598176, endProgress: 0.633766, factor: 0.75 },
    { kind: "braking", startProgress: 0.61839, endProgress: 0.657914, factor: 0.7 },
    { kind: "corner", startProgress: 0.620373, endProgress: 0.663392, factor: 0.67 },
    { kind: "corner", startProgress: 0.631766, endProgress: 0.678438, factor: 0.57 },
    { kind: "corner", startProgress: 0.655914, endProgress: 0.705733, factor: 0.48 },
    { kind: "exit", startProgress: 0.663392, endProgress: 0.688603, factor: 1.07 },
    { kind: "exit", startProgress: 0.678438, endProgress: 0.705841, factor: 1.09 },
    { kind: "exit", startProgress: 0.705733, endProgress: 0.735025, factor: 1.11 },
    { kind: "braking", startProgress: 0.716528, endProgress: 0.748394, factor: 0.8 },
    { kind: "corner", startProgress: 0.746394, endProgress: 0.790087, factor: 0.65 },
    { kind: "exit", startProgress: 0.790087, endProgress: 0.815702, factor: 1.08 },
    { kind: "braking", startProgress: 0.800134, endProgress: 0.829057, factor: 0.83 },
    { kind: "corner", startProgress: 0.827057, endProgress: 0.868396, factor: 0.72 },
    { kind: "exit", startProgress: 0.868396, endProgress: 0.892599, factor: 1.06 },
    { kind: "braking", startProgress: 0.88136, endProgress: 0.90537, factor: 0.9 },
    { kind: "corner", startProgress: 0.90337, endProgress: 0.940778, factor: 0.82 },
    { kind: "straight", startProgress: 0.909336, endProgress: 0.012363, factor: 1.14 },
    { kind: "exit", startProgress: 0.940778, endProgress: 0.962623, factor: 1.04 }
  ],
  "circuit_cannes_houssam_loop": [
    { kind: "braking", startProgress: 0.011534, endProgress: 0.052534, factor: 0.68 },
    { kind: "corner", startProgress: 0.050534, endProgress: 0.101534, factor: 0.45 },
    { kind: "braking", startProgress: 0.099831, endProgress: 0.122492, factor: 0.91 },
    { kind: "exit", startProgress: 0.101534, endProgress: 0.131534, factor: 1.12 },
    { kind: "corner", startProgress: 0.120492, endProgress: 0.156821, factor: 0.85 },
    { kind: "exit", startProgress: 0.156821, endProgress: 0.178019, factor: 1.03 },
    { kind: "braking", startProgress: 0.16283, endProgress: 0.196303, factor: 0.78 },
    { kind: "corner", startProgress: 0.194303, endProgress: 0.239281, factor: 0.62 },
    { kind: "braking", startProgress: 0.22767, endProgress: 0.250647, factor: 0.91 },
    { kind: "exit", startProgress: 0.239281, endProgress: 0.265668, factor: 1.08 },
    { kind: "corner", startProgress: 0.248647, endProgress: 0.285229, factor: 0.85 },
    { kind: "exit", startProgress: 0.285229, endProgress: 0.306578, factor: 1.03 },
    { kind: "braking", startProgress: 0.459508, endProgress: 0.499523, factor: 0.69 },
    { kind: "corner", startProgress: 0.497523, endProgress: 0.547735, factor: 0.47 },
    { kind: "exit", startProgress: 0.547735, endProgress: 0.577262, factor: 1.12 },
    { kind: "braking", startProgress: 0.722369, endProgress: 0.74219, factor: 0.95 },
    { kind: "corner", startProgress: 0.74019, endProgress: 0.774247, factor: 0.92 },
    { kind: "exit", startProgress: 0.774247, endProgress: 0.794081, factor: 1.02 },
    { kind: "braking", startProgress: 0.810656, endProgress: 0.831567, factor: 0.94 },
    { kind: "corner", startProgress: 0.829567, endProgress: 0.864496, factor: 0.89 },
    { kind: "straight", startProgress: 0.837613, endProgress: 0.022143, factor: 1.14 },
    { kind: "exit", startProgress: 0.864496, endProgress: 0.884853, factor: 1.02 }
  ],
  "circuit_tokyo_bay_loop": [
    { kind: "braking", startProgress: 0.091897, endProgress: 0.132897, factor: 0.68 },
    { kind: "braking", startProgress: 0.117953, endProgress: 0.148012, factor: 0.82 },
    { kind: "corner", startProgress: 0.130897, endProgress: 0.181897, factor: 0.45 },
    { kind: "braking", startProgress: 0.144977, endProgress: 0.171416, factor: 0.87 },
    { kind: "corner", startProgress: 0.146012, endProgress: 0.188259, factor: 0.69 },
    { kind: "braking", startProgress: 0.155901, endProgress: 0.196901, factor: 0.68 },
    { kind: "corner", startProgress: 0.169416, endProgress: 0.208768, factor: 0.77 },
    { kind: "braking", startProgress: 0.176558, endProgress: 0.210118, factor: 0.78 },
    { kind: "exit", startProgress: 0.181897, endProgress: 0.211897, factor: 1.12 },
    { kind: "exit", startProgress: 0.188259, endProgress: 0.213007, factor: 1.07 },
    { kind: "corner", startProgress: 0.194901, endProgress: 0.245901, factor: 0.45 },
    { kind: "corner", startProgress: 0.208118, endProgress: 0.253166, factor: 0.61 },
    { kind: "exit", startProgress: 0.208768, endProgress: 0.231778, factor: 1.05 },
    { kind: "exit", startProgress: 0.245901, endProgress: 0.275901, factor: 1.12 },
    { kind: "exit", startProgress: 0.253166, endProgress: 0.279595, factor: 1.08 },
    { kind: "braking", startProgress: 0.402, endProgress: 0.43039, factor: 0.84 },
    { kind: "corner", startProgress: 0.42839, endProgress: 0.469302, factor: 0.73 },
    { kind: "exit", startProgress: 0.469302, endProgress: 0.493249, factor: 1.06 },
    { kind: "braking", startProgress: 0.615195, endProgress: 0.646754, factor: 0.8 },
    { kind: "corner", startProgress: 0.644754, endProgress: 0.688201, factor: 0.66 },
    { kind: "exit", startProgress: 0.688201, endProgress: 0.71367, factor: 1.07 },
    { kind: "straight", startProgress: 0.822706, endProgress: 0.024176, factor: 1.14 }
  ],
  "circuit_rio_flamengo_loop": [
    { kind: "corner", startProgress: 0.015571, endProgress: 0.066324, factor: 0.46 },
    { kind: "exit", startProgress: 0.066324, endProgress: 0.096176, factor: 1.12 },
    { kind: "braking", startProgress: 0.119036, endProgress: 0.149002, factor: 0.82 },
    { kind: "corner", startProgress: 0.147002, endProgress: 0.189175, factor: 0.69 },
    { kind: "exit", startProgress: 0.189175, endProgress: 0.213879, factor: 1.07 },
    { kind: "braking", startProgress: 0.490168, endProgress: 0.531168, factor: 0.68 },
    { kind: "braking", startProgress: 0.526214, endProgress: 0.558419, factor: 0.79 },
    { kind: "corner", startProgress: 0.529168, endProgress: 0.580168, factor: 0.45 },
    { kind: "corner", startProgress: 0.556419, endProgress: 0.600383, factor: 0.64 },
    { kind: "exit", startProgress: 0.580168, endProgress: 0.610168, factor: 1.12 },
    { kind: "exit", startProgress: 0.600383, endProgress: 0.626162, factor: 1.08 },
    { kind: "braking", startProgress: 0.601616, endProgress: 0.642616, factor: 0.68 },
    { kind: "corner", startProgress: 0.640616, endProgress: 0.691616, factor: 0.45 },
    { kind: "exit", startProgress: 0.691616, endProgress: 0.721616, factor: 1.12 },
    { kind: "braking", startProgress: 0.794899, endProgress: 0.835154, factor: 0.69 },
    { kind: "braking", startProgress: 0.803558, endProgress: 0.837865, factor: 0.77 },
    { kind: "corner", startProgress: 0.833154, endProgress: 0.883558, factor: 0.47 },
    { kind: "corner", startProgress: 0.835865, endProgress: 0.88151, factor: 0.6 },
    { kind: "straight", startProgress: 0.841864, endProgress: 0.021564, factor: 1.14 },
    { kind: "exit", startProgress: 0.88151, endProgress: 0.908298, factor: 1.09 },
    { kind: "exit", startProgress: 0.883558, endProgress: 0.913201, factor: 1.12 },
    { kind: "braking", startProgress: 0.97688, endProgress: 0.017571, factor: 0.68 }
  ],
  "circuit_cape_town_waterfront_loop": [
    { kind: "braking", startProgress: 0.105691, endProgress: 0.143114, factor: 0.73 },
    { kind: "corner", startProgress: 0.141114, endProgress: 0.189252, factor: 0.53 },
    { kind: "exit", startProgress: 0.189252, endProgress: 0.217536, factor: 1.1 },
    { kind: "braking", startProgress: 0.215893, endProgress: 0.25185, factor: 0.74 },
    { kind: "braking", startProgress: 0.234303, endProgress: 0.274415, factor: 0.69 },
    { kind: "corner", startProgress: 0.24985, endProgress: 0.296815, factor: 0.56 },
    { kind: "corner", startProgress: 0.272415, endProgress: 0.322704, factor: 0.47 },
    { kind: "braking", startProgress: 0.289794, endProgress: 0.317795, factor: 0.85 },
    { kind: "exit", startProgress: 0.296815, endProgress: 0.324395, factor: 1.1 },
    { kind: "corner", startProgress: 0.315795, endProgress: 0.356396, factor: 0.74 },
    { kind: "exit", startProgress: 0.322704, endProgress: 0.352278, factor: 1.12 },
    { kind: "exit", startProgress: 0.356396, endProgress: 0.380157, factor: 1.06 },
    { kind: "braking", startProgress: 0.484677, endProgress: 0.521539, factor: 0.73 },
    { kind: "braking", startProgress: 0.500526, endProgress: 0.537481, factor: 0.73 },
    { kind: "corner", startProgress: 0.519539, endProgress: 0.567228, factor: 0.54 },
    { kind: "corner", startProgress: 0.535481, endProgress: 0.583245, factor: 0.54 },
    { kind: "exit", startProgress: 0.567228, endProgress: 0.595242, factor: 1.1 },
    { kind: "exit", startProgress: 0.583245, endProgress: 0.611304, factor: 1.1 },
    { kind: "braking", startProgress: 0.769912, endProgress: 0.804086, factor: 0.77 },
    { kind: "corner", startProgress: 0.802086, endProgress: 0.847625, factor: 0.6 },
    { kind: "straight", startProgress: 0.838768, endProgress: 0.021987, factor: 1.14 },
    { kind: "exit", startProgress: 0.847625, endProgress: 0.874349, factor: 1.09 }
  ],
  "circuit_seoul_yeouido_loop": [
    { kind: "corner", startProgress: 0.033923, endProgress: 0.084923, factor: 0.45 },
    { kind: "exit", startProgress: 0.084923, endProgress: 0.114923, factor: 1.12 },
    { kind: "braking", startProgress: 0.167212, endProgress: 0.189111, factor: 0.92 },
    { kind: "corner", startProgress: 0.187111, endProgress: 0.222831, factor: 0.87 },
    { kind: "exit", startProgress: 0.222831, endProgress: 0.243662, factor: 1.03 },
    { kind: "braking", startProgress: 0.275399, endProgress: 0.302382, factor: 0.86 },
    { kind: "corner", startProgress: 0.300382, endProgress: 0.340169, factor: 0.76 },
    { kind: "braking", startProgress: 0.322202, endProgress: 0.341835, factor: 0.95 },
    { kind: "corner", startProgress: 0.339835, endProgress: 0.373741, factor: 0.92 },
    { kind: "exit", startProgress: 0.340169, endProgress: 0.363441, factor: 1.05 },
    { kind: "exit", startProgress: 0.373741, endProgress: 0.393485, factor: 1.02 },
    { kind: "braking", startProgress: 0.469863, endProgress: 0.510863, factor: 0.68 },
    { kind: "corner", startProgress: 0.508863, endProgress: 0.559863, factor: 0.45 },
    { kind: "exit", startProgress: 0.559863, endProgress: 0.589863, factor: 1.12 },
    { kind: "braking", startProgress: 0.675477, endProgress: 0.703147, factor: 0.85 },
    { kind: "corner", startProgress: 0.701147, endProgress: 0.741483, factor: 0.74 },
    { kind: "straight", startProgress: 0.707165, endProgress: 0.039932, factor: 1.14 },
    { kind: "exit", startProgress: 0.741483, endProgress: 0.765085, factor: 1.06 },
    { kind: "braking", startProgress: 0.994923, endProgress: 0.035923, factor: 0.68 }
  ],
  "circuit_montreal_island_loop": [
    { kind: "braking", startProgress: 0.006401, endProgress: 0.047401, factor: 0.68 },
    { kind: "corner", startProgress: 0.045401, endProgress: 0.096401, factor: 0.45 },
    { kind: "exit", startProgress: 0.096401, endProgress: 0.126401, factor: 1.12 },
    { kind: "braking", startProgress: 0.105284, endProgress: 0.137804, factor: 0.79 },
    { kind: "corner", startProgress: 0.135804, endProgress: 0.18002, factor: 0.64 },
    { kind: "braking", startProgress: 0.139328, endProgress: 0.173753, factor: 0.76 },
    { kind: "braking", startProgress: 0.167996, endProgress: 0.203235, factor: 0.75 },
    { kind: "corner", startProgress: 0.171753, endProgress: 0.217493, factor: 0.59 },
    { kind: "exit", startProgress: 0.18002, endProgress: 0.20595, factor: 1.08 },
    { kind: "corner", startProgress: 0.201235, endProgress: 0.247626, factor: 0.58 },
    { kind: "exit", startProgress: 0.217493, endProgress: 0.244337, factor: 1.09 },
    { kind: "exit", startProgress: 0.247626, endProgress: 0.274861, factor: 1.09 },
    { kind: "braking", startProgress: 0.436075, endProgress: 0.465591, factor: 0.83 },
    { kind: "corner", startProgress: 0.463591, endProgress: 0.505404, factor: 0.7 },
    { kind: "braking", startProgress: 0.493197, endProgress: 0.517967, factor: 0.89 },
    { kind: "exit", startProgress: 0.505404, endProgress: 0.529891, factor: 1.06 },
    { kind: "corner", startProgress: 0.515967, endProgress: 0.553983, factor: 0.81 },
    { kind: "exit", startProgress: 0.553983, endProgress: 0.576193, factor: 1.04 },
    { kind: "braking", startProgress: 0.578079, endProgress: 0.619079, factor: 0.68 },
    { kind: "corner", startProgress: 0.617079, endProgress: 0.668079, factor: 0.45 },
    { kind: "straight", startProgress: 0.62308, endProgress: 0.051398, factor: 1.14 },
    { kind: "exit", startProgress: 0.668079, endProgress: 0.698079, factor: 1.12 }
  ],
  "circuit_istanbul_bosphorus_loop": [
    { kind: "braking", startProgress: 0.083189, endProgress: 0.124189, factor: 0.68 },
    { kind: "corner", startProgress: 0.122189, endProgress: 0.173189, factor: 0.45 },
    { kind: "exit", startProgress: 0.173189, endProgress: 0.203189, factor: 1.12 },
    { kind: "braking", startProgress: 0.183347, endProgress: 0.224347, factor: 0.68 },
    { kind: "corner", startProgress: 0.222347, endProgress: 0.273347, factor: 0.45 },
    { kind: "exit", startProgress: 0.273347, endProgress: 0.303347, factor: 1.12 },
    { kind: "braking", startProgress: 0.679851, endProgress: 0.713791, factor: 0.77 },
    { kind: "braking", startProgress: 0.69937, endProgress: 0.732922, factor: 0.78 },
    { kind: "corner", startProgress: 0.711791, endProgress: 0.757143, factor: 0.61 },
    { kind: "corner", startProgress: 0.730922, endProgress: 0.775964, factor: 0.61 },
    { kind: "braking", startProgress: 0.735873, endProgress: 0.77273, factor: 0.73 },
    { kind: "braking", startProgress: 0.748198, endProgress: 0.784397, factor: 0.74 },
    { kind: "exit", startProgress: 0.757143, endProgress: 0.783755, factor: 1.09 },
    { kind: "braking", startProgress: 0.765997, endProgress: 0.803472, factor: 0.73 },
    { kind: "corner", startProgress: 0.77073, endProgress: 0.818416, factor: 0.54 },
    { kind: "exit", startProgress: 0.775964, endProgress: 0.802389, factor: 1.08 },
    { kind: "corner", startProgress: 0.782397, endProgress: 0.829556, factor: 0.56 },
    { kind: "corner", startProgress: 0.801472, endProgress: 0.849652, factor: 0.53 },
    { kind: "exit", startProgress: 0.818416, endProgress: 0.846427, factor: 1.1 },
    { kind: "exit", startProgress: 0.829556, endProgress: 0.857251, factor: 1.1 },
    { kind: "straight", startProgress: 0.836454, endProgress: 0.022301, factor: 1.14 },
    { kind: "exit", startProgress: 0.849652, endProgress: 0.87796, factor: 1.1 }
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
