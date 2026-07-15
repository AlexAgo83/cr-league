import en from "./en.json" with { type: "json" };
import fr from "./fr.json" with { type: "json" };

const catalogs = {
  en,
  fr
} as const;

export type TranslationKey = keyof typeof en;
export type Locale = keyof typeof catalogs;
export type TranslationParams = Record<string, string | number>;

export function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "fr";
}

export function t(key: TranslationKey, locale: Locale = "en", params: TranslationParams = {}) {
  const value = catalogs[locale][key] ?? en[key];
  return value.replace(/\{([a-zA-Z0-9_]+)\}/g, (token, name: string) => (params[name] === undefined ? token : String(params[name])));
}
