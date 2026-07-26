import type { Weather } from "./race.js";

const WEATHER_STEPS: Weather[] = ["dry", "light_rain", "heavy_rain"];

export function strongestForecast(forecast: Partial<Record<Weather, number>>): Weather {
  return WEATHER_STEPS.reduce((best, weather) => ((forecast[weather] ?? 0) > (forecast[best] ?? 0) ? weather : best), "dry");
}
