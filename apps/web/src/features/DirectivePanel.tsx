import { type CSSProperties } from "react";
import type { CardId } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CardFit, Translator } from "../app/helpers.js";
import type { FormState } from "../app/types.js";
import { CARD_BADGES, CardStatBadges } from "./CardStatBadges.js";
import { VisualIcon } from "./VisualIcon.js";

type TraitStats = {
  grip: number;
  overtaking: number;
  energy: number;
};

type TraitKey = "grip" | "overtaking" | "energy";
type ImpactBadge = { trait: TraitKey; sign: "+" | "-"; label: TranslationKey; value?: number };

const APPROACHES = ["prudent", "balanced", "aggressive"] as const;
const PREPARATIONS = ["speed", "reliability", "weather"] as const;
const PIT_STRATEGIES = ["heavy_pack", "standard", "mini_pack"] as const;
const TRAITS = ["grip", "overtaking", "energy"] as const;
export type DirectiveStep = "approach" | "preparation" | "pit" | "card";
export const DIRECTIVE_STEP_KEY = "cr-league-directive-step";

export function savedDirectiveStep(): DirectiveStep {
  const saved = localStorage.getItem(DIRECTIVE_STEP_KEY);
  return saved === "preparation" || saved === "pit" || saved === "card" ? saved : "approach";
}

const TRAIT_LABEL: Record<TraitKey, TranslationKey> = {
  grip: "circuit_grip",
  overtaking: "circuit_overtaking",
  energy: "circuit_energy"
};

// Player-facing read of what each directive choice shifts, mirrored from the race
// simulation's applyDecision() and expressed on the grip/attack/endurance vocabulary
// the map already uses. UI hint only — no balance logic lives here.
function badge(trait: TraitKey, sign: "+" | "-", value = 3): ImpactBadge {
  return { trait, sign, label: TRAIT_LABEL[trait], value };
}

const APPROACH_BADGES: Record<(typeof APPROACHES)[number], ImpactBadge[]> = {
  prudent: [badge("grip", "+"), badge("energy", "+"), badge("overtaking", "-")],
  balanced: [badge("grip", "+"), badge("energy", "+")],
  aggressive: [badge("overtaking", "+"), badge("grip", "-"), badge("energy", "-")]
};

const PREPARATION_BADGES: Record<(typeof PREPARATIONS)[number], ImpactBadge[]> = {
  speed: [badge("overtaking", "+"), badge("energy", "-")],
  reliability: [badge("energy", "+"), badge("grip", "+")],
  weather: [badge("grip", "+")]
};

const PIT_BADGES: Record<(typeof PIT_STRATEGIES)[number], ImpactBadge[]> = {
  heavy_pack: [badge("energy", "+"), badge("overtaking", "-")],
  standard: [badge("grip", "+", 1)],
  mini_pack: [badge("overtaking", "+"), badge("energy", "-")]
};

function ImpactBadges({ badges, tt }: { badges: ImpactBadge[]; tt: Translator }) {
  return (
    <span className="card-stat-badges">
      {badges.map((entry) => (
        <span key={`${entry.sign}-${entry.trait}`} className={`card-stat-badge map-trait-${entry.trait} ${entry.sign === "-" ? "weakness" : "bonus"}`}>
          <i aria-hidden="true">
            <VisualIcon name={entry.trait} />
          </i>
          <span>
            {entry.sign} {tt(entry.label)}
          </span>
        </span>
      ))}
    </span>
  );
}

function directiveModifiers(form: FormState, selectedCardId: FormState["cardId"]) {
  const modifiers: Record<TraitKey, number> = { grip: 0, overtaking: 0, energy: 0 };
  const add = (entry: ImpactBadge) => {
    modifiers[entry.trait] += (entry.sign === "+" ? 1 : -1) * (entry.value ?? 1);
  };

  APPROACH_BADGES[form.approach].forEach(add);
  PREPARATION_BADGES[form.preparation].forEach(add);
  PIT_BADGES[form.pitStrategy].forEach(add);
  if (selectedCardId) CARD_BADGES[selectedCardId].forEach((entry) => add({ ...entry, value: 2 }));

  return modifiers;
}

function signedModifier(value: number) {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return "±0";
}

