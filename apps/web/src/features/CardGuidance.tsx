import type { CardFit, Translator } from "../app/helpers.js";
import type { TranslationKey } from "../i18n/index.js";

export function CardGuidance({ fit, tt }: { fit: CardFit; tt: Translator }) {
  return (
    <span className={`card-guidance card-guidance-${fit.level}`}>
      <strong>{tt(`card_fit_${fit.level}` as TranslationKey)}</strong>
      <small>{tt(fit.reasonKey)}</small>
    </span>
  );
}
