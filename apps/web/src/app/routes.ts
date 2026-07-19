import type { ChampionshipRecordTab } from "../features/ChampionshipView.js";
import type { GameView } from "./types.js";

export type PlanSubscreen = "plan" | "chrono";

export type AppRoute = {
  view: GameView;
  planSubscreen: PlanSubscreen;
  championshipTab: ChampionshipRecordTab;
};

export function parseAppRoute(pathname: string): AppRoute {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  const second = parts[1];

  if (first === "plan") return { view: "plan", planSubscreen: second === "chrono" ? "chrono" : "plan", championshipTab: "standings" };
  if (first === "championship") return { view: "championship", planSubscreen: "plan", championshipTab: championshipTabFromPath(second) };
  if (first === "garage") return { view: "garage", planSubscreen: "plan", championshipTab: "standings" };
  if (first === "admin") return { view: "admin", planSubscreen: "plan", championshipTab: "standings" };
  if (first === "changelog") return { view: "changelog", planSubscreen: "plan", championshipTab: "standings" };
  return { view: "drive", planSubscreen: "plan", championshipTab: "standings" };
}

export function pathForAppRoute(route: AppRoute) {
  if (route.view === "plan") return route.planSubscreen === "chrono" ? "/plan/chrono" : "/plan";
  if (route.view === "championship") {
    if (route.championshipTab === "calendar") return "/championship/circuits";
    if (route.championshipTab === "palmares") return "/championship/palmares";
    if (route.championshipTab === "history") return "/championship/history";
    return "/championship";
  }
  if (route.view === "garage") return "/garage";
  if (route.view === "admin") return "/admin";
  if (route.view === "changelog") return "/changelog";
  return "/drive";
}

function championshipTabFromPath(value: string | undefined): ChampionshipRecordTab {
  if (value === "circuits" || value === "calendar") return "calendar";
  if (value === "palmares") return "palmares";
  if (value === "history") return "history";
  return "standings";
}
