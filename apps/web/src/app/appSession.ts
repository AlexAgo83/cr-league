import { isLocale, type Locale } from "../i18n/index.js";
import { ACTIVE_PLAYER_CLAIM_KEY, ApiError, LANGUAGE_KEY, safeStorage } from "./appStorage.js";

export function initialLocale(): Locale {
  const saved = safeStorage.get(LANGUAGE_KEY);
  if (isLocale(saved)) return saved;
  const browserLocale = navigator.language.split("-")[0] ?? "en";
  return isLocale(browserLocale) ? browserLocale : "en";
}

export function persistLocale(locale: Locale) {
  safeStorage.set(LANGUAGE_KEY, locale);
}

export function isStaleLeagueError(error: unknown) {
  return error instanceof ApiError && error.statusCode === 404 && Boolean(safeStorage.get(ACTIVE_PLAYER_CLAIM_KEY));
}
