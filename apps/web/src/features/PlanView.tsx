import { RACE_SEGMENTS, type CardId, type QualifyingRun, type RaceResult } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import type { CardFit, Translator } from "../app/helpers.js";
import { buildPlanRecommendation, type ChronoReport, type PlanRiskRead } from "../app/raceFlow.js";
import type { PlanSubscreen } from "../app/routes.js";
import type { FormState, GameView, LeagueState } from "../app/types.js";
import { DirectivePanel, type DirectiveStep } from "./DirectivePanel.js";
import { PositionBadge } from "./PositionBadge.js";
import { lazy, Suspense } from "react";

const ReportView = lazy(() => import("./ReportView.js").then((module) => ({ default: module.ReportView })));

export function PlanView({
  cardLocked,
  chronoReport,
  circuitTraits,
  directiveStep,
  disabled,
  form,
  forecastPick,
  ownedCardIds,
  locked,
  planSubscreen,
  playerQualifyingRuns,
  playerDecision,
  playerTeamId,
  planRiskRead,
  qualifyingAttemptLimit,
  qualifyingAttemptsLeft,
  selectedCardFit,
  selectedCardId,
  primaryCommand,
  reportCircuit,
  reportResult,
  state,
  onSetDirectiveStep,
  onSetForm,
  onSetGameView,
  onSetPlanSubscreen,
  onOpenRaceReplay,
  onOpenQualifyingRun,
  onOpenQualifyingHistory,
  tt
}: {
  cardLocked: boolean;
  chronoReport: ChronoReport;
  circuitTraits: LeagueState["currentGrandPrix"] extends never ? never : { grip: number; overtaking: number; energy: number };
  directiveStep: DirectiveStep;
  disabled: boolean;
  form: FormState;
  forecastPick: string;
  ownedCardIds: CardId[];
  locked: boolean;
  planSubscreen: PlanSubscreen;
  playerQualifyingRuns: QualifyingRun[];
  playerDecision: LeagueState["decisions"][number] | undefined;
  playerTeamId: string | undefined;
  planRiskRead: PlanRiskRead;
  qualifyingAttemptLimit: number;
  qualifyingAttemptsLeft: number;
  selectedCardFit: CardFit | null;
  selectedCardId: FormState["cardId"];
  primaryCommand: { label: string; action: () => void | Promise<void>; disabled: boolean };
  reportCircuit: CityCircuit;
  reportResult: RaceResult | null;
  state: LeagueState;
  onSetDirectiveStep: (step: DirectiveStep) => void;
  onSetForm: (form: FormState) => void;
  onSetGameView: (view: GameView) => void;
  onSetPlanSubscreen: (subscreen: PlanSubscreen) => void;
  onOpenRaceReplay: () => void;
  onOpenQualifyingRun: () => void;
  onOpenQualifyingHistory: (run: QualifyingRun) => void;
  tt: Translator;
}) {
  const planRecommendation = buildPlanRecommendation({ circuitTraits, forecastPick, tt });
  const activeSubscreen = planSubscreen;
  const reportTitle = `${reportCircuit.city} ${tt(reportCircuit.layoutKey)}`;
  const chronoCardClass = (cardId?: CardId) => `chrono-session-choice type-card${isChronoCardRelevant(cardId, forecastPick) ? "" : " is-faded"}`;

  return (
    <div className="plan-view">
      <div className="plan-steps plan-subscreen-tabs" role="tablist" aria-label={tt("plan_subscreen_label")}>
        <button type="button" role="tab" aria-selected={activeSubscreen === "plan"} className={activeSubscreen === "plan" ? "plan-step active" : "plan-step"} onClick={() => onSetPlanSubscreen("plan")}>
          <span className="plan-step-label">{tt("plan_subscreen_plan")}</span>
        </button>
        <button type="button" role="tab" aria-selected={activeSubscreen === "chrono"} className={activeSubscreen === "chrono" ? "plan-step active" : "plan-step"} onClick={() => onSetPlanSubscreen("chrono")}>
          <span className="plan-step-label">{tt("plan_subscreen_chrono")}</span>
        </button>
        <button type="button" role="tab" aria-selected={activeSubscreen === "report"} className={activeSubscreen === "report" ? "plan-step active" : "plan-step"} onClick={() => onSetPlanSubscreen("report")}>
          <span className="plan-step-label">{tt("plan_subscreen_gp")}</span>
        </button>
      </div>
      {activeSubscreen === "report" ? (
        reportResult ? (
          <div className="plan-gp-report-shell">
            <Suspense fallback={<p className="pending-feedback" role="status">{tt("status_loading_view")}</p>}>
              <ReportView state={state} result={reportResult} circuit={reportCircuit} playerTeamId={playerTeamId} playerDecision={playerDecision} onOpenReplay={onOpenRaceReplay} replayActionVariant="primary" tt={tt} />
            </Suspense>
          </div>
        ) : (
          <>
            <section className="panel report-hero plan-empty-report" aria-label={tt("result_tab_report")}>
              <header className="chrono-report-header">
                <div>
                  <span className="section-kicker">{tt("result_race_report")}</span>
                  <h2>{reportTitle}</h2>
                </div>
                <div className="chrono-report-prompt">
                  <p>{locked ? tt("plan_report_empty_body") : tt("plan_report_pending_plan_body")}</p>
                  <button type="button" className={`primary-command${!locked && chronoReport.best ? " highlight-command" : ""}`} onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
                    {locked ? primaryCommand.label : tt("directive_confirm_action")}
                  </button>
                </div>
              </header>
            </section>
            <div className="report-main-grid">
              <div className="report-content-column">
                <section className="panel report-phases">
                  <h3>{tt("report_phases")}</h3>
                  <ol className="report-phases-list" aria-label={tt("report_phases")}>
                    {RACE_SEGMENTS.map((segment, index) => (
                      <li key={segment}>
                        <strong>
                          {tt("result_replay_phase")} {index + 1}
                        </strong>
                        <span>{tt("plan_report_empty_placeholder")}</span>
                      </li>
                    ))}
                  </ol>
                </section>
                <section className="panel report-rewards">
                  <h3>{tt("report_rewards")}</h3>
                  <p>{tt("plan_report_empty_placeholder")}</p>
                </section>
                <section className="panel report-key-moments">
                  <h3>{tt("report_key_moments")}</h3>
                  <p>{tt("plan_report_empty_placeholder")}</p>
                </section>
              </div>
              <section className="panel report-side-recap">
                <h2>{tt("result_recap_title")}</h2>
                <div className="recap-grid">
                  {(["result_difference", "result_your_directive", "result_plan_read", "result_next_lesson"] as const).map((key) => (
                    <section key={key}>
                      <h3>{tt(key)}</h3>
                      <p>{tt("plan_report_empty_placeholder")}</p>
                    </section>
                  ))}
                </div>
              </section>
            </div>
          </>
        )
      ) : activeSubscreen === "chrono" ? (
        <section className="panel chrono-report-panel" aria-label={tt("chrono_report_title")}>
          <div className="chrono-report-hero">
            <header className="chrono-report-header">
              <div>
                <span className="section-kicker">{tt("chrono_report_kicker")}</span>
                <h2>{tt("chrono_report_title")}</h2>
              </div>
              <div className="chrono-report-prompt">
                <p>{chronoReport.suggestion}</p>
                <button
                  type="button"
                  className={`primary-command${chronoReport.best ? "" : " highlight-command"}`}
                  onClick={() => {
                    onSetGameView("drive");
                    onOpenQualifyingRun();
                  }}
                  disabled={disabled || qualifyingAttemptsLeft <= 0}
                >
                  {tt("action_qualifying")}
                </button>
              </div>
            </header>
            <div className="chrono-report-stats">
              <div>
                <span>{tt("qualifying_best")}</span>
                <strong>{chronoReport.best ? `${chronoReport.best.time.toFixed(2)}s` : "--"}</strong>
              </div>
              <div>
                <span>{tt("qualifying_result_rank")}</span>
                <strong>{chronoReport.gridPosition ? <PositionBadge position={chronoReport.gridPosition} /> : chronoReport.gridLabel}</strong>
              </div>
              <div>
                <span>{tt("chrono_report_delta")}</span>
                <strong>{chronoReport.deltaLabel}</strong>
              </div>
              <div>
                <span>{tt("qualifying_remaining")}</span>
                <strong>
                  {qualifyingAttemptsLeft}/{qualifyingAttemptLimit}
                </strong>
              </div>
            </div>
          </div>
          <div className="chrono-report-history">
            <strong>{tt("chrono_report_history_title")}</strong>
            {playerQualifyingRuns.length ? (
              <ol>
                {[...playerQualifyingRuns]
                  .sort((left, right) => right.attempts - left.attempts || (right.lap ?? 0) - (left.lap ?? 0))
                  .map((run) => (
                    <li key={`${run.teamId}-${run.attempts}-${run.lap ?? 0}-${run.createdAt}`} className={run === chronoReport.best ? "best-session" : undefined}>
                      <div className="chrono-session-setup">
                        <span className="chrono-session-lap">
                          <small>
                            {tt("qualifying_attempt_short")} {run.attempts}
                          </small>
                          <b>{tt("qualifying_result_lap_value", { lap: run.lap ?? 1 })}</b>
                        </span>
                        <span className={`chrono-session-choice type-approach approach-${run.decision.approach}`}>
                          <small>{tt("field_approach")}</small>
                          <b>{tt(`approach_${run.decision.approach}` as TranslationKey)}</b>
                        </span>
                        <span className={`chrono-session-choice type-preparation preparation-${run.decision.preparation}`}>
                          <small>{tt("field_preparation")}</small>
                          <b>{tt(`preparation_${run.decision.preparation}` as TranslationKey)}</b>
                        </span>
                        <span className="chrono-session-choice type-pit is-faded">
                          <small>{tt("field_pit_strategy")}</small>
                          <b>{tt(`pit_strategy_${run.decision.pitStrategy ?? "standard"}` as TranslationKey)}</b>
                        </span>
                        <span className={chronoCardClass(run.decision.cardId)}>
                          <small>{tt("field_card")}</small>
                          <b>{run.decision.cardId ? tt(`card_${run.decision.cardId}` as TranslationKey) : tt("card_none")}</b>
                        </span>
                      </div>
                      <em>{run.time.toFixed(2)}s</em>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          onOpenQualifyingHistory(run);
                          onSetGameView("drive");
                        }}
                      >
                        {tt("action_qualifying_history")}
                      </button>
                    </li>
                  ))}
              </ol>
            ) : (
              <p>{tt("chrono_report_history_empty")}</p>
            )}
          </div>
        </section>
      ) : (
        <DirectivePanel
          form={form}
          setForm={onSetForm}
          ownedCardIds={ownedCardIds}
          selectedCardId={selectedCardId}
          selectedCardFit={selectedCardFit}
          step={directiveStep}
          circuitTraits={circuitTraits}
          planRiskRead={planRiskRead}
          planRecommendation={planRecommendation}
          cardLocked={cardLocked}
          disabled={disabled}
          locked={locked}
          onSelectStep={onSetDirectiveStep}
          tt={tt}
        />
      )}
    </div>
  );
}

function isChronoCardRelevant(cardId: CardId | undefined, forecastPick: string) {
  return cardId === "qualifying_focus" || cardId === "launch_boost" || (cardId === "rain_grip" && forecastPick !== "dry");
}
