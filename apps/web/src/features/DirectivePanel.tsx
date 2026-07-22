import { type CSSProperties, useState } from "react";
import { APPROACH_DELTAS, PIT_STRATEGY_DELTAS, PREPARATION_DELTAS, type CardId, type DecisionDeltaKey, type DecisionDeltas } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import { sortCardIdsByName, type CardFit, type Translator } from "../app/helpers.js";
import type { PlanRecommendation, PlanRiskRead } from "../app/raceFlow.js";
import type { FormState } from "../app/types.js";
import { AssetImage } from "./AssetImage.js";
import { CARD_BADGES, CardArtImage, CardStatBadges, StatBadges, type StatBadge } from "./CardStatBadges.js";
import { Modal } from "./Modal.js";
import { ModalHero } from "./ModalHero.js";
import { PlanRiskSummary } from "./PlanRiskSummary.js";

type TraitStats = {
  grip: number;
  overtaking: number;
  energy: number;
};

const APPROACHES = ["prudent", "balanced", "aggressive"] as const;
const PREPARATIONS = ["speed", "reliability", "weather"] as const;
const PIT_STRATEGIES = ["heavy_pack", "standard", "mini_pack"] as const;
const ENGINE_STATS = ["pace", "control", "reliability", "weatherReadiness", "aggression"] as const satisfies readonly DecisionDeltaKey[];
const PLAN_MARKERS = {
  approach: { prudent: 1, balanced: 2, aggressive: 3 },
  preparation: { speed: 1, reliability: 2, weather: 3 },
  pitStrategy: { heavy_pack: 1, standard: 2, mini_pack: 3 }
} as const;
export type DirectiveStep = "approach" | "preparation" | "pit" | "card";
export const DIRECTIVE_STEP_KEY = "cr-league-directive-step";
const CARD_CONSUMPTION_HELP_KEY = "cr-league-card-consumption-help-v2";
type PrimaryCommand = { label: string; action: () => void | Promise<void>; disabled: boolean };

export const APPROACH_ART: Record<(typeof APPROACHES)[number], string> = {
  prudent: "/assets/crl/approach-prudent.png",
  balanced: "/assets/crl/approach-balanced.png",
  aggressive: "/assets/crl/approach-aggressive.png"
};

export const PREPARATION_ART: Record<(typeof PREPARATIONS)[number], string> = {
  speed: "/assets/crl/preparation-speed.png",
  reliability: "/assets/crl/preparation-reliability.png",
  weather: "/assets/crl/preparation-weather.png"
};

export const PIT_ART: Record<(typeof PIT_STRATEGIES)[number], string> = {
  heavy_pack: "/assets/crl/pit-strategy-heavy-pack.png",
  standard: "/assets/crl/pit-strategy-standard.png",
  mini_pack: "/assets/crl/pit-strategy-mini-pack.png"
};

export function savedDirectiveStep(): DirectiveStep {
  const saved = localStorage.getItem(DIRECTIVE_STEP_KEY);
  return saved === "preparation" || saved === "pit" || saved === "card" ? saved : "approach";
}

function badgesFromDeltas(deltas: DecisionDeltas): StatBadge[] {
  return (Object.entries(deltas) as Array<[DecisionDeltaKey, number | undefined]>)
    .filter((entry): entry is [DecisionDeltaKey, number] => Boolean(entry[1]))
    .map(([trait, value]) => ({ trait, sign: value > 0 ? "+" : "-", label: ENGINE_STAT_LABELS[trait], value: Math.abs(value) }));
}

const ENGINE_STAT_LABELS: Record<NonNullable<StatBadge["trait"]>, TranslationKey> = {
  grip: "circuit_grip",
  overtaking: "circuit_overtaking",
  energy: "circuit_energy",
  pace: "engine_stat_pace",
  control: "engine_stat_control",
  reliability: "engine_stat_reliability",
  weatherReadiness: "engine_stat_weather",
  aggression: "engine_stat_aggression"
};

