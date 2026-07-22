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
    { kind: "braking", startProgress: 0.008762, endProgress: 0.032584, factor: 0.83 },
    { kind: "exit", startProgress: 0.017693, endProgress: 0.039693, factor: 1 },
    { kind: "corner", startProgress: 0.030584, endProgress: 0.064951, factor: 0.71 },
    { kind: "braking", startProgress: 0.062799, endProgress: 0.0868, factor: 0.82 },
    { kind: "exit", startProgress: 0.064951, endProgress: 0.085862, factor: 1.01 },
    { kind: "corner", startProgress: 0.0848, endProgress: 0.119301, factor: 0.7 },
    { kind: "exit", startProgress: 0.119301, endProgress: 0.140301, factor: 1.01 },
    { kind: "braking", startProgress: 0.140121, endProgress: 0.166121, factor: 0.8 },
    { kind: "corner", startProgress: 0.164121, endProgress: 0.200121, factor: 0.66 },
    { kind: "straight", startProgress: 0.170137, endProgress: 0.250962, factor: 1.08 },
    { kind: "exit", startProgress: 0.200121, endProgress: 0.222121, factor: 1 },
    { kind: "braking", startProgress: 0.302166, endProgress: 0.319503, factor: 0.91 },
    { kind: "braking", startProgress: 0.315217, endProgress: 0.340277, factor: 0.81 },
    { kind: "corner", startProgress: 0.317503, endProgress: 0.347006, factor: 0.84 },
    { kind: "corner", startProgress: 0.338277, endProgress: 0.373572, factor: 0.68 },
    { kind: "exit", startProgress: 0.347006, endProgress: 0.364675, factor: 1.04 },
    { kind: "exit", startProgress: 0.373572, endProgress: 0.395102, factor: 1 },
    { kind: "braking", startProgress: 0.693538, endProgress: 0.707393, factor: 0.95 },
    { kind: "corner", startProgress: 0.705393, endProgress: 0.732284, factor: 0.92 },
    { kind: "exit", startProgress: 0.732284, endProgress: 0.748211, factor: 1.05 },
    { kind: "braking", startProgress: 0.957693, endProgress: 0.983693, factor: 0.8 },
    { kind: "corner", startProgress: 0.981693, endProgress: 0.017693, factor: 0.66 }
  ],
  "circuit_left_bank_loop": [
    { kind: "straight", startProgress: 0.036893, endProgress: 0.270098, factor: 1.08 },
    { kind: "braking", startProgress: 0.243212, endProgress: 0.266077, factor: 0.84 },
    { kind: "corner", startProgress: 0.264077, endProgress: 0.297726, factor: 0.73 },
    { kind: "exit", startProgress: 0.297726, endProgress: 0.318158, factor: 1.01 },
    { kind: "braking", startProgress: 0.35715, endProgress: 0.379532, factor: 0.85 },
    { kind: "corner", startProgress: 0.377532, endProgress: 0.410818, factor: 0.74 },
    { kind: "exit", startProgress: 0.410818, endProgress: 0.431009, factor: 1.02 },
    { kind: "braking", startProgress: 0.478444, endProgress: 0.496378, factor: 0.9 },
    { kind: "corner", startProgress: 0.494378, endProgress: 0.524328, factor: 0.83 },
    { kind: "braking", startProgress: 0.512732, endProgress: 0.538732, factor: 0.8 },
    { kind: "exit", startProgress: 0.524328, endProgress: 0.542295, factor: 1.04 },
    { kind: "corner", startProgress: 0.536732, endProgress: 0.572732, factor: 0.66 },
    { kind: "exit", startProgress: 0.572732, endProgress: 0.594732, factor: 1 },
    { kind: "braking", startProgress: 0.643203, endProgress: 0.667389, factor: 0.82 },
    { kind: "corner", startProgress: 0.665389, endProgress: 0.700028, factor: 0.7 },
    { kind: "braking", startProgress: 0.693336, endProgress: 0.719336, factor: 0.8 },
    { kind: "exit", startProgress: 0.700028, endProgress: 0.721121, factor: 1.01 },
    { kind: "corner", startProgress: 0.717336, endProgress: 0.753336, factor: 0.66 },
    { kind: "exit", startProgress: 0.753336, endProgress: 0.775336, factor: 1 },
    { kind: "braking", startProgress: 0.860713, endProgress: 0.886713, factor: 0.8 },
    { kind: "corner", startProgress: 0.884713, endProgress: 0.920713, factor: 0.66 },
    { kind: "exit", startProgress: 0.920713, endProgress: 0.942713, factor: 1 }
  ],
  "circuit_canal_loop": [
    { kind: "braking", startProgress: 0.173805, endProgress: 0.197024, factor: 0.83 },
    { kind: "corner", startProgress: 0.195024, endProgress: 0.228938, factor: 0.72 },
    { kind: "braking", startProgress: 0.205933, endProgress: 0.229212, factor: 0.83 },
    { kind: "braking", startProgress: 0.224784, endProgress: 0.249373, factor: 0.82 },
    { kind: "corner", startProgress: 0.227212, endProgress: 0.261171, factor: 0.72 },
    { kind: "exit", startProgress: 0.228938, endProgress: 0.249548, factor: 1.01 },
    { kind: "corner", startProgress: 0.247373, endProgress: 0.282315, factor: 0.69 },
    { kind: "exit", startProgress: 0.261171, endProgress: 0.281811, factor: 1.01 },
    { kind: "exit", startProgress: 0.282315, endProgress: 0.30361, factor: 1.01 },
    { kind: "braking", startProgress: 0.380717, endProgress: 0.403052, factor: 0.85 },
    { kind: "braking", startProgress: 0.391222, endProgress: 0.414531, factor: 0.83 },
    { kind: "corner", startProgress: 0.401052, endProgress: 0.434304, factor: 0.74 },
    { kind: "corner", startProgress: 0.412531, endProgress: 0.446513, factor: 0.72 },
    { kind: "exit", startProgress: 0.434304, endProgress: 0.454471, factor: 1.02 },
    { kind: "exit", startProgress: 0.446513, endProgress: 0.467167, factor: 1.01 },
    { kind: "braking", startProgress: 0.476048, endProgress: 0.496309, factor: 0.87 },
    { kind: "corner", startProgress: 0.494309, endProgress: 0.526005, factor: 0.78 },
    { kind: "exit", startProgress: 0.526005, endProgress: 0.545135, factor: 1.03 },
    { kind: "straight", startProgress: 0.676507, endProgress: 0.840997, factor: 1.08 },
    { kind: "braking", startProgress: 0.899583, endProgress: 0.915315, factor: 0.93 },
    { kind: "corner", startProgress: 0.913315, endProgress: 0.941614, factor: 0.88 },
    { kind: "exit", startProgress: 0.941614, endProgress: 0.95848, factor: 1.04 }
  ],
  "circuit_harbor_sprint": [
    { kind: "straight", startProgress: 0.32183, endProgress: 0.552661, factor: 1.08 },
    { kind: "braking", startProgress: 0.587871, endProgress: 0.612583, factor: 0.82 },
    { kind: "corner", startProgress: 0.610583, endProgress: 0.645617, factor: 0.69 },
    { kind: "exit", startProgress: 0.645617, endProgress: 0.666973, factor: 1.01 },
    { kind: "braking", startProgress: 0.84364, endProgress: 0.866466, factor: 0.84 },
    { kind: "corner", startProgress: 0.864466, endProgress: 0.898086, factor: 0.73 },
    { kind: "exit", startProgress: 0.898086, endProgress: 0.918499, factor: 1.01 },
    { kind: "braking", startProgress: 0.936882, endProgress: 0.957674, factor: 0.87 },
    { kind: "corner", startProgress: 0.955674, endProgress: 0.987768, factor: 0.77 },
    { kind: "exit", startProgress: 0.987768, endProgress: 0.007164, factor: 1.02 }
  ],
  "circuit_ring_sector": [
    { kind: "braking", startProgress: 0.426205, endProgress: 0.446707, factor: 0.87 },
    { kind: "corner", startProgress: 0.444707, endProgress: 0.476584, factor: 0.78 },
    { kind: "exit", startProgress: 0.476584, endProgress: 0.495835, factor: 1.02 },
    { kind: "braking", startProgress: 0.546066, endProgress: 0.567983, factor: 0.85 },
    { kind: "corner", startProgress: 0.565983, endProgress: 0.598921, factor: 0.75 },
    { kind: "exit", startProgress: 0.598921, endProgress: 0.618879, factor: 1.02 },
    { kind: "braking", startProgress: 0.602175, endProgress: 0.625488, factor: 0.83 },
    { kind: "corner", startProgress: 0.623488, endProgress: 0.657473, factor: 0.72 },
    { kind: "exit", startProgress: 0.657473, endProgress: 0.678129, factor: 1.01 },
    { kind: "straight", startProgress: 0.692274, endProgress: 0.836726, factor: 1.08 }
  ],
  "circuit_mitte_dash": [
    { kind: "exit", startProgress: 0.020428, endProgress: 0.039996, factor: 1.02 },
    { kind: "straight", startProgress: 0.260941, endProgress: 0.358161, factor: 1.08 },
    { kind: "braking", startProgress: 0.438274, endProgress: 0.464274, factor: 0.8 },
    { kind: "corner", startProgress: 0.462274, endProgress: 0.498274, factor: 0.66 },
    { kind: "braking", startProgress: 0.488674, endProgress: 0.514674, factor: 0.8 },
    { kind: "exit", startProgress: 0.498274, endProgress: 0.520274, factor: 1 },
    { kind: "corner", startProgress: 0.512674, endProgress: 0.548674, factor: 0.66 },
    { kind: "exit", startProgress: 0.548674, endProgress: 0.570674, factor: 1 },
    { kind: "braking", startProgress: 0.664626, endProgress: 0.690626, factor: 0.8 },
    { kind: "corner", startProgress: 0.688626, endProgress: 0.724626, factor: 0.66 },
    { kind: "exit", startProgress: 0.724626, endProgress: 0.746626, factor: 1 },
    { kind: "braking", startProgress: 0.770853, endProgress: 0.796205, factor: 0.81 },
    { kind: "corner", startProgress: 0.794205, endProgress: 0.829719, factor: 0.67 },
    { kind: "braking", startProgress: 0.794943, endProgress: 0.816945, factor: 0.85 },
    { kind: "corner", startProgress: 0.814945, endProgress: 0.847946, factor: 0.74 },
    { kind: "exit", startProgress: 0.829719, endProgress: 0.851395, factor: 1 },
    { kind: "exit", startProgress: 0.847946, endProgress: 0.867947, factor: 1.02 },
    { kind: "braking", startProgress: 0.919366, endProgress: 0.942876, factor: 0.83 },
    { kind: "corner", startProgress: 0.940876, endProgress: 0.975008, factor: 0.71 },
    { kind: "braking", startProgress: 0.968938, endProgress: 0.990075, factor: 0.86 },
    { kind: "exit", startProgress: 0.975008, endProgress: 0.995763, factor: 1.01 },
    { kind: "corner", startProgress: 0.988075, endProgress: 0.020428, factor: 0.76 }
  ],
  "circuit_rome_tiber_loop": [
    { kind: "exit", startProgress: 0.018416, endProgress: 0.03881, factor: 1.01 },
    { kind: "braking", startProgress: 0.106196, endProgress: 0.129626, factor: 0.83 },
    { kind: "braking", startProgress: 0.114364, endProgress: 0.137504, factor: 0.84 },
    { kind: "corner", startProgress: 0.127626, endProgress: 0.161698, factor: 0.71 },
    { kind: "corner", startProgress: 0.135504, endProgress: 0.169359, factor: 0.72 },
    { kind: "exit", startProgress: 0.161698, endProgress: 0.182413, factor: 1.01 },
    { kind: "exit", startProgress: 0.169359, endProgress: 0.189929, factor: 1.01 },
    { kind: "braking", startProgress: 0.262012, endProgress: 0.284083, factor: 0.85 },
    { kind: "corner", startProgress: 0.282083, endProgress: 0.315136, factor: 0.74 },
    { kind: "exit", startProgress: 0.315136, endProgress: 0.335171, factor: 1.02 },
    { kind: "straight", startProgress: 0.44991, endProgress: 0.655415, factor: 1.08 },
    { kind: "braking", startProgress: 0.694179, endProgress: 0.720179, factor: 0.8 },
    { kind: "corner", startProgress: 0.718179, endProgress: 0.754179, factor: 0.66 },
    { kind: "exit", startProgress: 0.754179, endProgress: 0.776179, factor: 1 },
    { kind: "braking", startProgress: 0.964039, endProgress: 0.986826, factor: 0.84 },
    { kind: "corner", startProgress: 0.984826, endProgress: 0.018416, factor: 0.73 }
  ],
  "circuit_lisbon_baixa_loop": [
    { kind: "braking", startProgress: 0.274362, endProgress: 0.299127, factor: 0.82 },
    { kind: "corner", startProgress: 0.297127, endProgress: 0.332201, factor: 0.69 },
    { kind: "exit", startProgress: 0.332201, endProgress: 0.353584, factor: 1.01 },
    { kind: "braking", startProgress: 0.401864, endProgress: 0.426703, factor: 0.81 },
    { kind: "corner", startProgress: 0.424703, endProgress: 0.459832, factor: 0.68 },
    { kind: "exit", startProgress: 0.459832, endProgress: 0.481252, factor: 1.01 },
    { kind: "straight", startProgress: 0.679354, endProgress: 0.826144, factor: 1.08 }
  ],
  "circuit_vienna_ring_loop": [
    { kind: "exit", startProgress: 0.006811, endProgress: 0.027539, factor: 1.01 },
    { kind: "braking", startProgress: 0.103072, endProgress: 0.116912, factor: 0.95 },
    { kind: "corner", startProgress: 0.114912, endProgress: 0.141792, factor: 0.92 },
    { kind: "straight", startProgress: 0.13091, endProgress: 0.279342, factor: 1.08 },
    { kind: "exit", startProgress: 0.141792, endProgress: 0.157712, factor: 1.05 },
    { kind: "braking", startProgress: 0.862943, endProgress: 0.885957, factor: 0.84 },
    { kind: "corner", startProgress: 0.883957, endProgress: 0.917718, factor: 0.72 },
    { kind: "braking", startProgress: 0.902108, endProgress: 0.927094, factor: 0.81 },
    { kind: "braking", startProgress: 0.916949, endProgress: 0.939358, factor: 0.84 },
    { kind: "exit", startProgress: 0.917718, endProgress: 0.938225, factor: 1.01 },
    { kind: "corner", startProgress: 0.925094, endProgress: 0.960333, factor: 0.68 },
    { kind: "corner", startProgress: 0.937358, endProgress: 0.970665, factor: 0.74 },
    { kind: "braking", startProgress: 0.951265, endProgress: 0.97472, factor: 0.83 },
    { kind: "exit", startProgress: 0.960333, endProgress: 0.981826, factor: 1 },
    { kind: "exit", startProgress: 0.970665, endProgress: 0.990869, factor: 1.02 },
    { kind: "corner", startProgress: 0.97272, endProgress: 0.006811, factor: 0.71 }
  ],
  "circuit_porto_boavista_loop": [
    { kind: "exit", startProgress: 0.009837, endProgress: 0.030342, factor: 1.01 },
    { kind: "braking", startProgress: 0.029651, endProgress: 0.051616, factor: 0.85 },
    { kind: "corner", startProgress: 0.049616, endProgress: 0.08259, factor: 0.75 },
    { kind: "exit", startProgress: 0.08259, endProgress: 0.102572, factor: 1.02 },
    { kind: "braking", startProgress: 0.082729, endProgress: 0.108729, factor: 0.8 },
    { kind: "corner", startProgress: 0.106729, endProgress: 0.142729, factor: 0.66 },
    { kind: "exit", startProgress: 0.142729, endProgress: 0.164729, factor: 1 },
    { kind: "braking", startProgress: 0.249682, endProgress: 0.265916, factor: 0.92 },
    { kind: "corner", startProgress: 0.263916, endProgress: 0.292591, factor: 0.87 },
    { kind: "exit", startProgress: 0.292591, endProgress: 0.309708, factor: 1.04 },
    { kind: "braking", startProgress: 0.454617, endProgress: 0.467605, factor: 0.96 },
    { kind: "corner", startProgress: 0.465605, endProgress: 0.491846, factor: 0.94 },
    { kind: "exit", startProgress: 0.491846, endProgress: 0.50734, factor: 1.06 },
    { kind: "braking", startProgress: 0.540985, endProgress: 0.566521, factor: 0.81 },
    { kind: "corner", startProgress: 0.564521, endProgress: 0.600173, factor: 0.67 },
    { kind: "exit", startProgress: 0.600173, endProgress: 0.621941, factor: 1 },
    { kind: "braking", startProgress: 0.657327, endProgress: 0.679499, factor: 0.85 },
    { kind: "corner", startProgress: 0.677499, endProgress: 0.710628, factor: 0.74 },
    { kind: "exit", startProgress: 0.710628, endProgress: 0.730714, factor: 1.02 },
    { kind: "straight", startProgress: 0.81717, endProgress: 0.965443, factor: 1.08 },
    { kind: "braking", startProgress: 0.955067, endProgress: 0.978078, factor: 0.84 },
    { kind: "corner", startProgress: 0.976078, endProgress: 0.009837, factor: 0.72 }
  ],
  "circuit_madrid_centro_loop": [
    { kind: "braking", startProgress: 0.002573, endProgress: 0.026177, factor: 0.83 },
    { kind: "corner", startProgress: 0.007427, endProgress: 0.042168, factor: 0.7 },
    { kind: "braking", startProgress: 0.010561, endProgress: 0.036561, factor: 0.8 },
    { kind: "braking", startProgress: 0.02203, endProgress: 0.04451, factor: 0.84 },
    { kind: "corner", startProgress: 0.024177, endProgress: 0.05838, factor: 0.71 },
    { kind: "corner", startProgress: 0.034561, endProgress: 0.070561, factor: 0.66 },
    { kind: "exit", startProgress: 0.042168, endProgress: 0.063329, factor: 1.01 },
    { kind: "corner", startProgress: 0.04251, endProgress: 0.07587, factor: 0.73 },
    { kind: "exit", startProgress: 0.05838, endProgress: 0.079183, factor: 1.01 },
    { kind: "exit", startProgress: 0.070561, endProgress: 0.092561, factor: 1 },
    { kind: "exit", startProgress: 0.07587, endProgress: 0.09611, factor: 1.02 },
    { kind: "braking", startProgress: 0.365839, endProgress: 0.378643, factor: 0.96 },
    { kind: "corner", startProgress: 0.376643, endProgress: 0.402746, factor: 0.94 },
    { kind: "exit", startProgress: 0.402746, endProgress: 0.418148, factor: 1.06 },
    { kind: "braking", startProgress: 0.581343, endProgress: 0.607343, factor: 0.8 },
    { kind: "corner", startProgress: 0.605343, endProgress: 0.641343, factor: 0.66 },
    { kind: "exit", startProgress: 0.641343, endProgress: 0.663343, factor: 1 },
    { kind: "braking", startProgress: 0.645864, endProgress: 0.669664, factor: 0.83 },
    { kind: "corner", startProgress: 0.667664, endProgress: 0.702014, factor: 0.71 },
    { kind: "exit", startProgress: 0.702014, endProgress: 0.722914, factor: 1.01 },
    { kind: "straight", startProgress: 0.723627, endProgress: 0.882152, factor: 1.08 },
    { kind: "braking", startProgress: 0.985105, endProgress: 0.009427, factor: 0.82 }
  ],
  "circuit_monaco_harbor_loop": [
    { kind: "braking", startProgress: 0.225458, endProgress: 0.245873, factor: 0.87 },
    { kind: "braking", startProgress: 0.234096, endProgress: 0.255978, factor: 0.85 },
    { kind: "corner", startProgress: 0.243873, endProgress: 0.275684, factor: 0.78 },
    { kind: "corner", startProgress: 0.253978, endProgress: 0.286889, factor: 0.75 },
    { kind: "braking", startProgress: 0.260017, endProgress: 0.286017, factor: 0.8 },
    { kind: "exit", startProgress: 0.275684, endProgress: 0.294892, factor: 1.02 },
    { kind: "corner", startProgress: 0.284017, endProgress: 0.320017, factor: 0.66 },
    { kind: "exit", startProgress: 0.286889, endProgress: 0.30683, factor: 1.02 },
    { kind: "exit", startProgress: 0.320017, endProgress: 0.342017, factor: 1 },
    { kind: "braking", startProgress: 0.434005, endProgress: 0.457674, factor: 0.83 },
    { kind: "corner", startProgress: 0.455674, endProgress: 0.489926, factor: 0.71 },
    { kind: "braking", startProgress: 0.455801, endProgress: 0.472177, factor: 0.92 },
    { kind: "corner", startProgress: 0.470177, endProgress: 0.498959, factor: 0.86 },
    { kind: "exit", startProgress: 0.489926, endProgress: 0.51076, factor: 1.01 },
    { kind: "exit", startProgress: 0.498959, endProgress: 0.516147, factor: 1.04 },
    { kind: "braking", startProgress: 0.528204, endProgress: 0.544963, factor: 0.92 },
    { kind: "corner", startProgress: 0.542963, endProgress: 0.572032, factor: 0.86 },
    { kind: "braking", startProgress: 0.564313, endProgress: 0.579677, factor: 0.93 },
    { kind: "exit", startProgress: 0.572032, endProgress: 0.589411, factor: 1.04 },
    { kind: "corner", startProgress: 0.577677, endProgress: 0.6057, factor: 0.89 },
    { kind: "exit", startProgress: 0.6057, endProgress: 0.622382, factor: 1.05 },
    { kind: "straight", startProgress: 0.894383, endProgress: 0.979826, factor: 1.08 }
  ],
  "circuit_monaco_casino_sprint": [
    { kind: "braking", startProgress: 0.190022, endProgress: 0.214071, factor: 0.82 },
    { kind: "braking", startProgress: 0.202507, endProgress: 0.226668, factor: 0.82 },
    { kind: "corner", startProgress: 0.212071, endProgress: 0.246608, factor: 0.7 },
    { kind: "corner", startProgress: 0.224668, endProgress: 0.259289, factor: 0.7 },
    { kind: "exit", startProgress: 0.246608, endProgress: 0.267632, factor: 1.01 },
    { kind: "braking", startProgress: 0.256966, endProgress: 0.275031, factor: 0.9 },
    { kind: "exit", startProgress: 0.259289, endProgress: 0.28037, factor: 1.01 },
    { kind: "braking", startProgress: 0.259756, endProgress: 0.278023, factor: 0.9 },
    { kind: "corner", startProgress: 0.273031, endProgress: 0.30308, factor: 0.83 },
    { kind: "corner", startProgress: 0.276023, endProgress: 0.306223, factor: 0.82 },
    { kind: "braking", startProgress: 0.291414, endProgress: 0.315083, factor: 0.83 },
    { kind: "exit", startProgress: 0.30308, endProgress: 0.321112, factor: 1.03 },
    { kind: "exit", startProgress: 0.306223, endProgress: 0.324357, factor: 1.03 },
    { kind: "braking", startProgress: 0.310737, endProgress: 0.327496, factor: 0.92 },
    { kind: "corner", startProgress: 0.313083, endProgress: 0.347335, factor: 0.71 },
    { kind: "corner", startProgress: 0.325496, endProgress: 0.354565, factor: 0.86 },
    { kind: "exit", startProgress: 0.347335, endProgress: 0.368169, factor: 1.01 },
    { kind: "exit", startProgress: 0.354565, endProgress: 0.371944, factor: 1.04 },
    { kind: "braking", startProgress: 0.70639, endProgress: 0.730262, factor: 0.83 },
    { kind: "corner", startProgress: 0.728262, endProgress: 0.762666, factor: 0.71 },
    { kind: "exit", startProgress: 0.762666, endProgress: 0.783602, factor: 1.01 },
    { kind: "straight", startProgress: 0.891164, endProgress: 0.93943, factor: 1.08 }
  ],
  "circuit_london_thames_loop": [
    { kind: "straight", startProgress: 0.011322, endProgress: 0.151985, factor: 1.08 },
    { kind: "braking", startProgress: 0.139773, endProgress: 0.151761, factor: 0.98 },
    { kind: "corner", startProgress: 0.149761, endProgress: 0.175252, factor: 0.96 },
    { kind: "exit", startProgress: 0.175252, endProgress: 0.190246, factor: 1.06 },
    { kind: "braking", startProgress: 0.263225, endProgress: 0.287748, factor: 0.82 },
    { kind: "corner", startProgress: 0.285748, endProgress: 0.32064, factor: 0.69 },
    { kind: "exit", startProgress: 0.32064, endProgress: 0.341902, factor: 1.01 },
    { kind: "braking", startProgress: 0.32561, endProgress: 0.35161, factor: 0.8 },
    { kind: "corner", startProgress: 0.34961, endProgress: 0.38561, factor: 0.66 },
    { kind: "exit", startProgress: 0.38561, endProgress: 0.40761, factor: 1 },
    { kind: "braking", startProgress: 0.400116, endProgress: 0.424805, factor: 0.82 },
    { kind: "corner", startProgress: 0.422805, endProgress: 0.457822, factor: 0.69 },
    { kind: "exit", startProgress: 0.457822, endProgress: 0.479167, factor: 1.01 },
    { kind: "braking", startProgress: 0.698747, endProgress: 0.709527, factor: 0.99 },
    { kind: "corner", startProgress: 0.707527, endProgress: 0.732112, factor: 0.98 },
    { kind: "exit", startProgress: 0.732112, endProgress: 0.746502, factor: 1.07 },
    { kind: "braking", startProgress: 0.815618, endProgress: 0.840388, factor: 0.82 },
    { kind: "corner", startProgress: 0.838388, endProgress: 0.873466, factor: 0.69 },
    { kind: "braking", startProgress: 0.868436, endProgress: 0.888619, factor: 0.87 },
    { kind: "exit", startProgress: 0.873466, endProgress: 0.894851, factor: 1.01 },
    { kind: "corner", startProgress: 0.886619, endProgress: 0.918256, factor: 0.78 },
    { kind: "exit", startProgress: 0.918256, endProgress: 0.937348, factor: 1.03 }
  ],
  "circuit_brussels_grand_place_loop": [
    { kind: "braking", startProgress: 0.458571, endProgress: 0.483483, factor: 0.81 },
    { kind: "braking", startProgress: 0.477249, endProgress: 0.498798, factor: 0.86 },
    { kind: "corner", startProgress: 0.481483, endProgress: 0.516667, factor: 0.68 },
    { kind: "braking", startProgress: 0.490022, endProgress: 0.513216, factor: 0.84 },
    { kind: "corner", startProgress: 0.496798, endProgress: 0.52946, factor: 0.75 },
    { kind: "braking", startProgress: 0.506016, endProgress: 0.532016, factor: 0.8 },
    { kind: "corner", startProgress: 0.511216, endProgress: 0.545112, factor: 0.72 },
    { kind: "exit", startProgress: 0.516667, endProgress: 0.538123, factor: 1 },
    { kind: "exit", startProgress: 0.52946, endProgress: 0.549234, factor: 1.02 },
    { kind: "corner", startProgress: 0.530016, endProgress: 0.566016, factor: 0.66 },
    { kind: "braking", startProgress: 0.538443, endProgress: 0.561948, factor: 0.83 },
    { kind: "exit", startProgress: 0.545112, endProgress: 0.565709, factor: 1.01 },
    { kind: "corner", startProgress: 0.559948, endProgress: 0.594077, factor: 0.71 },
    { kind: "exit", startProgress: 0.566016, endProgress: 0.588016, factor: 1 },
    { kind: "exit", startProgress: 0.594077, endProgress: 0.614829, factor: 1.01 },
    { kind: "braking", startProgress: 0.598438, endProgress: 0.620591, factor: 0.85 },
    { kind: "corner", startProgress: 0.618591, endProgress: 0.651706, factor: 0.74 },
    { kind: "exit", startProgress: 0.651706, endProgress: 0.671782, factor: 1.02 },
    { kind: "braking", startProgress: 0.721408, endProgress: 0.74615, factor: 0.82 },
    { kind: "corner", startProgress: 0.74415, endProgress: 0.779206, factor: 0.69 },
    { kind: "exit", startProgress: 0.779206, endProgress: 0.800577, factor: 1.01 },
    { kind: "straight", startProgress: 0.836094, endProgress: 0.936105, factor: 1.08 }
  ],
  "circuit_prague_vltava_loop": [
    { kind: "braking", startProgress: 0.001118, endProgress: 0.022984, factor: 0.85 },
    { kind: "corner", startProgress: 0.009572, endProgress: 0.042447, factor: 0.75 },
    { kind: "corner", startProgress: 0.020984, endProgress: 0.053884, factor: 0.75 },
    { kind: "exit", startProgress: 0.034154, endProgress: 0.055856, factor: 1 },
    { kind: "exit", startProgress: 0.042447, endProgress: 0.062364, factor: 1.02 },
    { kind: "braking", startProgress: 0.050082, endProgress: 0.061997, factor: 0.98 },
    { kind: "exit", startProgress: 0.053884, endProgress: 0.073817, factor: 1.02 },
    { kind: "corner", startProgress: 0.059997, endProgress: 0.085433, factor: 0.96 },
    { kind: "exit", startProgress: 0.085433, endProgress: 0.10039, factor: 1.06 },
    { kind: "braking", startProgress: 0.16291, endProgress: 0.188766, factor: 0.8 },
    { kind: "corner", startProgress: 0.186766, endProgress: 0.222658, factor: 0.66 },
    { kind: "straight", startProgress: 0.192735, endProgress: 0.568766, factor: 1.08 },
    { kind: "exit", startProgress: 0.222658, endProgress: 0.244586, factor: 1 },
    { kind: "braking", startProgress: 0.712438, endProgress: 0.737213, factor: 0.82 },
    { kind: "braking", startProgress: 0.733078, endProgress: 0.748721, factor: 0.93 },
    { kind: "corner", startProgress: 0.735213, endProgress: 0.770295, factor: 0.69 },
    { kind: "corner", startProgress: 0.746721, endProgress: 0.774954, factor: 0.88 },
    { kind: "exit", startProgress: 0.770295, endProgress: 0.791682, factor: 1.01 },
    { kind: "exit", startProgress: 0.774954, endProgress: 0.791775, factor: 1.05 },
    { kind: "braking", startProgress: 0.975195, endProgress: 0.0006, factor: 0.81 },
    { kind: "braking", startProgress: 0.989739, endProgress: 0.011572, factor: 0.85 },
    { kind: "corner", startProgress: 0.9986, endProgress: 0.034154, factor: 0.67 }
  ],
  "circuit_copenhagen_harbor_loop": [
    { kind: "braking", startProgress: 0.009304, endProgress: 0.02333, factor: 0.95 },
    { kind: "corner", startProgress: 0.02133, endProgress: 0.04835, factor: 0.91 },
    { kind: "exit", startProgress: 0.04835, endProgress: 0.064363, factor: 1.05 },
    { kind: "braking", startProgress: 0.089203, endProgress: 0.10921, factor: 0.87 },
    { kind: "corner", startProgress: 0.10721, endProgress: 0.138715, factor: 0.79 },
    { kind: "braking", startProgress: 0.120755, endProgress: 0.138612, factor: 0.9 },
    { kind: "corner", startProgress: 0.136612, endProgress: 0.166505, factor: 0.83 },
    { kind: "exit", startProgress: 0.138715, endProgress: 0.157719, factor: 1.03 },
    { kind: "exit", startProgress: 0.166505, endProgress: 0.184433, factor: 1.04 },
    { kind: "braking", startProgress: 0.337123, endProgress: 0.355235, factor: 0.9 },
    { kind: "corner", startProgress: 0.353235, endProgress: 0.383319, factor: 0.83 },
    { kind: "exit", startProgress: 0.383319, endProgress: 0.401375, factor: 1.03 },
    { kind: "straight", startProgress: 0.416737, endProgress: 0.76963, factor: 1.08 },
    { kind: "braking", startProgress: 0.743205, endProgress: 0.76567, factor: 0.84 },
    { kind: "corner", startProgress: 0.76367, endProgress: 0.797019, factor: 0.74 },
    { kind: "exit", startProgress: 0.797019, endProgress: 0.817252, factor: 1.02 },
    { kind: "braking", startProgress: 0.892689, endProgress: 0.913937, factor: 0.86 },
    { kind: "corner", startProgress: 0.911937, endProgress: 0.944373, factor: 0.76 },
    { kind: "exit", startProgress: 0.944373, endProgress: 0.963997, factor: 1.02 }
  ],
  "circuit_stockholm_gamla_stan_loop": [
    { kind: "braking", startProgress: 0.231268, endProgress: 0.250883, factor: 0.88 },
    { kind: "braking", startProgress: 0.239738, endProgress: 0.262276, factor: 0.84 },
    { kind: "corner", startProgress: 0.248883, endProgress: 0.280094, factor: 0.8 },
    { kind: "corner", startProgress: 0.260276, endProgress: 0.293679, factor: 0.73 },
    { kind: "braking", startProgress: 0.261369, endProgress: 0.286424, factor: 0.81 },
    { kind: "exit", startProgress: 0.280094, endProgress: 0.298902, factor: 1.03 },
    { kind: "corner", startProgress: 0.284424, endProgress: 0.319716, factor: 0.68 },
    { kind: "exit", startProgress: 0.293679, endProgress: 0.313948, factor: 1.02 },
    { kind: "exit", startProgress: 0.319716, endProgress: 0.341243, factor: 1 },
    { kind: "braking", startProgress: 0.35675, endProgress: 0.376904, factor: 0.87 },
    { kind: "corner", startProgress: 0.374904, endProgress: 0.40652, factor: 0.78 },
    { kind: "exit", startProgress: 0.40652, endProgress: 0.425597, factor: 1.03 },
    { kind: "braking", startProgress: 0.439296, endProgress: 0.457567, factor: 0.9 },
    { kind: "corner", startProgress: 0.455567, endProgress: 0.48577, factor: 0.82 },
    { kind: "exit", startProgress: 0.48577, endProgress: 0.503906, factor: 1.03 },
    { kind: "braking", startProgress: 0.518753, endProgress: 0.53388, factor: 0.94 },
    { kind: "corner", startProgress: 0.53188, endProgress: 0.559725, factor: 0.89 },
    { kind: "straight", startProgress: 0.537846, endProgress: 0.640873, factor: 1.08 },
    { kind: "exit", startProgress: 0.559725, endProgress: 0.576288, factor: 1.05 },
    { kind: "braking", startProgress: 0.852081, endProgress: 0.864838, factor: 0.97 },
    { kind: "corner", startProgress: 0.862838, endProgress: 0.888906, factor: 0.94 },
    { kind: "exit", startProgress: 0.888906, endProgress: 0.904285, factor: 1.06 }
  ],
  "circuit_cannes_houssam_loop": [
    { kind: "corner", startProgress: 0.006345, endProgress: 0.032179, factor: 0.95 },
    { kind: "exit", startProgress: 0.032179, endProgress: 0.047402, factor: 1.06 },
    { kind: "braking", startProgress: 0.084579, endProgress: 0.097722, factor: 0.96 },
    { kind: "corner", startProgress: 0.095722, endProgress: 0.122079, factor: 0.93 },
    { kind: "straight", startProgress: 0.103768, endProgress: 0.288298, factor: 1.08 },
    { kind: "exit", startProgress: 0.122079, endProgress: 0.137651, factor: 1.06 },
    { kind: "braking", startProgress: 0.292689, endProgress: 0.318689, factor: 0.8 },
    { kind: "corner", startProgress: 0.316689, endProgress: 0.352689, factor: 0.66 },
    { kind: "exit", startProgress: 0.352689, endProgress: 0.374689, factor: 1 },
    { kind: "braking", startProgress: 0.374384, endProgress: 0.388647, factor: 0.95 },
    { kind: "corner", startProgress: 0.386647, endProgress: 0.413844, factor: 0.91 },
    { kind: "exit", startProgress: 0.413844, endProgress: 0.429976, factor: 1.05 },
    { kind: "braking", startProgress: 0.441275, endProgress: 0.462458, factor: 0.86 },
    { kind: "corner", startProgress: 0.460458, endProgress: 0.492845, factor: 0.76 },
    { kind: "exit", startProgress: 0.492845, endProgress: 0.512436, factor: 1.02 },
    { kind: "braking", startProgress: 0.502337, endProgress: 0.516802, factor: 0.94 },
    { kind: "corner", startProgress: 0.514802, endProgress: 0.542151, factor: 0.91 },
    { kind: "exit", startProgress: 0.542151, endProgress: 0.558384, factor: 1.05 },
    { kind: "braking", startProgress: 0.740308, endProgress: 0.765678, factor: 0.81 },
    { kind: "corner", startProgress: 0.763678, endProgress: 0.799205, factor: 0.67 },
    { kind: "exit", startProgress: 0.799205, endProgress: 0.82089, factor: 1 },
    { kind: "braking", startProgress: 0.995899, endProgress: 0.008345, factor: 0.97 }
  ],
  "circuit_tokyo_bay_loop": [
    { kind: "exit", startProgress: 0.011974, endProgress: 0.033974, factor: 1 },
    { kind: "exit", startProgress: 0.02162, endProgress: 0.041239, factor: 1.02 },
    { kind: "braking", startProgress: 0.193534, endProgress: 0.211463, factor: 0.9 },
    { kind: "corner", startProgress: 0.209463, endProgress: 0.23941, factor: 0.83 },
    { kind: "exit", startProgress: 0.23941, endProgress: 0.257375, factor: 1.04 },
    { kind: "braking", startProgress: 0.407869, endProgress: 0.427827, factor: 0.88 },
    { kind: "corner", startProgress: 0.425827, endProgress: 0.457295, factor: 0.79 },
    { kind: "exit", startProgress: 0.457295, endProgress: 0.476274, factor: 1.03 },
    { kind: "straight", startProgress: 0.603779, endProgress: 0.805249, factor: 1.08 },
    { kind: "braking", startProgress: 0.88797, endProgress: 0.91397, factor: 0.8 },
    { kind: "braking", startProgress: 0.910088, endProgress: 0.929085, factor: 0.89 },
    { kind: "corner", startProgress: 0.91197, endProgress: 0.94797, factor: 0.66 },
    { kind: "corner", startProgress: 0.927085, endProgress: 0.957833, factor: 0.81 },
    { kind: "braking", startProgress: 0.935808, endProgress: 0.952489, factor: 0.92 },
    { kind: "exit", startProgress: 0.94797, endProgress: 0.96997, factor: 1 },
    { kind: "corner", startProgress: 0.950489, endProgress: 0.9795, factor: 0.86 },
    { kind: "braking", startProgress: 0.951974, endProgress: 0.977974, factor: 0.8 },
    { kind: "exit", startProgress: 0.957833, endProgress: 0.976332, factor: 1.03 },
    { kind: "braking", startProgress: 0.969953, endProgress: 0.991191, factor: 0.86 },
    { kind: "corner", startProgress: 0.975974, endProgress: 0.011974, factor: 0.66 },
    { kind: "exit", startProgress: 0.9795, endProgress: 0.996841, factor: 1.04 },
    { kind: "corner", startProgress: 0.989191, endProgress: 0.02162, factor: 0.76 }
  ],
  "circuit_rio_flamengo_loop": [
    { kind: "braking", startProgress: 0.135647, endProgress: 0.161647, factor: 0.8 },
    { kind: "corner", startProgress: 0.159647, endProgress: 0.195647, factor: 0.66 },
    { kind: "braking", startProgress: 0.168527, endProgress: 0.188898, factor: 0.87 },
    { kind: "corner", startProgress: 0.186898, endProgress: 0.218676, factor: 0.78 },
    { kind: "exit", startProgress: 0.195647, endProgress: 0.217647, factor: 1 },
    { kind: "exit", startProgress: 0.218676, endProgress: 0.237862, factor: 1.02 },
    { kind: "braking", startProgress: 0.247095, endProgress: 0.273095, factor: 0.8 },
    { kind: "corner", startProgress: 0.271095, endProgress: 0.307095, factor: 0.66 },
    { kind: "exit", startProgress: 0.307095, endProgress: 0.329095, factor: 1 },
    { kind: "braking", startProgress: 0.44011, endProgress: 0.465633, factor: 0.81 },
    { kind: "braking", startProgress: 0.446628, endProgress: 0.468344, factor: 0.85 },
    { kind: "corner", startProgress: 0.463633, endProgress: 0.499275, factor: 0.67 },
    { kind: "corner", startProgress: 0.466344, endProgress: 0.499131, factor: 0.75 },
    { kind: "straight", startProgress: 0.472343, endProgress: 0.652043, factor: 1.08 },
    { kind: "exit", startProgress: 0.499131, endProgress: 0.518989, factor: 1.02 },
    { kind: "exit", startProgress: 0.499275, endProgress: 0.521037, factor: 1 },
    { kind: "braking", startProgress: 0.622248, endProgress: 0.64805, factor: 0.8 },
    { kind: "corner", startProgress: 0.64605, endProgress: 0.681902, factor: 0.66 },
    { kind: "exit", startProgress: 0.681902, endProgress: 0.703803, factor: 1 },
    { kind: "braking", startProgress: 0.760543, endProgress: 0.779481, factor: 0.89 },
    { kind: "corner", startProgress: 0.777481, endProgress: 0.808185, factor: 0.81 },
    { kind: "exit", startProgress: 0.808185, endProgress: 0.826654, factor: 1.03 }
  ],
  "circuit_cape_town_waterfront_loop": [
    { kind: "corner", startProgress: 0.015526, endProgress: 0.04825, factor: 0.75 },
    { kind: "exit", startProgress: 0.04825, endProgress: 0.068065, factor: 1.02 },
    { kind: "straight", startProgress: 0.052208, endProgress: 0.235427, factor: 1.08 },
    { kind: "braking", startProgress: 0.332843, endProgress: 0.356554, factor: 0.83 },
    { kind: "corner", startProgress: 0.354554, endProgress: 0.388837, factor: 0.71 },
    { kind: "exit", startProgress: 0.388837, endProgress: 0.409692, factor: 1.01 },
    { kind: "braking", startProgress: 0.442518, endProgress: 0.46529, factor: 0.84 },
    { kind: "braking", startProgress: 0.462424, endProgress: 0.487855, factor: 0.81 },
    { kind: "corner", startProgress: 0.46329, endProgress: 0.496869, factor: 0.73 },
    { kind: "corner", startProgress: 0.485855, endProgress: 0.521429, factor: 0.67 },
    { kind: "exit", startProgress: 0.496869, endProgress: 0.517255, factor: 1.01 },
    { kind: "braking", startProgress: 0.513554, endProgress: 0.531235, factor: 0.9 },
    { kind: "exit", startProgress: 0.521429, endProgress: 0.543144, factor: 1 },
    { kind: "corner", startProgress: 0.529235, endProgress: 0.558996, factor: 0.84 },
    { kind: "exit", startProgress: 0.558996, endProgress: 0.576836, factor: 1.04 },
    { kind: "braking", startProgress: 0.711627, endProgress: 0.734979, factor: 0.83 },
    { kind: "braking", startProgress: 0.72751, endProgress: 0.750921, factor: 0.83 },
    { kind: "corner", startProgress: 0.732979, endProgress: 0.766993, factor: 0.72 },
    { kind: "corner", startProgress: 0.748921, endProgress: 0.782979, factor: 0.72 },
    { kind: "exit", startProgress: 0.766993, endProgress: 0.787668, factor: 1.01 },
    { kind: "exit", startProgress: 0.782979, endProgress: 0.803685, factor: 1.01 },
    { kind: "braking", startProgress: 0.995894, endProgress: 0.017526, factor: 0.85 }
  ],
  "circuit_seoul_yeouido_loop": [
    { kind: "braking", startProgress: 0.068826, endProgress: 0.085855, factor: 0.91 },
    { kind: "corner", startProgress: 0.083855, endProgress: 0.113127, factor: 0.85 },
    { kind: "braking", startProgress: 0.112983, endProgress: 0.125308, factor: 0.97 },
    { kind: "exit", startProgress: 0.113127, endProgress: 0.130642, factor: 1.04 },
    { kind: "corner", startProgress: 0.123308, endProgress: 0.149052, factor: 0.95 },
    { kind: "exit", startProgress: 0.149052, endProgress: 0.164214, factor: 1.06 },
    { kind: "braking", startProgress: 0.268336, endProgress: 0.294336, factor: 0.8 },
    { kind: "corner", startProgress: 0.292336, endProgress: 0.328336, factor: 0.66 },
    { kind: "exit", startProgress: 0.328336, endProgress: 0.350336, factor: 1 },
    { kind: "braking", startProgress: 0.469151, endProgress: 0.48662, factor: 0.91 },
    { kind: "corner", startProgress: 0.48462, endProgress: 0.514222, factor: 0.84 },
    { kind: "straight", startProgress: 0.490638, endProgress: 0.823405, factor: 1.08 },
    { kind: "exit", startProgress: 0.514222, endProgress: 0.531956, factor: 1.04 },
    { kind: "braking", startProgress: 0.793396, endProgress: 0.819396, factor: 0.8 },
    { kind: "corner", startProgress: 0.817396, endProgress: 0.853396, factor: 0.66 },
    { kind: "exit", startProgress: 0.853396, endProgress: 0.875396, factor: 1 },
    { kind: "braking", startProgress: 0.958808, endProgress: 0.972584, factor: 0.95 },
    { kind: "corner", startProgress: 0.970584, endProgress: 0.997416, factor: 0.92 },
    { kind: "exit", startProgress: 0.997416, endProgress: 0.013304, factor: 1.05 }
  ],
  "circuit_montreal_island_loop": [
    { kind: "corner", startProgress: 0.007804, endProgress: 0.043804, factor: 0.66 },
    { kind: "straight", startProgress: 0.013805, endProgress: 0.442123, factor: 1.08 },
    { kind: "exit", startProgress: 0.043804, endProgress: 0.065804, factor: 1 },
    { kind: "braking", startProgress: 0.412126, endProgress: 0.438126, factor: 0.8 },
    { kind: "corner", startProgress: 0.436126, endProgress: 0.472126, factor: 0.66 },
    { kind: "exit", startProgress: 0.472126, endProgress: 0.494126, factor: 1 },
    { kind: "braking", startProgress: 0.507956, endProgress: 0.528529, factor: 0.87 },
    { kind: "corner", startProgress: 0.526529, endProgress: 0.558459, factor: 0.78 },
    { kind: "braking", startProgress: 0.542686, endProgress: 0.564478, factor: 0.85 },
    { kind: "exit", startProgress: 0.558459, endProgress: 0.577745, factor: 1.02 },
    { kind: "corner", startProgress: 0.562478, endProgress: 0.595322, factor: 0.75 },
    { kind: "braking", startProgress: 0.571647, endProgress: 0.59396, factor: 0.85 },
    { kind: "corner", startProgress: 0.59196, endProgress: 0.625195, factor: 0.74 },
    { kind: "exit", startProgress: 0.595322, endProgress: 0.615218, factor: 1.02 },
    { kind: "exit", startProgress: 0.625195, endProgress: 0.645351, factor: 1.02 },
    { kind: "braking", startProgress: 0.837666, endProgress: 0.856316, factor: 0.89 },
    { kind: "corner", startProgress: 0.854316, endProgress: 0.884804, factor: 0.82 },
    { kind: "exit", startProgress: 0.884804, endProgress: 0.903129, factor: 1.03 },
    { kind: "braking", startProgress: 0.893079, endProgress: 0.908692, factor: 0.93 },
    { kind: "corner", startProgress: 0.906692, endProgress: 0.934902, factor: 0.88 },
    { kind: "exit", startProgress: 0.934902, endProgress: 0.951708, factor: 1.05 },
    { kind: "braking", startProgress: 0.983804, endProgress: 0.009804, factor: 0.8 }
  ],
  "circuit_istanbul_bosphorus_loop": [
    { kind: "braking", startProgress: 0.070299, endProgress: 0.096299, factor: 0.8 },
    { kind: "corner", startProgress: 0.094299, endProgress: 0.130299, factor: 0.66 },
    { kind: "exit", startProgress: 0.130299, endProgress: 0.152299, factor: 1 },
    { kind: "braking", startProgress: 0.170457, endProgress: 0.196457, factor: 0.8 },
    { kind: "corner", startProgress: 0.194457, endProgress: 0.230457, factor: 0.66 },
    { kind: "exit", startProgress: 0.230457, endProgress: 0.252457, factor: 1 },
    { kind: "braking", startProgress: 0.664419, endProgress: 0.685901, factor: 0.86 },
    { kind: "braking", startProgress: 0.683799, endProgress: 0.705032, factor: 0.86 },
    { kind: "corner", startProgress: 0.683901, endProgress: 0.716512, factor: 0.76 },
    { kind: "corner", startProgress: 0.703032, endProgress: 0.735457, factor: 0.76 },
    { kind: "exit", startProgress: 0.716512, endProgress: 0.736253, factor: 1.02 },
    { kind: "braking", startProgress: 0.721491, endProgress: 0.74484, factor: 0.83 },
    { kind: "braking", startProgress: 0.73358, endProgress: 0.756507, factor: 0.84 },
    { kind: "exit", startProgress: 0.735457, endProgress: 0.755074, factor: 1.02 },
    { kind: "corner", startProgress: 0.74284, endProgress: 0.776852, factor: 0.72 },
    { kind: "braking", startProgress: 0.751838, endProgress: 0.775582, factor: 0.83 },
    { kind: "corner", startProgress: 0.754507, endProgress: 0.788202, factor: 0.73 },
    { kind: "corner", startProgress: 0.773582, endProgress: 0.80789, factor: 0.71 },
    { kind: "exit", startProgress: 0.776852, endProgress: 0.797526, factor: 1.01 },
    { kind: "exit", startProgress: 0.788202, endProgress: 0.808666, factor: 1.01 },
    { kind: "exit", startProgress: 0.80789, endProgress: 0.828762, factor: 1.01 },
    { kind: "straight", startProgress: 0.808564, endProgress: 0.994411, factor: 1.08 }
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
