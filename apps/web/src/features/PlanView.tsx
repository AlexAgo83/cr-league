import { type CardId, type QualifyingRun } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CardFit, Translator } from "../app/helpers.js";
import { buildPlanRecommendation, type ChronoReport, type PlanRiskRead } from "../app/raceFlow.js";
import type { PlanSubscreen } from "../app/routes.js";
import type { FormState, GameView, LeagueState } from "../app/types.js";
import { DirectivePanel, type DirectiveStep } from "./DirectivePanel.js";
import { PositionBadge } from "./PositionBadge.js";

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
  planRiskRead,
  qualifyingAttemptLimit,
  qualifyingAttemptsLeft,
  selectedCardFit,
  selectedCardId,
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
  planRiskRead: PlanRiskRead;
  qualifyingAttemptLimit: number;
  qualifyingAttemptsLeft: number;
  selectedCardFit: CardFit | null;
  selectedCardId: FormState["cardId"];
  onSetDirectiveStep: (step: DirectiveStep) => void;
  onSetForm: (form: FormState) => void;
  onSetGameView: (view: GameView) => void;
  onSetPlanSubscreen: (subscreen: PlanSubscreen) => void;
  onSetQualifyingResult: (run: QualifyingRun) => void;
  tt: Translator;
}) {
  const planRecommendation = buildPlanRecommendation({ circuitTraits, forecastPick, tt });

  return (
    <div className="plan-view">
      <div className="plan-steps plan-subscreen-tabs" role="tablist" aria-label={tt("plan_subscreen_label")}>
        <button type="button" role="tab" aria-selected={planSubscreen === "plan"} className={planSubscreen === "plan" ? "plan-step active" : "plan-step"} onClick={() => onSetPlanSubscreen("plan")}>
          <span className="plan-step-label">{tt("plan_subscreen_plan")}</span>
        </button>
        <button type="button" role="tab" aria-selected={planSubscreen === "chrono"} className={planSubscreen === "chrono" ? "plan-step active" : "plan-step"} onClick={() => onSetPlanSubscreen("chrono")}>
          <span className="plan-step-label">{tt("plan_subscreen_chrono")}</span>
        </button>
      </div>
      {planSubscreen === "chrono" ? (
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
