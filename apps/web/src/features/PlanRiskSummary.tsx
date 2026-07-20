import type { PlanRiskRead } from "../app/raceFlow.js";
import type { Translator } from "../app/helpers.js";
import type { TranslationKey } from "../i18n/index.js";

export function PlanRiskSummary({ read, tt, compact = false }: { read: PlanRiskRead; tt: Translator; compact?: boolean }) {
  return (
    <section className={["plan-risk-summary", compact ? "compact" : "", `plan-risk-${read.level}`].filter(Boolean).join(" ")} aria-label={tt("plan_risk_title")}>
      <strong>{tt(`plan_risk_level_${read.level}` as TranslationKey)}</strong>
      <span>{tt("plan_risk_strength", { value: tt(read.strengthKey) })}</span>
      <span>{tt("plan_risk_failure", { value: tt(read.failureKey) })}</span>
      <em>{tt("plan_risk_band", { value: tt(read.bandKey) })}</em>
    </section>
  );
}
