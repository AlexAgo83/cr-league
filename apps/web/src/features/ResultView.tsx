import type { RaceResult } from "@cr-league/shared";
import { useId, useState } from "react";
import type { CityCircuit } from "../app/circuits.js";
import type { Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { ReplayView } from "./ReplayView.js";
import { ReportView } from "./ReportView.js";

type ResultTab = "replay" | "report";
const RESULT_TABS: ResultTab[] = ["replay", "report"];

export function ResultView({
  state,
  result,
  circuit,
  playerTeamId,
  playerDecision,
  forecastPick,
  tt
}: {
  state: LeagueState;
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  playerDecision: LeagueState["decisions"][number] | undefined;
  forecastPick: string;
  tt: Translator;
}) {
  const [tab, setTab] = useState<ResultTab>("report");
  const tabId = useId();

  function selectTab(nextTab: ResultTab) {
    setTab(nextTab);
    requestAnimationFrame(() => document.getElementById(`${tabId}-${nextTab}`)?.focus());
  }

  return (
    <div className="result-view">
      <div
        className="result-tabs"
        role="tablist"
        aria-label={tt("result_tabs_label")}
        onKeyDown={(event) => {
          const index = RESULT_TABS.indexOf(tab);
          const nextTab =
            event.key === "ArrowRight"
              ? RESULT_TABS[(index + 1) % RESULT_TABS.length]
              : event.key === "ArrowLeft"
                ? RESULT_TABS[(index + RESULT_TABS.length - 1) % RESULT_TABS.length]
                : event.key === "Home"
                  ? RESULT_TABS[0]
                  : event.key === "End"
                    ? RESULT_TABS[RESULT_TABS.length - 1]
                    : null;
          if (!nextTab) return;
          event.preventDefault();
          selectTab(nextTab);
        }}
      >
        {RESULT_TABS.map((nextTab) => (
          <button
            key={nextTab}
            type="button"
            role="tab"
            id={`${tabId}-${nextTab}`}
            aria-selected={tab === nextTab}
            aria-controls={`${tabId}-${nextTab}-panel`}
            className={tab === nextTab ? "active" : undefined}
            onClick={() => setTab(nextTab)}
          >
            {tt(`result_tab_${nextTab}`)}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${tabId}-${tab}-panel`} aria-labelledby={`${tabId}-${tab}`}>
        {tab === "replay" ? (
          <ReplayView result={result} circuit={circuit} playerTeamId={playerTeamId} tt={tt} />
        ) : (
          <ReportView
            state={state}
            result={result}
            playerTeamId={playerTeamId}
            playerDecision={playerDecision}
            forecastPick={forecastPick}
            tt={tt}
          />
        )}
      </div>
    </div>
  );
}
