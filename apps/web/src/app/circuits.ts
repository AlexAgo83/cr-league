import type { TranslationKey } from "../i18n/index.js";

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

export function countryFlag(country: string) {
  return country
    .toUpperCase()
    .replace(/[A-Z]/g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
}

export const CITY_CIRCUITS: [CityCircuit, ...CityCircuit[]] = [
  {
    city: "Paris",
    country: "FR",
    layoutKey: "circuit_docklands_sprint",
    laps: 5,
    traits: { grip: 64, overtaking: 72, energy: 58 },
    likelyWeather: "light_rain",
    route: [
      { lat: 48.86565, lng: 2.32114 },
      { lat: 48.86555, lng: 2.3244 },
      { lat: 48.86532, lng: 2.33035 },
      { lat: 48.86495, lng: 2.3333 },
      { lat: 48.86456, lng: 2.33692 },
      { lat: 48.8637, lng: 2.3401 },
      { lat: 48.86283, lng: 2.34308 },
      { lat: 48.86135, lng: 2.3468 },
      { lat: 48.86028, lng: 2.35015 },
      { lat: 48.8584, lng: 2.3517 },
      { lat: 48.85674, lng: 2.35222 },
      { lat: 48.85495, lng: 2.3516 },
      { lat: 48.8538, lng: 2.35058 },
      { lat: 48.8531, lng: 2.3473 },
      { lat: 48.85273, lng: 2.34338 },
      { lat: 48.8531, lng: 2.34 },
      { lat: 48.85384, lng: 2.33554 },
      { lat: 48.85505, lng: 2.3318 },
      { lat: 48.85714, lng: 2.32849 },
      { lat: 48.8592, lng: 2.3251 },
      { lat: 48.86124, lng: 2.32263 },
      { lat: 48.8634, lng: 2.32165 },
      { lat: 48.86565, lng: 2.32114 }
    ]
  },
  {
    city: "Paris",
    country: "FR",
    layoutKey: "circuit_left_bank_loop",
    laps: 6,
    traits: { grip: 70, overtaking: 55, energy: 62 },
    likelyWeather: "dry",
    route: [
      { lat: 48.85372, lng: 2.32772 },
      { lat: 48.8531, lng: 2.33095 },
      { lat: 48.85226, lng: 2.33454 },
      { lat: 48.85135, lng: 2.33825 },
      { lat: 48.85033, lng: 2.34221 },
      { lat: 48.84945, lng: 2.3456 },
      { lat: 48.84842, lng: 2.34846 },
      { lat: 48.84695, lng: 2.34852 },
      { lat: 48.8459, lng: 2.34774 },
      { lat: 48.8447, lng: 2.34615 },
      { lat: 48.84386, lng: 2.34419 },
      { lat: 48.84335, lng: 2.34125 },
      { lat: 48.84312, lng: 2.3374 },
      { lat: 48.84376, lng: 2.33398 },
      { lat: 48.84478, lng: 2.33067 },
      { lat: 48.8462, lng: 2.32795 },
      { lat: 48.84745, lng: 2.32577 },
      { lat: 48.84955, lng: 2.32452 },
      { lat: 48.85118, lng: 2.32389 },
      { lat: 48.85255, lng: 2.3253 },
      { lat: 48.85372, lng: 2.32772 }
    ]
  },
  {
    city: "Amsterdam",
    country: "NL",
    layoutKey: "circuit_canal_loop",
    laps: 5,
    traits: { grip: 60, overtaking: 68, energy: 66 },
    likelyWeather: "light_rain",
    route: [
      { lat: 52.37949, lng: 4.88382 },
      { lat: 52.38035, lng: 4.88665 },
      { lat: 52.38116, lng: 4.88934 },
      { lat: 52.38144, lng: 4.89255 },
      { lat: 52.38131, lng: 4.89585 },
      { lat: 52.38018, lng: 4.89925 },
      { lat: 52.37874, lng: 4.90195 },
      { lat: 52.37695, lng: 4.90405 },
      { lat: 52.37498, lng: 4.90574 },
      { lat: 52.37285, lng: 4.90655 },
      { lat: 52.3711, lng: 4.90647 },
      { lat: 52.3693, lng: 4.90505 },
      { lat: 52.36747, lng: 4.9029 },
      { lat: 52.36635, lng: 4.89985 },
      { lat: 52.36583, lng: 4.89616 },
      { lat: 52.36625, lng: 4.89265 },
      { lat: 52.36719, lng: 4.88974 },
      { lat: 52.36885, lng: 4.88685 },
      { lat: 52.37067, lng: 4.88494 },
      { lat: 52.3731, lng: 4.88335 },
      { lat: 52.37543, lng: 4.88238 },
      { lat: 52.37765, lng: 4.88275 },
      { lat: 52.37949, lng: 4.88382 }
    ]
  },
  {
    city: "Amsterdam",
    country: "NL",
    layoutKey: "circuit_harbor_sprint",
    laps: 4,
    traits: { grip: 58, overtaking: 78, energy: 52 },
    likelyWeather: "heavy_rain",
    route: [
      { lat: 52.39849, lng: 4.88436 },
      { lat: 52.4002, lng: 4.88685 },
      { lat: 52.40219, lng: 4.88976 },
      { lat: 52.40415, lng: 4.8933 },
      { lat: 52.40566, lng: 4.89727 },
      { lat: 52.40655, lng: 4.90165 },
      { lat: 52.40697, lng: 4.9062 },
      { lat: 52.40535, lng: 4.90942 },
      { lat: 52.40311, lng: 4.91193 },
      { lat: 52.4003, lng: 4.91238 },
      { lat: 52.39775, lng: 4.91208 },
      { lat: 52.39495, lng: 4.91062 },
      { lat: 52.39235, lng: 4.90813 },
      { lat: 52.39055, lng: 4.90495 },
      { lat: 52.38897, lng: 4.90108 },
      { lat: 52.3881, lng: 4.8968 },
      { lat: 52.38802, lng: 4.89261 },
      { lat: 52.3891, lng: 4.88925 },
      { lat: 52.39046, lng: 4.88566 },
      { lat: 52.39255, lng: 4.88315 },
      { lat: 52.39457, lng: 4.88147 },
      { lat: 52.39665, lng: 4.88252 },
      { lat: 52.39849, lng: 4.88436 }
    ]
  },
  {
    city: "Berlin",
    country: "DE",
    layoutKey: "circuit_ring_sector",
    laps: 6,
    traits: { grip: 76, overtaking: 62, energy: 70 },
    likelyWeather: "dry",
    route: [
      { lat: 52.51632, lng: 13.37772 },
      { lat: 52.51655, lng: 13.3815 },
      { lat: 52.51678, lng: 13.38542 },
      { lat: 52.51702, lng: 13.38938 },
      { lat: 52.51724, lng: 13.39286 },
      { lat: 52.51788, lng: 13.39605 },
      { lat: 52.51901, lng: 13.39852 },
      { lat: 52.5183, lng: 13.40218 },
      { lat: 52.51724, lng: 13.40511 },
      { lat: 52.51576, lng: 13.40735 },
      { lat: 52.51412, lng: 13.40924 },
      { lat: 52.51236, lng: 13.40972 },
      { lat: 52.5105, lng: 13.40972 },
      { lat: 52.50836, lng: 13.40818 },
      { lat: 52.50678, lng: 13.40573 },
      { lat: 52.50582, lng: 13.40245 },
      { lat: 52.50536, lng: 13.39892 },
      { lat: 52.50596, lng: 13.3951 },
      { lat: 52.50677, lng: 13.39122 },
      { lat: 52.5082, lng: 13.38712 },
      { lat: 52.51032, lng: 13.38405 },
      { lat: 52.51218, lng: 13.38158 },
      { lat: 52.51376, lng: 13.37928 },
      { lat: 52.51525, lng: 13.37822 },
      { lat: 52.51632, lng: 13.37772 }
    ]
  },
  {
    city: "Berlin",
    country: "DE",
    layoutKey: "circuit_mitte_dash",
    laps: 5,
    traits: { grip: 68, overtaking: 74, energy: 60 },
    likelyWeather: "dry",
    route: [
      { lat: 52.52351, lng: 13.38848 },
      { lat: 52.52565, lng: 13.3892 },
      { lat: 52.52763, lng: 13.39052 },
      { lat: 52.52905, lng: 13.39342 },
      { lat: 52.52976, lng: 13.39688 },
      { lat: 52.53015, lng: 13.4014 },
      { lat: 52.52988, lng: 13.40562 },
      { lat: 52.52902, lng: 13.40972 },
      { lat: 52.5278, lng: 13.41342 },
      { lat: 52.52628, lng: 13.41685 },
      { lat: 52.52442, lng: 13.41946 },
      { lat: 52.52235, lng: 13.42105 },
      { lat: 52.52046, lng: 13.42122 },
      { lat: 52.51838, lng: 13.42012 },
      { lat: 52.51662, lng: 13.41806 },
      { lat: 52.51522, lng: 13.41485 },
      { lat: 52.51406, lng: 13.4108 },
      { lat: 52.51342, lng: 13.40635 },
      { lat: 52.51348, lng: 13.40194 },
      { lat: 52.51428, lng: 13.39785 },
      { lat: 52.51595, lng: 13.39422 },
      { lat: 52.51785, lng: 13.39155 },
      { lat: 52.51978, lng: 13.38988 },
      { lat: 52.52168, lng: 13.38892 },
      { lat: 52.52351, lng: 13.38848 }
    ]
  }
];

export function circuitForRound(round: number): CityCircuit {
  return CITY_CIRCUITS[(Math.max(1, round) - 1) % CITY_CIRCUITS.length] ?? CITY_CIRCUITS[0];
}
