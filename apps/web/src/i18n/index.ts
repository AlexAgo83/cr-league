import en from "./en.json" with { type: "json" };

export type TranslationKey = keyof typeof en;

export function t(key: TranslationKey) {
  return en[key];
}
