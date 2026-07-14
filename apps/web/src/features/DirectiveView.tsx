import type { CardId } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { CardFit, Translator } from "../app/helpers.js";
import type { FormState, LeagueState } from "../app/types.js";

export function DirectiveView({
  state,
  form,
  setForm,
  ownedCardIds,
  selectedCardId,
  selectedCardFit,
  loading,
  onUpdateSettings,
  onForgetPlayer,
  tt
}: {
  state: LeagueState;
  form: FormState;
  setForm: (form: FormState) => void;
  ownedCardIds: CardId[];
  selectedCardId: FormState["cardId"];
  selectedCardFit: CardFit | null;
  loading: boolean;
  onUpdateSettings: () => void;
  onForgetPlayer: () => void;
  tt: Translator;
}) {
  return (
    <div className="view-stack">
      <section className="panel">
        <h2>{tt("directive_title")}</h2>
        <div className="field-grid directive-fields">
          <label>
            {tt("field_approach")}
            <select value={form.approach} onChange={(event) => setForm({ ...form, approach: event.target.value as FormState["approach"] })}>
              <option value="prudent">{tt("approach_prudent")}</option>
              <option value="balanced">{tt("approach_balanced")}</option>
              <option value="aggressive">{tt("approach_aggressive")}</option>
            </select>
            <small>{tt(`approach_${form.approach}_hint` as TranslationKey)}</small>
          </label>
          <label>
            {tt("field_preparation")}
            <select value={form.preparation} onChange={(event) => setForm({ ...form, preparation: event.target.value as FormState["preparation"] })}>
              <option value="speed">{tt("preparation_speed")}</option>
              <option value="reliability">{tt("preparation_reliability")}</option>
              <option value="weather">{tt("preparation_weather")}</option>
            </select>
            <small>{tt(`preparation_${form.preparation}_hint` as TranslationKey)}</small>
          </label>
          <label>
            {tt("field_card")}
            <select value={selectedCardId} onChange={(event) => setForm({ ...form, cardId: event.target.value as FormState["cardId"] })}>
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
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>{tt("settings_title")}</h2>
        <div className="field-grid settings-fields">
          <label>
            {tt("field_cadence")}
            <select value={form.cadence} onChange={(event) => setForm({ ...form, cadence: event.target.value })}>
              <option value="manual">{tt("cadence_manual")}</option>
              <option value="fast">{tt("cadence_fast")}</option>
              <option value="weekly">{tt("cadence_weekly")}</option>
            </select>
          </label>
          <label>
            {tt("field_deadline")}
            <input
              type="datetime-local"
              value={form.preparationDeadlineAt}
              onChange={(event) => setForm({ ...form, preparationDeadlineAt: event.target.value })}
            />
          </label>
        </div>
        <div className="actions secondary-actions">
          <button type="button" onClick={onUpdateSettings} disabled={loading}>
            {tt("action_update_settings")}
          </button>
          <button type="button" onClick={onForgetPlayer} disabled={loading || !state.player}>
            {tt("action_forget_team")}
          </button>
        </div>
      </section>
    </div>
  );
}
