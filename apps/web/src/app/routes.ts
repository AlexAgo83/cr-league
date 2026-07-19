import type { ChampionshipRecordTab } from "../features/ChampionshipView.js";
import type { DirectiveStep } from "../features/DirectivePanel.js";
import type { CardPanel } from "../features/GarageView.js";
import type { GameView } from "./types.js";

export type PlanSubscreen = "plan" | "chrono";

export type AppRoute = {
  view: GameView;
  planSubscreen: PlanSubscreen;
  directiveStep: DirectiveStep;
  championshipTab: ChampionshipRecordTab;
  garagePanel: CardPanel;
};

export function parseAppRoute(pathname: string): AppRoute {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  const second = parts[1];

  if (first === "plan") return route("plan", second === "chrono" ? "chrono" : "plan", directiveStepFromPath(second), "standings", "inventory");
  if (first === "championship") return route("championship", "plan", "approach", championshipTabFromPath(second), "inventory");
  if (first === "garage") return route("garage", "plan", "approach", "standings", garagePanelFromPath(second));
  if (first === "admin") return route("admin", "plan", "approach", "standings", "inventory");
  if (first === "changelog") return route("changelog", "plan", "approach", "standings", "inventory");
  return route("drive", "plan", "approach", "standings", "inventory");
}

export function pathForAppRoute(route: AppRoute) {
  if (route.view === "plan") return route.planSubscreen === "chrono" ? "/plan/chrono" : `/plan/${route.directiveStep}`;
  if (route.view === "championship") {
    if (route.championshipTab === "calendar") return "/championship/circuits";
    if (route.championshipTab === "palmares") return "/championship/palmares";
    if (route.championshipTab === "history") return "/championship/history";
    return "/championship";
  }
  if (route.view === "garage") return `/garage/${route.garagePanel}`;
  if (route.view === "admin") return "/admin";
  if (route.view === "changelog") return "/changelog";
  return "/drive";
}

function route(view: GameView, planSubscreen: PlanSubscreen, directiveStep: DirectiveStep, championshipTab: ChampionshipRecordTab, garagePanel: CardPanel): AppRoute {
  return { view, planSubscreen, directiveStep, championshipTab, garagePanel };
}

function directiveStepFromPath(value: string | undefined): DirectiveStep {
  if (value === "preparation") return "preparation";
  if (value === "pit") return "pit";
  if (value === "card") return "card";
  return "approach";
}

function garagePanelFromPath(value: string | undefined): CardPanel {
  if (value === "team") return "team";
  if (value === "shop") return "shop";
  return "inventory";
}

function championshipTabFromPath(value: string | undefined): ChampionshipRecordTab {
  if (value === "circuits" || value === "calendar") return "calendar";
  if (value === "palmares") return "palmares";
  if (value === "history") return "history";
  return "standings";
}
