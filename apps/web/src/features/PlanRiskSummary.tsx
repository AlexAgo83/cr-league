import type { PlanRiskRead } from "../app/raceFlow.js";
import { useT } from "../i18n/index.js";
import type { TranslationKey } from "../i18n/index.js";

export function PlanRiskSummary({ read, compact = false, note, lockLabel, lockTitle }: { read: PlanRiskRead; compact?: boolean; note?: string; lockLabel?: string; lockTitle?: string }) {
  const tt = useT();
  return (
    <section className={["plan-risk-summary", compact ? "compact" : "", `plan-risk-${read.level}`].filter(Boolean).join(" ")} aria-label={tt("plan_risk_title")}>
      <strong>{tt(`plan_risk_level_${read.level}` as TranslationKey)}</strong>
      {lockLabel ? (
        <span className="plan-risk-lock-badge" title={lockTitle}>
          {lockLabel}
        </span>
      ) : null}
      <span className="plan-risk-strength">
        <b className="plan-risk-line-label">{tt("plan_risk_strength_label")}</b> {tt(read.strengthKey)}
      </span>
      <span className="plan-risk-failure">
        <b className="plan-risk-line-label">{tt("plan_risk_failure_label")}</b> {tt(read.failureKey)}
      </span>
      <em>{tt("plan_risk_band", { value: tt(read.bandKey) })}</em>
      {note ? <span className="plan-risk-note">{note}</span> : null}
    </section>
  );
}
