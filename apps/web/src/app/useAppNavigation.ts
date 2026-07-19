import { useEffect, useMemo, useState } from "react";
import { CHAMPIONSHIP_RECORD_TAB_KEY, savedRecordTab, type ChampionshipRecordTab } from "../features/ChampionshipView.js";
import { DIRECTIVE_STEP_KEY, savedDirectiveStep, type DirectiveStep } from "../features/DirectivePanel.js";
import { GARAGE_PANEL_KEY, savedCardPanel, type CardPanel } from "../features/GarageView.js";
import type { GameView, ProfileSession } from "./types.js";
import { parseAppRoute, pathForAppRoute, type PlanSubscreen } from "./routes.js";

export function useAppNavigation(profileSession: ProfileSession | null, onRouteChange: () => void) {
  const initialRoute = useMemo(() => parseAppRoute(window.location.pathname), []);
  const [gameView, setGameView] = useState<GameView>(() => initialRoute.view);
  const [planSubscreen, setPlanSubscreen] = useState<PlanSubscreen>(() => initialRoute.planSubscreen);
  const [directiveStep, setDirectiveStep] = useState<DirectiveStep>(() => initialRoute.directiveStep === "approach" ? savedDirectiveStep() : initialRoute.directiveStep);
  const [championshipRecordTab, setChampionshipRecordTab] = useState<ChampionshipRecordTab>(() => initialRoute.championshipTab === "standings" ? savedRecordTab() : initialRoute.championshipTab);
  const [garagePanel, setGaragePanel] = useState<CardPanel>(() => initialRoute.garagePanel === "inventory" ? savedCardPanel() : initialRoute.garagePanel);

  useEffect(() => {
    const applyRoute = () => {
      const route = parseAppRoute(window.location.pathname);
      const nextView = route.view === "admin" && !profileSession ? "drive" : route.view;
      setGameView(nextView);
      setPlanSubscreen(route.planSubscreen);
      setDirectiveStep(route.directiveStep === "approach" ? savedDirectiveStep() : route.directiveStep);
      setChampionshipRecordTab(route.championshipTab === "standings" ? savedRecordTab() : route.championshipTab);
      setGaragePanel(route.garagePanel === "inventory" ? savedCardPanel() : route.garagePanel);
      onRouteChange();
    };

    window.addEventListener("popstate", applyRoute);
    return () => window.removeEventListener("popstate", applyRoute);
  }, [onRouteChange, profileSession]);

  useEffect(() => {
    if (gameView === "admin" && (!profileSession || profileSession.admin === false)) {
      setGameView("drive");
      return;
    }

    const path = pathForAppRoute({ view: gameView, planSubscreen, directiveStep, championshipTab: championshipRecordTab, garagePanel });
    if (window.location.pathname !== path) window.history.pushState(null, "", path);
  }, [championshipRecordTab, directiveStep, gameView, garagePanel, planSubscreen, profileSession]);

  useEffect(() => {
    localStorage.setItem(CHAMPIONSHIP_RECORD_TAB_KEY, championshipRecordTab);
  }, [championshipRecordTab]);

  useEffect(() => {
    localStorage.setItem(DIRECTIVE_STEP_KEY, directiveStep);
  }, [directiveStep]);

  useEffect(() => {
    localStorage.setItem(GARAGE_PANEL_KEY, garagePanel);
  }, [garagePanel]);

  return {
    gameView,
    planSubscreen,
    directiveStep,
    championshipRecordTab,
    garagePanel,
    setGameView,
    setPlanSubscreen,
    setDirectiveStep,
    setChampionshipRecordTab,
    setGaragePanel
  };
}
