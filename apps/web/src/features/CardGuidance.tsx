import type { CardFit } from "../app/helpers.js";
import { useT } from "../i18n/index.js";
import type { TranslationKey } from "../i18n/index.js";

export function CardGuidance({ fit }: { fit: CardFit }) {
  const tt = useT();
  return (
    <span className={`card-guidance card-guidance-${fit.level}`}>
      <strong>{tt(`card_fit_${fit.level}` as TranslationKey)}</strong>
      <small>{tt(fit.reasonKey)}</small>
    </span>
  );
}
