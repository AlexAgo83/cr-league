import { type CSSProperties } from "react";
import type { CardId } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import { sortCardIdsByName, type CardFit, type Translator } from "../app/helpers.js";
import type { PlanRiskRead } from "../app/raceFlow.js";
import type { FormState } from "../app/types.js";
import { AssetImage } from "./AssetImage.js";
import { CARD_BADGES, CardArtImage, CardStatBadges, StatBadges } from "./CardStatBadges.js";
import { PlanRiskSummary } from "./PlanRiskSummary.js";

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
const PLAN_MARKERS = {
  approach: { prudent: 1, balanced: 2, aggressive: 3 },
  preparation: { speed: 1, reliability: 2, weather: 3 },
  pitStrategy: { heavy_pack: 1, standard: 2, mini_pack: 3 }
} as const;
export type DirectiveStep = "approach" | "preparation" | "pit" | "card";
export const DIRECTIVE_STEP_KEY = "cr-league-directive-step";
type PrimaryCommand = { label: string; action: () => void | Promise<void>; disabled: boolean };

const APPROACH_ART: Record<(typeof APPROACHES)[number], string> = {
  prudent: "/assets/crl/approach-prudent.png",
  balanced: "/assets/crl/approach-balanced.png",
  aggressive: "/assets/crl/approach-aggressive.png"
};

const PREPARATION_ART: Record<(typeof PREPARATIONS)[number], string> = {
  speed: "/assets/crl/preparation-speed.png",
  reliability: "/assets/crl/preparation-reliability.png",
  weather: "/assets/crl/preparation-weather.png"
};

const PIT_ART: Record<(typeof PIT_STRATEGIES)[number], string> = {
  heavy_pack: "/assets/crl/pit-strategy-heavy-pack.png",
  standard: "/assets/crl/pit-strategy-standard.png",
  mini_pack: "/assets/crl/pit-strategy-mini-pack.png"
};

export function savedDirectiveStep(): DirectiveStep {
  const saved = localStorage.getItem(DIRECTIVE_STEP_KEY);
  return saved === "preparation" || saved === "pit" || saved === "card" ? saved : "approach";
}

const TRAIT_LABEL: Record<TraitKey, TranslationKey> = {
  grip: "circuit_grip",
  overtaking: "circuit_overtaking",
  energy: "circuit_energy"
};

const TRAIT_HINT: Record<TraitKey, TranslationKey> = {
  grip: "circuit_grip_hint",
  overtaking: "circuit_overtaking_hint",
  energy: "circuit_energy_hint"
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
  planRecommendation?: string;
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
  const selectedCardWarning = selectedCardId ? { card: selectedCardLabel, action: tt("directive_card_consumption_warning_action") } : undefined;
  const canRunQualifying = Boolean(onQualifying && !locked && qualifyingAttemptsLeft > 0);
  const hasQualifyingRun = qualifyingRunCount > 0;
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
        {planRecommendation ? <p>{planRecommendation}</p> : null}
      </header>

      <div className="directive-briefing" aria-label={tt("directive_track_read")}>
        {TRAITS.map((trait) => {
          const value = Math.max(0, Math.min(100, Math.round(circuitTraits[trait])));
          const modifier = modifiers[trait];
          return (
            <span key={trait} className={`directive-trait map-trait-${trait}`}>
              <span className="directive-trait-head">
                <strong>{tt(TRAIT_LABEL[trait])}</strong>
                <b className="directive-trait-score">
                  <span className="directive-trait-value type-chrono">{value}</span>
                  <span className={`directive-trait-modifier type-chrono ${modifier > 0 ? "bonus" : modifier < 0 ? "weakness" : "neutral"}`}>{signedModifier(modifier)}</span>
                </b>
              </span>
              <span className="directive-trait-gauge" role="presentation">
                <i style={{ "--trait-value": `${value}%` } as CSSProperties} />
              </span>
              <em>{tt(`trait_level_${traitLevel(circuitTraits[trait])}` as TranslationKey)}</em>
              <small>{tt(TRAIT_HINT[trait])}</small>
            </span>
          );
        })}
      </div>
    </section>

    <section className="panel directive-panel directive-selection-panel">
      <PlanRiskSummary read={planRiskRead} tt={tt} />
      {selectedCardWarning ? (
        <p className="directive-lock-note">
          {selectedCardWarning.card} <strong>{selectedCardWarning.action}</strong>
        </p>
      ) : null}
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
                <ImpactBadges badges={APPROACH_BADGES[approach]} tt={tt} />
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
                <ImpactBadges badges={PREPARATION_BADGES[preparation]} tt={tt} />
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
                <ImpactBadges badges={PIT_BADGES[pitStrategy]} tt={tt} />
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
                <button key={cardId || "none"} type="button" className={`${selected ? "choice-card selected" : "choice-card"}${cardId ? " card-art-cell" : ""}`} aria-label={`${tt("field_card")}: ${cardId ? tt(`card_${cardId}` as TranslationKey) : tt("card_none")}`} aria-pressed={selected} onClick={() => setForm({ ...form, cardId })} disabled={disabled || cardLocked}>
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

      {locked ? (
        <div className="directive-lock-note">
          <strong>{tt("directive_locked_title")}</strong>
          <span>{tt("directive_locked_body")}</span>
        </div>
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
