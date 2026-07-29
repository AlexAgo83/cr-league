import { useSyncExternalStore } from "react";
import { safeStorage } from "./appStorage.js";

export type ChampionshipRecordTab = "standings" | "calendar" | "palmares" | "history";
export type CardPanel = "team" | "inventory" | "shop";

export const CHAMPIONSHIP_RECORD_TAB_KEY = "cr-league-championship-record-tab";
export const GARAGE_PANEL_KEY = "cr-league-garage-panel";
export const MAP_STATS_EXPANDED_KEY = "cr-league-map-stats-expanded";
export const MAP_INFO_EXPANDED_KEY = "cr-league-map-info-expanded";

/**
 * Every remembered map toggle has the same shape: one key, expanded unless the key says "0", and
 * a listener set so the panels on screen agree with each other and across tabs.
 */
function createMapToggle(key: string) {
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const snapshot = () => safeStorage.get(key) !== "0";

  return function useMapToggle() {
    const expanded = useSyncExternalStore(subscribe, snapshot, () => true);
    return [
      expanded,
      (next: boolean) => {
        safeStorage.set(key, next ? "1" : "0");
        listeners.forEach((listener) => listener());
      }
    ] as const;
  };
}

export const useMapStatsExpanded = createMapToggle(MAP_STATS_EXPANDED_KEY);
export const useMapInfoExpanded = createMapToggle(MAP_INFO_EXPANDED_KEY);

export function savedRecordTab(): ChampionshipRecordTab {
  const saved = safeStorage.get(CHAMPIONSHIP_RECORD_TAB_KEY);
  return saved === "standings" || saved === "palmares" || saved === "history" ? saved : "calendar";
}

export function savedCardPanel(): CardPanel {
  const saved = safeStorage.get(GARAGE_PANEL_KEY);
  return saved === "team" || saved === "shop" ? saved : "inventory";
}