export function DirectivePanel({
  form,
  setForm,
  ownedCardIds,
  selectedCardId,
  selectedCardFit,
  step,
  circuitTraits,
  cardLocked,
  disabled,
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
  cardLocked?: boolean;
  disabled?: boolean;
  onSelectStep: (step: DirectiveStep) => void;
  tt: Translator;
}) {
  const cardChoices = ["", ...ownedCardIds] as Array<"" | CardId>;
  const selectedCardLabel = selectedCardId ? tt(`card_${selectedCardId}` as TranslationKey) : tt("card_none");
  const modifiers = directiveModifiers(form, selectedCardId);

  const steps = [
    { key: "approach" as const, label: tt("field_approach"), value: tt(`approach_${form.approach}` as TranslationKey) },
    { key: "preparation" as const, label: tt("field_preparation"), value: tt(`preparation_${form.preparation}` as TranslationKey) },
    { key: "pit" as const, label: tt("field_pit_strategy"), value: tt(`pit_strategy_${form.pitStrategy}` as TranslationKey) },
    { key: "card" as const, label: tt("field_card"), value: selectedCardLabel }
  ];

  return (
    <>
    <section className="panel directive-panel directive-briefing-panel">
      <header className="directive-heading">
        <span className="section-kicker">{tt("directive_kicker")}</span>
        <h2>{tt("directive_title")}</h2>
      </header>

      <div className="directive-briefing" aria-label={tt("directive_track_read")}>
        {TRAITS.map((trait) => {
          const value = Math.max(0, Math.min(100, Math.round(circuitTraits[trait])));
          const modifier = modifiers[trait];
          return (
            <span key={trait} className={`directive-trait map-trait-${trait}`}>
              <span className="directive-trait-head">
                <strong>{tt(`map_trait_${trait}` as TranslationKey)}</strong>
                <b className="directive-trait-score">
                  <span className="directive-trait-value type-chrono">{value}</span>
                  <span className={`directive-trait-modifier type-chrono ${modifier > 0 ? "bonus" : modifier < 0 ? "weakness" : "neutral"}`}>{signedModifier(modifier)}</span>
                </b>
              </span>
              <span className="directive-trait-gauge" role="presentation">
                <i style={{ "--trait-value": `${value}%` } as CSSProperties} />
              </span>
              <em>{tt(`trait_level_${traitLevel(circuitTraits[trait])}` as TranslationKey)}</em>
              <small>{tt(`trait_brief_${trait}` as TranslationKey)}</small>
            </span>
          );
        })}
      </div>
    </section>

    <section className="panel directive-panel directive-selection-panel">
      <div className="plan-steps directive-plan-steps" role="tablist" aria-label={tt("directive_title")}>
        {steps.map((entry) => (
          <button key={entry.key} type="button" role="tab" aria-selected={step === entry.key} aria-label={`${entry.label}: ${entry.value}`} className={step === entry.key ? "plan-step active" : "plan-step"} onClick={() => onSelectStep(entry.key)}>
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
                <strong>{tt(`approach_${approach}` as TranslationKey)}</strong>
                <small>{tt(`approach_${approach}_hint` as TranslationKey)}</small>
                <ImpactBadges badges={APPROACH_BADGES[approach]} tt={tt} />
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === "preparation" ? (
        <fieldset className="choice-group directive-choice-group directive-choice-preparation" aria-label={tt("field_preparation")}>
          <div className="choice-grid directive-choice-grid">
            {PREPARATIONS.map((preparation) => (
              <button key={preparation} type="button" className={form.preparation === preparation ? "choice-card selected" : "choice-card"} aria-label={`${tt("field_preparation")}: ${tt(`preparation_${preparation}` as TranslationKey)}`} aria-pressed={form.preparation === preparation} onClick={() => setForm({ ...form, preparation })} disabled={disabled}>
                <strong>{tt(`preparation_${preparation}` as TranslationKey)}</strong>
                <small>{tt(`preparation_${preparation}_hint` as TranslationKey)}</small>
                <ImpactBadges badges={PREPARATION_BADGES[preparation]} tt={tt} />
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
                <strong>{tt(`pit_strategy_${pitStrategy}` as TranslationKey)}</strong>
                <small>{tt(`pit_strategy_${pitStrategy}_hint` as TranslationKey)}</small>
                <ImpactBadges badges={PIT_BADGES[pitStrategy]} tt={tt} />
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
                <button key={cardId || "none"} type="button" className={selected ? "choice-card selected" : "choice-card"} aria-label={`${tt("field_card")}: ${cardId ? tt(`card_${cardId}` as TranslationKey) : tt("card_none")}`} aria-pressed={selected} onClick={() => setForm({ ...form, cardId })} disabled={disabled || cardLocked}>
                  <strong>{cardId ? tt(`card_${cardId}` as TranslationKey) : tt("card_none")}</strong>
                  <small>
                    {cardId && selectedCardFit && selected ? `${tt(`card_fit_${selectedCardFit.level}` as TranslationKey)} · ` : ""}
                    {cardId ? tt(`card_${cardId}_hint` as TranslationKey) : tt("card_none_hint")}
                  </small>
                  {cardId ? <CardStatBadges cardId={cardId} tt={tt} /> : null}
                </button>
              );
            })}
          </div>
          {cardLocked ? <p className="directive-lock-note">{tt("directive_card_locked")}</p> : null}
          {ownedCardIds.length ? null : <p className="directive-lock-note">{tt("garage_empty_inventory")}</p>}
        </fieldset>
      ) : null}
    </section>
    </>
  );
}

function traitLevel(value: number) {
  if (value >= 72) return "strong";
  if (value >= 45) return "balanced";
  return "weak";
}