const ENGINE_STAT_HINTS: Record<DecisionDeltaKey, TranslationKey> = {
  pace: "engine_stat_pace_hint",
  control: "engine_stat_control_hint",
  reliability: "engine_stat_reliability_hint",
  weatherReadiness: "engine_stat_weather_hint",
  aggression: "engine_stat_aggression_hint"
};

function ImpactBadges({ badges, tt }: { badges: StatBadge[]; tt: Translator }) {
  return <span className="card-stat-badges"><StatBadges badges={badges} tt={tt} /></span>;
}

function DirectiveChoiceArt({ src }: { src: string }) {
  return <AssetImage className="directive-choice-art" src={src} alt="" />;
}

function PlanChoiceMarker({ value }: { value: 1 | 2 | 3 }) {
  return (
    <span className="plan-choice-title-marker map-plan-choice-marker" aria-hidden="true">
      {[1, 2, 3].map((step) => (
        <i key={step} className={step === value ? "active" : undefined} />
      ))}
    </span>
  );
}

function PlanCardMarker({ active }: { active: boolean }) {
  return <span className={active ? "plan-choice-title-marker map-plan-card-marker active" : "plan-choice-title-marker map-plan-card-marker"} aria-hidden="true" />;
}

function directiveModifiers(form: FormState, selectedCardId: FormState["cardId"]) {
  const modifiers: Record<DecisionDeltaKey, number> = { pace: 0, control: 0, reliability: 0, weatherReadiness: 0, aggression: 0 };
  const add = (entry: StatBadge) => {
    if (!entry.trait || entry.trait === "grip" || entry.trait === "overtaking" || entry.trait === "energy") return;
    modifiers[entry.trait] += (entry.sign === "+" ? 1 : -1) * (entry.value ?? 1);
  };

  badgesFromDeltas(APPROACH_DELTAS[form.approach]).forEach(add);
  badgesFromDeltas(PREPARATION_DELTAS[form.preparation]).forEach(add);
  badgesFromDeltas(PIT_STRATEGY_DELTAS[form.pitStrategy]).forEach(add);
  if (selectedCardId) CARD_BADGES[selectedCardId].forEach((entry) => add({ ...entry, value: 2 }));

  return modifiers;
}

function signedModifier(value: number) {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return "±0";
}

function planRecommendationRows({
  form,
  selectedCardId,
  planRecommendation,
  planRiskRead,
  qualifyingRunCount,
  locked,
  tt
}: {
  form: FormState;
  selectedCardId: FormState["cardId"];
  planRecommendation: PlanRecommendation;
  planRiskRead: PlanRiskRead;
  qualifyingRunCount: number;
  locked?: boolean;
  tt: Translator;
}) {
  const planKey = planRiskRead.level === "high_upside" ? "high_upside" : planRiskRead.level;
  const nextKey = locked ? "locked" : qualifyingRunCount > 0 ? "with_chrono" : "no_chrono";
  return [
    { label: tt("plan_recommendation_trait_label"), value: tt(`plan_recommendation_circuit_${planRecommendation.traitKey}` as TranslationKey) },
    { label: tt("plan_recommendation_weather_label"), value: tt(`plan_recommendation_weather_read_${planRecommendation.weatherKey}` as TranslationKey) },
    {
      label: tt("plan_recommendation_plan_label"),
      value: tt(`plan_recommendation_plan_${planKey}` as TranslationKey, {
        approach: tt(`approach_${form.approach}` as TranslationKey),
        preparation: tt(`preparation_${form.preparation}` as TranslationKey),
        pitStrategy: tt(`pit_strategy_${form.pitStrategy}` as TranslationKey),
        card: selectedCardId ? tt(`card_${selectedCardId}` as TranslationKey) : tt("card_none")
      })
    },
    { label: tt("plan_recommendation_next_label"), value: tt(`plan_recommendation_next_${nextKey}` as TranslationKey) }
  ];
}

