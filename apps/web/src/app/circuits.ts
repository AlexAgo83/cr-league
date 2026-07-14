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
      { lat: 48.86532, lng: 2.33035 },
      { lat: 48.86456, lng: 2.33692 },
      { lat: 48.86283, lng: 2.34308 },
      { lat: 48.86028, lng: 2.35015 },
      { lat: 48.85674, lng: 2.35222 },
      { lat: 48.8538, lng: 2.35058 },
      { lat: 48.85273, lng: 2.34338 },
      { lat: 48.85384, lng: 2.33554 },
      { lat: 48.85714, lng: 2.32849 },
      { lat: 48.86124, lng: 2.32263 },
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
      { lat: 48.85226, lng: 2.33454 },
      { lat: 48.85033, lng: 2.34221 },
      { lat: 48.84842, lng: 2.34846 },
      { lat: 48.8459, lng: 2.34774 },
      { lat: 48.84386, lng: 2.34419 },
      { lat: 48.84312, lng: 2.3374 },
      { lat: 48.84478, lng: 2.33067 },
      { lat: 48.84745, lng: 2.32577 },
      { lat: 48.85118, lng: 2.32389 },
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
      { lat: 52.38116, lng: 4.88934 },
      { lat: 52.38131, lng: 4.89585 },
      { lat: 52.37874, lng: 4.90195 },
      { lat: 52.37498, lng: 4.90574 },
      { lat: 52.3711, lng: 4.90647 },
      { lat: 52.36747, lng: 4.9029 },
      { lat: 52.36583, lng: 4.89616 },
      { lat: 52.36719, lng: 4.88974 },
      { lat: 52.37067, lng: 4.88494 },
      { lat: 52.37543, lng: 4.88238 },
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
      { lat: 52.40219, lng: 4.88976 },
      { lat: 52.40566, lng: 4.89727 },
      { lat: 52.40697, lng: 4.9062 },
      { lat: 52.40311, lng: 4.91193 },
      { lat: 52.39775, lng: 4.91208 },
      { lat: 52.39235, lng: 4.90813 },
      { lat: 52.38897, lng: 4.90108 },
      { lat: 52.38802, lng: 4.89261 },
      { lat: 52.39046, lng: 4.88566 },
      { lat: 52.39457, lng: 4.88147 },
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
      { lat: 52.51678, lng: 13.38542 },
      { lat: 52.51724, lng: 13.39286 },
      { lat: 52.51901, lng: 13.39852 },
      { lat: 52.51724, lng: 13.40511 },
      { lat: 52.51412, lng: 13.40924 },
      { lat: 52.5105, lng: 13.40972 },
      { lat: 52.50678, lng: 13.40573 },
      { lat: 52.50536, lng: 13.39892 },
      { lat: 52.50677, lng: 13.39122 },
      { lat: 52.51032, lng: 13.38405 },
      { lat: 52.51376, lng: 13.37928 },
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
      { lat: 52.52763, lng: 13.39052 },
      { lat: 52.52976, lng: 13.39688 },
      { lat: 52.52988, lng: 13.40562 },
      { lat: 52.5278, lng: 13.41342 },
      { lat: 52.52442, lng: 13.41946 },
      { lat: 52.52046, lng: 13.42122 },
      { lat: 52.51662, lng: 13.41806 },
      { lat: 52.51406, lng: 13.4108 },
      { lat: 52.51348, lng: 13.40194 },
      { lat: 52.51595, lng: 13.39422 },
      { lat: 52.51978, lng: 13.38988 },
      { lat: 52.52351, lng: 13.38848 }
    ]
  }
];

export function circuitForRound(round: number): CityCircuit {
  return CITY_CIRCUITS[(Math.max(1, round) - 1) % CITY_CIRCUITS.length] ?? CITY_CIRCUITS[0];
}
