import { createContext, useContext } from "react";
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

// Components read the translator from context instead of taking it as a prop; plain helper
// functions still receive it as an argument since they are not rendered under a provider.
const TranslationContext = createContext<((key: TranslationKey, params?: TranslationParams) => string) | null>(null);
export const TranslationProvider = TranslationContext.Provider;

export function useT() {
  const translator = useContext(TranslationContext);
  if (!translator) throw new Error("useT requires a <TranslationProvider>.");
  return translator;
}