export function DirectivePanel({
  form,
  setForm,
  ownedCardIds,
  selectedCardId,
  selectedCardFit,
  step,
  circuitTraits: _circuitTraits,
  planRiskRead,
  planRecommendation,
  primaryCommand,
  qualifyingRunCount = 0,
  qualifyingAttemptsLeft = 0,
  cardLocked,
  disabled,
  locked,
  onQualifying,
  onSelectStep,
  tt
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  ownedCardIds: CardId[];
  selectedCardId: FormState["cardId"];
  selectedCardFit: CardFit | null;
  step: DirectiveStep;
  circuitTraits: TraitStats;
  planRiskRead: PlanRiskRead;
  planRecommendation?: PlanRecommendation;
  primaryCommand: PrimaryCommand;
  qualifyingRunCount?: number;
  qualifyingAttemptsLeft?: number;
  cardLocked?: boolean;
  disabled?: boolean;
  locked?: boolean;
  onQualifying?: () => void;
  onSelectStep: (step: DirectiveStep) => void;
  tt: Translator;
}) {
  const cardChoices = ["", ...sortCardIdsByName(ownedCardIds, tt)] as Array<"" | CardId>;
  const selectedCardLabel = selectedCardId ? tt(`card_${selectedCardId}` as TranslationKey) : tt("card_none");
  const canRunQualifying = Boolean(onQualifying && !locked && qualifyingAttemptsLeft > 0);
  const hasQualifyingRun = qualifyingRunCount > 0;
  const modifiers = directiveModifiers(form, selectedCardId);
  const [cardHelpOpen, setCardHelpOpen] = useState(false);
  const [dismissCardHelp, setDismissCardHelp] = useState(false);

  function selectCard(cardId: "" | CardId) {
    setForm({ ...form, cardId });
    if (!cardId || localStorage.getItem(CARD_CONSUMPTION_HELP_KEY)) return;
    setDismissCardHelp(false);
    setCardHelpOpen(true);
  }

  function closeCardHelp() {
    if (dismissCardHelp) localStorage.setItem(CARD_CONSUMPTION_HELP_KEY, "1");
    setCardHelpOpen(false);
  }

  const steps = [
    { key: "approach" as const, label: tt("field_approach"), value: tt(`approach_${form.approach}` as TranslationKey) },
    { key: "preparation" as const, label: tt("field_preparation"), value: tt(`preparation_${form.preparation}` as TranslationKey) },
    { key: "pit" as const, label: tt("field_pit_strategy"), value: tt(`pit_strategy_${form.pitStrategy}` as TranslationKey) },
    { key: "card" as const, label: tt("field_card"), value: selectedCardLabel }
  ];

  return (
    <>
    {cardHelpOpen ? (
      <Modal label={tt("directive_card_consumption_help_title")} closeLabel={tt("action_close")} showCloseButton onClose={closeCardHelp}>
        <ModalHero image="/assets/crl/send-plan-modal.png" kicker={tt("field_card")} title={tt("directive_card_consumption_help_title")} />
        <p>{tt("directive_card_consumption_help_body")}</p>
        <label className="checkbox-field onboarding-dismiss">
          <input type="checkbox" checked={dismissCardHelp} onChange={(event) => setDismissCardHelp(event.currentTarget.checked)} />
          {tt("directive_card_consumption_help_dismiss")}
        </label>
        <div className="actions">
          <button type="button" onClick={closeCardHelp}>
            {tt("action_got_it")}
          </button>
        </div>
      </Modal>
    ) : null}
    <section className="panel directive-panel directive-briefing-panel">
      <header className="directive-heading">
        <span className="section-kicker">{tt("directive_kicker")}</span>
        <h2>{tt("directive_title")}</h2>
        {planRecommendation ? (
          <div className="plan-recommendation" aria-label={tt("plan_recommendation_title")}>
            {planRecommendationRows({ form, selectedCardId, planRecommendation, planRiskRead, qualifyingRunCount, locked, tt }).map((row) => (
              <section key={row.label}>
                <strong>{row.label}</strong>
                <p>{row.value}</p>
              </section>
            ))}
          </div>
        ) : null}
      </header>

      <div className="directive-briefing" aria-label={tt("directive_track_read")}>
        {ENGINE_STATS.map((trait) => {
          const modifier = modifiers[trait];
          const value = Math.max(0, Math.min(100, 50 + modifier));
          return (
            <span key={trait} className={`directive-trait map-trait-${trait}`}>
              <span className="directive-trait-head">
                <strong>{tt(ENGINE_STAT_LABELS[trait])}</strong>
                <b className="directive-trait-score">
                  <span className="directive-trait-value type-chrono">{value}</span>
                  <span className={`directive-trait-modifier type-chrono ${modifier > 0 ? "bonus" : modifier < 0 ? "weakness" : "neutral"}`}>{signedModifier(modifier)}</span>
                </b>
              </span>
              <span className="directive-trait-gauge" role="presentation">
                <i style={{ "--trait-value": `${value}%` } as CSSProperties} />
              </span>
              <em>{tt(`trait_level_${traitLevel(value)}` as TranslationKey)}</em>
              <small>{tt(ENGINE_STAT_HINTS[trait])}</small>
            </span>
          );
        })}
      </div>
    </section>

    <section className="panel directive-panel directive-selection-panel">
      <div className="directive-summary-stack">
        <PlanRiskSummary read={planRiskRead} tt={tt} lockLabel={locked ? tt("race_step_locked") : undefined} lockTitle={locked ? `${tt("directive_locked_title")}. ${tt("directive_locked_body")}` : undefined} />
      </div>
      <div className="plan-steps directive-plan-steps" role="tablist" aria-label={tt("directive_title")}>
        {steps.map((entry) => (
          <button key={entry.key} type="button" role="tab" aria-selected={step === entry.key} aria-label={`${entry.label}: ${entry.value}`} className={`plan-step plan-step-${entry.key}${step === entry.key ? " active" : ""}`} onClick={() => onSelectStep(entry.key)}>
            <span className="plan-step-label">{entry.label}</span>
            <span className="plan-step-value">{entry.value}</span>
          </button>
        ))}
      </div>
      {step === "approach" ? (
        <fieldset className="choice-group directive-choice-group directive-choice-approach" aria-label={tt("field_approach")}>
          <div className="choice-grid directive-choice-grid">
            {APPROACHES.map((approach) => (
              <button key={approach} type="button" className={`${form.approach === approach ? "choice-card selected" : "choice-card"} approach-${approach}`} aria-label={`${tt("field_approach")}: ${tt(`approach_${approach}` as TranslationKey)}`} aria-pressed={form.approach === approach} onClick={() => setForm({ ...form, approach })} disabled={disabled}>
                {approach === "prudent" ? <span className="approach-chrono-badge" aria-hidden="true" /> : null}
                {approach === "balanced" ? <span className="approach-balance-badge" aria-hidden="true" /> : null}
                {approach === "aggressive" ? <span className="approach-skull-badge" aria-hidden="true" /> : null}
                <span className="plan-choice-title">
                  <PlanChoiceMarker value={PLAN_MARKERS.approach[approach]} />
                  <strong>{tt(`approach_${approach}` as TranslationKey)}</strong>
                </span>
                <small>{tt(`approach_${approach}_hint` as TranslationKey)}</small>
                <ImpactBadges badges={badgesFromDeltas(APPROACH_DELTAS[approach])} tt={tt} />
                <DirectiveChoiceArt src={APPROACH_ART[approach]} />
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === "preparation" ? (
        <fieldset className="choice-group directive-choice-group directive-choice-preparation" aria-label={tt("field_preparation")}>
          <div className="choice-grid directive-choice-grid">
            {PREPARATIONS.map((preparation) => (
              <button key={preparation} type="button" className={`${form.preparation === preparation ? "choice-card selected" : "choice-card"} preparation-${preparation}`} aria-label={`${tt("field_preparation")}: ${tt(`preparation_${preparation}` as TranslationKey)}`} aria-pressed={form.preparation === preparation} onClick={() => setForm({ ...form, preparation })} disabled={disabled}>
                <span className="plan-choice-title">
                  <PlanChoiceMarker value={PLAN_MARKERS.preparation[preparation]} />
                  <strong>{tt(`preparation_${preparation}` as TranslationKey)}</strong>
                </span>
                <small>{tt(`preparation_${preparation}_hint` as TranslationKey)}</small>
                <ImpactBadges badges={badgesFromDeltas(PREPARATION_DELTAS[preparation])} tt={tt} />
                <DirectiveChoiceArt src={PREPARATION_ART[preparation]} />
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === "pit" ? (
        <fieldset className="choice-group directive-choice-group directive-choice-pit" aria-label={tt("field_pit_strategy")}>
          <div className="choice-grid directive-choice-grid">
            {PIT_STRATEGIES.map((pitStrategy) => (
              <button key={pitStrategy} type="button" className={`${form.pitStrategy === pitStrategy ? "choice-card selected" : "choice-card"} pit-strategy-${pitStrategy}`} aria-label={`${tt("field_pit_strategy")}: ${tt(`pit_strategy_${pitStrategy}` as TranslationKey)}`} aria-pressed={form.pitStrategy === pitStrategy} onClick={() => setForm({ ...form, pitStrategy })} disabled={disabled}>
                <span className="plan-choice-title">
                  <PlanChoiceMarker value={PLAN_MARKERS.pitStrategy[pitStrategy]} />
                  <strong>{tt(`pit_strategy_${pitStrategy}` as TranslationKey)}</strong>
                </span>
                <small>{tt(`pit_strategy_${pitStrategy}_hint` as TranslationKey)}</small>
                <ImpactBadges badges={badgesFromDeltas(PIT_STRATEGY_DELTAS[pitStrategy])} tt={tt} />
                <DirectiveChoiceArt src={PIT_ART[pitStrategy]} />
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === "card" ? (
        <fieldset className="choice-group directive-choice-group directive-choice-card" aria-label={tt("field_card")}>
          <div className="choice-grid card-choice-grid">
            {cardChoices.map((cardId) => {
              const selected = selectedCardId === cardId;
              return (
                <button key={cardId || "none"} type="button" className={`${selected ? "choice-card selected" : "choice-card"}${cardId ? " card-art-cell" : ""}`} aria-label={`${tt("field_card")}: ${cardId ? tt(`card_${cardId}` as TranslationKey) : tt("card_none")}`} aria-pressed={selected} onClick={() => selectCard(cardId)} disabled={disabled || cardLocked}>
                  <span className="plan-choice-title">
                    <PlanCardMarker active={Boolean(cardId)} />
                    <strong>{cardId ? tt(`card_${cardId}` as TranslationKey) : tt("card_none")}</strong>
                  </span>
                  <small>
                    {cardId && selectedCardFit && selected ? `${tt(`card_fit_${selectedCardFit.level}` as TranslationKey)} · ` : ""}
                    {cardId ? tt(`card_${cardId}_hint` as TranslationKey) : tt("card_none_hint")}
                  </small>
                  {cardId ? <CardStatBadges cardId={cardId} tt={tt} /> : null}
                  {cardId ? <CardArtImage cardId={cardId} /> : null}
                </button>
              );
            })}
          </div>
          {cardLocked ? <p className="directive-lock-note">{tt("directive_card_locked")}</p> : null}
          {ownedCardIds.length ? null : <p className="directive-lock-note">{tt("garage_empty_inventory")}</p>}
        </fieldset>
      ) : null}

      <div className="directive-command-row">
        {canRunQualifying ? (
          <button type="button" className={`primary-command directive-secondary-command${hasQualifyingRun ? "" : " highlight-command"}`} onClick={onQualifying} disabled={disabled}>
            {tt("action_qualifying")}
          </button>
        ) : null}
        <button type="button" className={`primary-command directive-primary-command${!locked && hasQualifyingRun ? " highlight-command" : ""}`} onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
          {primaryCommand.label}
        </button>
      </div>
    </section>
    </>
  );
}

function traitLevel(value: number) {
  if (value >= 72) return "strong";
  if (value >= 45) return "balanced";
  return "weak";
}
