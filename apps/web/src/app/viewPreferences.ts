import { useSyncExternalStore } from "react";
import { safeStorage } from "./appStorage.js";

export type ChampionshipRecordTab = "standings" | "calendar" | "palmares" | "history";
export type CardPanel = "team" | "inventory" | "shop";

export const CHAMPIONSHIP_RECORD_TAB_KEY = "cr-league-championship-record-tab";
export const GARAGE_PANEL_KEY = "cr-league-garage-panel";
export const MAP_STATS_EXPANDED_KEY = "cr-league-map-stats-expanded";
const mapStatsListeners = new Set<() => void>();

function subscribeMapStats(listener: () => void) {
  mapStatsListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === MAP_STATS_EXPANDED_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    mapStatsListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function mapStatsSnapshot() {
  return safeStorage.get(MAP_STATS_EXPANDED_KEY) !== "0";
}

export function savedRecordTab(): ChampionshipRecordTab {
  const saved = safeStorage.get(CHAMPIONSHIP_RECORD_TAB_KEY);
  return saved === "standings" || saved === "palmares" || saved === "history" ? saved : "calendar";
}

export function savedCardPanel(): CardPanel {
  const saved = safeStorage.get(GARAGE_PANEL_KEY);
  return saved === "team" || saved === "shop" ? saved : "inventory";
}

export function useMapStatsExpanded() {
  const expanded = useSyncExternalStore(subscribeMapStats, mapStatsSnapshot, () => true);

  return [
    expanded,
    (next: boolean) => {
      safeStorage.set(MAP_STATS_EXPANDED_KEY, next ? "1" : "0");
      mapStatsListeners.forEach((listener) => listener());
    }
  ] as const;
}
