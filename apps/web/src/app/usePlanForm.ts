import { PIT_STRATEGIES, RACE_APPROACHES, TECHNICAL_PREPARATIONS, type CardId } from "@cr-league/shared";
import { useEffect, useState } from "react";
import type { Locale } from "../i18n/index.js";
import { createInitialForm } from "./raceFlow.js";
import type { FormState } from "./types.js";

const PLAN_FORM_KEY = "cr-league-plan-form";

function savedPlanForm() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAN_FORM_KEY) ?? "{}") as Partial<FormState>;
    const form: Partial<FormState> = {};
    if (RACE_APPROACHES.includes(saved.approach as FormState["approach"])) form.approach = saved.approach;
    if (TECHNICAL_PREPARATIONS.includes(saved.preparation as FormState["preparation"])) form.preparation = saved.preparation;
    if (PIT_STRATEGIES.includes(saved.pitStrategy as FormState["pitStrategy"])) form.pitStrategy = saved.pitStrategy;
    if (typeof saved.cardId === "string") form.cardId = saved.cardId as "" | CardId;
    return form;
  } catch {
    return {};
  }
}

export function usePlanForm(locale: Locale) {
  const [form, setForm] = useState<FormState>(() => ({ ...createInitialForm(locale), ...savedPlanForm() }));

  useEffect(() => {
    localStorage.setItem(
      PLAN_FORM_KEY,
      JSON.stringify({
        approach: form.approach,
        preparation: form.preparation,
        pitStrategy: form.pitStrategy,
        cardId: form.cardId
      })
    );
  }, [form.approach, form.preparation, form.pitStrategy, form.cardId]);

  return [form, setForm] as const;
}
