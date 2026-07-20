import { RACE_SEGMENTS, type CardId, type QualifyingRun, type RaceResult } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import type { CardFit, Translator } from "../app/helpers.js";
import { buildPlanRecommendation, type ChronoReport, type PlanRiskRead } from "../app/raceFlow.js";
import type { PlanSubscreen } from "../app/routes.js";
import type { FormState, GameView, LeagueState } from "../app/types.js";
import { DirectivePanel, type DirectiveStep } from "./DirectivePanel.js";
import { PositionBadge } from "./PositionBadge.js";
import { ReportView } from "./ReportView.js";

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
  reportCircuit,
  reportResult,
  state,
  onSetDirectiveStep,
  onSetForm,
  onSetGameView,
  onSetPlanSubscreen,
  onSetQualifyingResult,
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
  reportCircuit: CityCircuit;
  reportResult: RaceResult | null;
  state: LeagueState;
  onSetDirectiveStep: (step: DirectiveStep) => void;
  onSetForm: (form: FormState) => void;
  onSetGameView: (view: GameView) => void;
  onSetPlanSubscreen: (subscreen: PlanSubscreen) => void;
  onSetQualifyingResult: (run: QualifyingRun) => void;
  tt: Translator;
}) {
  const planRecommendation = buildPlanRecommendation({ circuitTraits, forecastPick, tt });
  const activeSubscreen = planSubscreen;
  const reportTitle = `${reportCircuit.city} ${tt(reportCircuit.layoutKey)}`;

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
          <ReportView state={state} result={reportResult} circuit={reportCircuit} playerTeamId={playerTeamId} playerDecision={playerDecision} tt={tt} />
        ) : (
          <>
            <section className="panel report-hero plan-empty-report" aria-label={tt("result_tab_report")}>
              <div className="report-headline">
                <span className="section-kicker">{tt("result_race_report")}</span>
                <h2>{reportTitle}</h2>
                <p>{tt("plan_report_empty_body")}</p>
              </div>
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
              <p>{chronoReport.suggestion}</p>
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
                    <li key={`${run.teamId}-${run.attempts}-${run.lap ?? 0}-${run.createdAt}`}>
                      <div className="chrono-session-setup">
                        <strong className="chrono-session-lap">{tt("qualifying_attempt_label", { attempt: run.attempts, lap: run.lap ?? 1 })}</strong>
                        <span className="chrono-session-choice">
                          <small>{tt("field_approach")}</small>
                          <b>{tt(`approach_${run.decision.approach}` as TranslationKey)}</b>
                        </span>
                        <span className="chrono-session-choice">
                          <small>{tt("field_preparation")}</small>
                          <b>{tt(`preparation_${run.decision.preparation}` as TranslationKey)}</b>
                        </span>
                      </div>
                      <em>{run.time.toFixed(2)}s</em>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          onSetQualifyingResult(run);
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
