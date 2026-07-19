import type { RaceDecision } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { Translator } from "../app/helpers.js";

export function MapPlanPanel({ decision, tt }: { decision: RaceDecision | undefined; tt: Translator }) {
  if (!decision) return null;
  const pitStrategy = decision.pitStrategy ?? "standard";

  return (
    <div className="map-plan-panel" aria-label={tt("map_plan_config_title")}>
      <strong>{tt("map_plan_config_title")}</strong>
      <span className="map-plan-approach">
        <b>{tt("field_approach")}</b>
        <em>{tt(`approach_${decision.approach}_short` as TranslationKey)}</em>
      </span>
      <span className="map-plan-preparation">
        <b>{tt("field_preparation")}</b>
        <em>{tt(`preparation_${decision.preparation}` as TranslationKey)}</em>
      </span>
      <span className="map-plan-pit">
        <b>{tt("field_pit_strategy")}</b>
        <em>{tt(`pit_strategy_${pitStrategy}_short` as TranslationKey)}</em>
      </span>
      <span className="map-plan-card">
        <b>{tt("field_card")}</b>
        <em>{decision.cardId ? tt(`card_${decision.cardId}` as TranslationKey) : tt("card_none")}</em>
      </span>
    </div>
  );
}
