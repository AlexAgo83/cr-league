import type { CardId } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CardFit, Translator } from "../app/helpers.js";
import type { FormState } from "../app/types.js";
import { CardStatBadges } from "./CardStatBadges.js";

export function DirectivePanel({
  form,
  setForm,
  ownedCardIds,
  selectedCardId,
  selectedCardFit,
  cardLocked,
  disabled,
  tt
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  ownedCardIds: CardId[];
  selectedCardId: FormState["cardId"];
  selectedCardFit: CardFit | null;
  cardLocked?: boolean;
  disabled?: boolean;
  tt: Translator;
}) {
  return (
    <section className="panel directive-panel">
      <h2>{tt("directive_title")}</h2>
      <div className="field-grid directive-fields">
        <label>
          {tt("field_approach")}
          <select value={form.approach} onChange={(event) => setForm({ ...form, approach: event.target.value as FormState["approach"] })} disabled={disabled}>
            <option value="prudent">{tt("approach_prudent")}</option>
            <option value="balanced">{tt("approach_balanced")}</option>
            <option value="aggressive">{tt("approach_aggressive")}</option>
          </select>
          <small>{tt(`approach_${form.approach}_hint` as TranslationKey)}</small>
        </label>
        <label>
          {tt("field_preparation")}
          <select value={form.preparation} onChange={(event) => setForm({ ...form, preparation: event.target.value as FormState["preparation"] })} disabled={disabled}>
            <option value="speed">{tt("preparation_speed")}</option>
            <option value="reliability">{tt("preparation_reliability")}</option>
            <option value="weather">{tt("preparation_weather")}</option>
          </select>
          <small>{tt(`preparation_${form.preparation}_hint` as TranslationKey)}</small>
        </label>
        <label>
          {tt("field_card")}
          <select value={selectedCardId} onChange={(event) => setForm({ ...form, cardId: event.target.value as FormState["cardId"] })} disabled={disabled || cardLocked}>
            <option value="">{tt("card_none")}</option>
            {ownedCardIds.map((cardId) => (
              <option key={cardId} value={cardId}>
                {tt(`card_${cardId}` as TranslationKey)}
              </option>
            ))}
          </select>
          <small>
            {selectedCardFit ? `${tt(`card_fit_${selectedCardFit.level}` as TranslationKey)} · ` : ""}
            {selectedCardId ? tt(`card_${selectedCardId}_hint` as TranslationKey) : tt("card_none_hint")}
          </small>
          {selectedCardId ? <CardStatBadges cardId={selectedCardId as CardId} tt={tt} /> : null}
        </label>
      </div>
    </section>
  );
}
