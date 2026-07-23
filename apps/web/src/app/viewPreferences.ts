import { safeStorage } from "./appStorage.js";

export type ChampionshipRecordTab = "standings" | "calendar" | "palmares" | "history";
export type CardPanel = "team" | "inventory" | "shop";

export const CHAMPIONSHIP_RECORD_TAB_KEY = "cr-league-championship-record-tab";
export const GARAGE_PANEL_KEY = "cr-league-garage-panel";

export function savedRecordTab(): ChampionshipRecordTab {
  const saved = safeStorage.get(CHAMPIONSHIP_RECORD_TAB_KEY);
  return saved === "standings" || saved === "palmares" || saved === "history" ? saved : "calendar";
}

export function savedCardPanel(): CardPanel {
  const saved = safeStorage.get(GARAGE_PANEL_KEY);
  return saved === "team" || saved === "shop" ? saved : "inventory";
}
