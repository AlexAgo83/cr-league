import { type QualifyingRun } from "@cr-league/shared";
import { type SetStateAction, useCallback, useState } from "react";
import type { ResultTab } from "../features/ResultView.js";
import { type LeagueState } from "./types.js";

export function useReplayUiState() {
  const [historyReplay, setHistoryReplay] = useState<LeagueState["grandPrixHistory"][number] | null>(null);
  const [resultTab, setResultTab] = useState<ResultTab>("replay");
  const [resultOpen, setResultOpen] = useState(false);
  const [qualifyingPanelOpen, setQualifyingPanelOpen] = useState(true);
  const [qualifyingResult, setQualifyingResultState] = useState<QualifyingRun | null>(null);
  const [qualifyingReplayInitialLap, setQualifyingReplayInitialLap] = useState<number | undefined>();

  const setQualifyingResult = useCallback((result: SetStateAction<QualifyingRun | null>) => {
    setQualifyingResultState((current) => {
      const next = typeof result === "function" ? result(current) : result;
      if (!next) setQualifyingReplayInitialLap(undefined);
      return next;
    });
  }, []);

  const openQualifyingReplay = useCallback((run: QualifyingRun) => {
    setQualifyingReplayInitialLap(run.lap ?? 1);
    setQualifyingResultState(run);
  }, []);

  return {
    historyReplay,
    setHistoryReplay,
    resultTab,
    setResultTab,
    resultOpen,
    setResultOpen,
    qualifyingPanelOpen,
    setQualifyingPanelOpen,
    qualifyingResult,
    setQualifyingResult,
    qualifyingReplayInitialLap,
    openQualifyingReplay
  };
}
