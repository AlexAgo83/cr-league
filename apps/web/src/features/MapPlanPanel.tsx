import type { RaceDecision } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { Translator } from "../app/helpers.js";

export function MapPlanPanel({
  className = "",
  decision,
  editLabel,
  onEdit,
  tt
}: {
  className?: string;
  decision: RaceDecision | undefined;
  editLabel?: string;
  onEdit?: () => void;
  tt: Translator;
}) {
  if (!decision) return null;
  const pitStrategy = decision.pitStrategy ?? "standard";
  const actionLabel = editLabel ?? tt("action_edit_plan");

  return (
    <div className={`map-plan-panel${className ? ` ${className}` : ""}`} aria-label={tt("map_plan_config_title")}>
      <strong>{tt("map_plan_config_title")}</strong>
      <span className="map-plan-approach">
        <ConfigChoiceMarker value={CONFIG_MARKERS.approach[decision.approach]} />
        <span className="map-plan-copy">
          <b>{tt("field_approach")}</b>
          <em>{tt(`approach_${decision.approach}_short` as TranslationKey)}</em>
        </span>
      </span>
      <span className="map-plan-preparation">
        <ConfigChoiceMarker value={CONFIG_MARKERS.preparation[decision.preparation]} />
        <span className="map-plan-copy">
          <b>{tt("field_preparation")}</b>
          <em>{tt(`preparation_${decision.preparation}` as TranslationKey)}</em>
        </span>
      </span>
      <span className="map-plan-pit">
        <ConfigChoiceMarker value={CONFIG_MARKERS.pitStrategy[pitStrategy]} />
        <span className="map-plan-copy">
          <b>{tt("field_pit_strategy")}</b>
          <em>{tt(`pit_strategy_${pitStrategy}_short` as TranslationKey)}</em>
        </span>
      </span>
      <span className="map-plan-card">
        <CardChoiceMarker active={Boolean(decision.cardId)} />
        <span className="map-plan-copy">
          <b>{tt("field_card")}</b>
          <em>{decision.cardId ? tt(`card_${decision.cardId}` as TranslationKey) : "-"}</em>
        </span>
      </span>
      {onEdit ? (
        <button className="map-plan-edit-button" type="button" aria-label={actionLabel.split(" ")[0]} title={actionLabel} onClick={onEdit}>
          {actionLabel.split(" ")[0]}
        </button>
      ) : null}
    </div>
  );
}

const CONFIG_MARKERS = {
  approach: { prudent: 1, balanced: 2, aggressive: 3 },
  preparation: { speed: 1, reliability: 2, weather: 3 },
  pitStrategy: { heavy_pack: 1, standard: 2, mini_pack: 3 }
} as const;

function ConfigChoiceMarker({ value }: { value: 1 | 2 | 3 }) {
  return (
    <i className="map-plan-choice-marker" aria-hidden="true">
      {[1, 2, 3].map((step) => (
        <i key={step} className={step === value ? "active" : undefined} />
      ))}
    </i>
  );
}

function CardChoiceMarker({ active }: { active: boolean }) {
  return <i className={active ? "map-plan-card-marker active" : "map-plan-card-marker"} aria-hidden="true" />;
}
