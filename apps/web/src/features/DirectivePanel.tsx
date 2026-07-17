import type { CSSProperties } from "react";
import type { CardId } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CardFit, Translator } from "../app/helpers.js";
import type { FormState } from "../app/types.js";
import { CardStatBadges } from "./CardStatBadges.js";

type TraitStats = {
  grip: number;
  overtaking: number;
  energy: number;
};

type TraitKey = "grip" | "overtaking" | "energy";
type ImpactBadge = { trait: TraitKey; sign: "+" | "-"; icon: string; label: TranslationKey };

const APPROACHES = ["prudent", "balanced", "aggressive"] as const;
const PREPARATIONS = ["speed", "reliability", "weather"] as const;
const TRAITS = ["grip", "overtaking", "energy"] as const;

const TRAIT_ICON: Record<TraitKey, string> = { grip: "◆", overtaking: "↗", energy: "⚡" };
const TRAIT_LABEL: Record<TraitKey, TranslationKey> = {
  grip: "circuit_grip",
  overtaking: "circuit_overtaking",
  energy: "circuit_energy"
};

// Player-facing read of what each directive choice shifts, mirrored from the race
// simulation's applyDecision() and expressed on the grip/attack/endurance vocabulary
// the map already uses. UI hint only — no balance logic lives here.
function badge(trait: TraitKey, sign: "+" | "-"): ImpactBadge {
  return { trait, sign, icon: TRAIT_ICON[trait], label: TRAIT_LABEL[trait] };
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

function ImpactBadges({ badges, tt }: { badges: ImpactBadge[]; tt: Translator }) {
  return (
    <span className="card-stat-badges">
      {badges.map((entry) => (
        <span key={`${entry.sign}-${entry.trait}`} className={`card-stat-badge map-trait-${entry.trait} ${entry.sign === "-" ? "weakness" : "bonus"}`}>
          <i aria-hidden="true">{entry.icon}</i>
          <span>
            {entry.sign} {tt(entry.label)}
          </span>
        </span>
      ))}
    </span>
  );
}

export function DirectivePanel({
  form,
  setForm,
  ownedCardIds,
  selectedCardId,
  selectedCardFit,
  circuitTraits,
  cardLocked,
  disabled,
  tt
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  ownedCardIds: CardId[];
  selectedCardId: FormState["cardId"];
  selectedCardFit: CardFit | null;
  circuitTraits: TraitStats;
  cardLocked?: boolean;
  disabled?: boolean;
  tt: Translator;
}) {
  const cardChoices = ["", ...ownedCardIds] as Array<"" | CardId>;
  const selectedCardLabel = selectedCardId ? tt(`card_${selectedCardId}` as TranslationKey) : tt("card_none");

  return (
    <section className="panel directive-panel">
      <header className="directive-heading">
        <span className="section-kicker">{tt("directive_kicker")}</span>
        <h2>{tt("directive_title")}</h2>
      </header>

      <div className="directive-briefing" aria-label={tt("directive_track_read")}>
        {TRAITS.map((trait) => {
          const value = Math.max(0, Math.min(100, Math.round(circuitTraits[trait])));
          return (
            <span key={trait} className={`directive-trait map-trait-${trait}`}>
              <span className="directive-trait-head">
                <strong>{tt(`map_trait_${trait}` as TranslationKey)}</strong>
                <b className="directive-trait-value type-chrono">{value}</b>
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

      <fieldset className="choice-group">
        <legend>{tt("field_approach")}</legend>
        <div className="choice-grid">
          {APPROACHES.map((approach) => (
            <button key={approach} type="button" className={form.approach === approach ? "choice-card selected" : "choice-card"} aria-label={`${tt("field_approach")}: ${tt(`approach_${approach}` as TranslationKey)}`} aria-pressed={form.approach === approach} onClick={() => setForm({ ...form, approach })} disabled={disabled}>
              <strong>{tt(`approach_${approach}` as TranslationKey)}</strong>
              <small>{tt(`approach_${approach}_hint` as TranslationKey)}</small>
              <ImpactBadges badges={APPROACH_BADGES[approach]} tt={tt} />
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="choice-group">
        <legend>{tt("field_preparation")}</legend>
        <div className="choice-grid">
          {PREPARATIONS.map((preparation) => (
            <button key={preparation} type="button" className={form.preparation === preparation ? "choice-card selected" : "choice-card"} aria-label={`${tt("field_preparation")}: ${tt(`preparation_${preparation}` as TranslationKey)}`} aria-pressed={form.preparation === preparation} onClick={() => setForm({ ...form, preparation })} disabled={disabled}>
              <strong>{tt(`preparation_${preparation}` as TranslationKey)}</strong>
              <small>{tt(`preparation_${preparation}_hint` as TranslationKey)}</small>
              <ImpactBadges badges={PREPARATION_BADGES[preparation]} tt={tt} />
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="choice-group">
        <legend>{tt("field_card")}</legend>
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
      </fieldset>

      <p className="directive-summary">
        {tt("directive_plan_summary", {
          approach: tt(`approach_${form.approach}` as TranslationKey),
          preparation: tt(`preparation_${form.preparation}` as TranslationKey),
          card: selectedCardLabel
        })}
      </p>
      {cardLocked ? <p className="directive-lock-note">{tt("directive_card_locked")}</p> : null}
      {ownedCardIds.length ? null : <p className="directive-lock-note">{tt("garage_empty_inventory")}</p>}
    </section>
  );
}

function traitLevel(value: number) {
  if (value >= 72) return "strong";
  if (value >= 45) return "balanced";
  return "weak";
}
