import {
  APPROACH_DELTAS,
  CARD_DELTAS,
  PIT_STRATEGY_DELTAS,
  PREPARATION_DELTAS,
  type CardId,
  type DecisionDeltaKey,
  type DecisionDeltas,
  type QualifyingRun,
  type Weather
} from "@cr-league/shared";
import { t, type Locale, type TranslationKey } from "../i18n/index.js";
import { type MapTraitImpacts } from "../features/CircuitMap.js";
import { randomLeagueName, randomTeamName } from "./nameSeeds.js";
import type { FormState } from "./types.js";

export type ChronoReport = {
  best: QualifyingRun | null;
  latest: QualifyingRun | null;
  deltaLabel: string;
  gridLabel: string;
  gridPosition: number | null;
  suggestion: string;
};

type CircuitTraitKey = "grip" | "overtaking" | "energy";
export type PlanRiskRead = {
  level: "safe" | "risky" | "high_upside";
  strengthKey: TranslationKey;
  failureKey: TranslationKey;
  bandKey: TranslationKey;
};
export type PlanRecommendation = {
  traitKey: CircuitTraitKey;
  weatherKey: Weather;
  trait: string;
  weather: string;
  traitAdvice: string;
  weatherAdvice: string;
};

const CIRCUIT_TRAITS: CircuitTraitKey[] = ["grip", "overtaking", "energy"];
const CIRCUIT_TRAIT_LABELS: Record<CircuitTraitKey, TranslationKey> = {
  grip: "circuit_grip",
  overtaking: "circuit_overtaking",
  energy: "circuit_energy"
};
const WEATHER_VALUES: Weather[] = ["dry", "light_rain", "heavy_rain"];

export function traitImpacts(form: FormState, selectedCardId: FormState["cardId"], tt: (key: TranslationKey) => string): MapTraitImpacts {
  const impacts: MapTraitImpacts = {};
  const add = (trait: DecisionDeltaKey, value: number, label: string) => {
    if (!value) return;
    impacts[trait] = [...(impacts[trait] ?? []), { label, value }];
  };
  const addDeltas = (deltas: DecisionDeltas, label: string) => {
    for (const [trait, value] of Object.entries(deltas) as Array<[DecisionDeltaKey, number | undefined]>) add(trait, value ?? 0, label);
  };

  addDeltas(APPROACH_DELTAS[form.approach], tt(`approach_${form.approach}` as TranslationKey));
  addDeltas(PREPARATION_DELTAS[form.preparation], tt(`preparation_${form.preparation}` as TranslationKey));
  addDeltas(PIT_STRATEGY_DELTAS[form.pitStrategy], tt(`pit_strategy_${form.pitStrategy}` as TranslationKey));
  if (selectedCardId) addDeltas(CARD_DELTAS[selectedCardId] ?? {}, tt("field_card"));

  return impacts;
}

function traitImpactTotal(impacts: MapTraitImpacts, trait: DecisionDeltaKey) {
  return (impacts[trait] ?? []).reduce((total, impact) => total + impact.value, 0);
}

export function buildPlanRiskRead(input: {
  form: FormState;
  selectedCardId: FormState["cardId"];
  forecastPick: string;
  circuitTraits: Record<CircuitTraitKey, number>;
  qualifyingAttemptsUsed: number;
  qualifyingAttemptsLeft: number;
  gridPosition: number;
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}): PlanRiskRead {
  const impacts = traitImpacts(input.form, input.selectedCardId, input.tt);
  const grip = traitImpactTotal(impacts, "control") + traitImpactTotal(impacts, "weatherReadiness");
  const attack = traitImpactTotal(impacts, "pace") + traitImpactTotal(impacts, "aggression");
  const endurance = traitImpactTotal(impacts, "reliability");
  const rainy = input.forecastPick === "light_rain" || input.forecastPick === "heavy_rain";
  let risk = 0;

  if (input.form.approach === "aggressive") risk += 2;
  if (input.form.preparation === "speed" && rainy) risk += 2;
  if (input.form.pitStrategy === "mini_pack") risk += 1;
  if (grip < 0 || endurance < 0) risk += 1;
  if (input.qualifyingAttemptsUsed === 0) risk += 1;
  if (input.qualifyingAttemptsLeft > 0) risk += 1;
  if (rainy && grip >= 3) risk -= 1;
  if (input.form.approach === "prudent" || input.form.preparation === "reliability") risk -= 1;

  const upside = attack >= 5 || (input.form.approach === "aggressive" && input.circuitTraits.overtaking >= 70) || (input.gridPosition > 0 && input.gridPosition <= 3);
  const level = risk >= 4 ? "risky" : upside ? "high_upside" : "safe";
  const strengthKey: TranslationKey = grip >= attack && grip >= endurance ? "plan_risk_strength_grip" : attack >= endurance ? "plan_risk_strength_attack" : "plan_risk_strength_endurance";
  const failureKey: TranslationKey =
    input.qualifyingAttemptsUsed === 0 ? "plan_risk_failure_no_chrono" : grip < 0 || (rainy && input.form.preparation !== "weather") ? "plan_risk_failure_grip" : endurance < 0 ? "plan_risk_failure_endurance" : "plan_risk_failure_pace";
  const bandKey: TranslationKey = level === "safe" ? "plan_risk_band_safe" : level === "high_upside" ? "plan_risk_band_high_upside" : "plan_risk_band_risky";

  return { level, strengthKey, failureKey, bandKey };
}

export function qualifyingReplayTower(run: QualifyingRun | null, runs: QualifyingRun[], tt: (key: TranslationKey, params?: Record<string, string | number>) => string) {
  if (!run) return [];
  return runs
    .filter((lapRun) => lapRun.teamId === run.teamId && lapRun.attempts === run.attempts)
    .sort((left, right) => (left.lap ?? 0) - (right.lap ?? 0))
    .map((lapRun, index) => ({
      id: `${lapRun.teamId}-${lapRun.attempts}-${lapRun.lap ?? index + 1}`,
      teamId: lapRun.teamId,
      teamName: tt("qualifying_replay_lap_label", { attempt: lapRun.attempts, lap: lapRun.lap ?? index + 1 }),
      value: `${lapRun.time.toFixed(2)}s`
    }));
}

export function latestQualifyingRun(runs: QualifyingRun[]) {
  return runs.reduce<QualifyingRun | null>(
    (latest, run) => (!latest || run.attempts > latest.attempts || (run.attempts === latest.attempts && (run.lap ?? 0) > (latest.lap ?? 0)) ? run : latest),
    null
  );
}

export function bestQualifyingRuns(runs: QualifyingRun[]) {
  const best = new Map<string, QualifyingRun>();
  for (const run of runs) {
    const current = best.get(run.teamId);
    if (!current || run.time < current.time) best.set(run.teamId, run);
  }
  return [...best.values()];
}

export function buildChronoReport(input: {
  runs: QualifyingRun[];
  gridPosition: number;
  attemptsLeft: number;
  attemptLimit: number;
  forecastPick: string;
  form: FormState;
  selectedCardId: string;
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}): ChronoReport {
  const best = input.runs.reduce<QualifyingRun | null>((current, run) => (!current || run.time < current.time ? run : current), null);
  const latest = latestQualifyingRun(input.runs);
  const delta = best && latest ? latest.time - best.time : 0;
  const deltaLabel = !best ? input.tt("chrono_report_delta_empty") : Math.abs(delta) < 0.005 ? input.tt("chrono_report_delta_best") : `+${delta.toFixed(2)}s`;
  return {
    best,
    latest,
    deltaLabel,
    gridPosition: best && input.gridPosition > 0 ? input.gridPosition : null,
    gridLabel: best && input.gridPosition > 0 ? `P${input.gridPosition}` : input.tt("starting_grid_no_time"),
    suggestion: chronoReportSuggestion(input, best, latest)
  };
}

export function buildPlanRecommendation(input: {
  circuitTraits: Record<CircuitTraitKey, number>;
  forecastPick: string;
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  const recommendation = buildPlanRecommendationParts(input);
  return input.tt("plan_recommendation", {
    trait: recommendation.trait,
    weather: recommendation.weather,
    traitAdvice: recommendation.traitAdvice,
    weatherAdvice: recommendation.weatherAdvice
  });
}

export function buildPlanRecommendationParts(input: {
  circuitTraits: Record<CircuitTraitKey, number>;
  forecastPick: string;
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}): PlanRecommendation {
  const trait = CIRCUIT_TRAITS.reduce((best, current) => (input.circuitTraits[current] > input.circuitTraits[best] ? current : best), "grip");
  const weather = WEATHER_VALUES.includes(input.forecastPick as Weather) ? (input.forecastPick as Weather) : "dry";
  return {
    traitKey: trait,
    weatherKey: weather,
    trait: input.tt(CIRCUIT_TRAIT_LABELS[trait]),
    weather: input.tt(`weather_${weather}` as TranslationKey),
    traitAdvice: input.tt(`plan_recommendation_trait_${trait}` as TranslationKey),
    weatherAdvice: input.tt(`plan_recommendation_weather_${weather}` as TranslationKey)
  };
}

function chronoReportSuggestion(
  input: {
    runs: QualifyingRun[];
    attemptsLeft: number;
    attemptLimit: number;
    forecastPick: string;
    form: FormState;
    selectedCardId: string;
    tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
  },
  best: QualifyingRun | null,
  latest: QualifyingRun | null
) {
  if (!best) return input.tt("chrono_report_suggestion_first_run");
  if (input.attemptsLeft <= 0) return input.tt("chrono_report_suggestion_lock_best");
  const bestCard = best.decision.cardId ?? "";
  const currentChanged =
    best.decision.approach !== input.form.approach ||
    best.decision.preparation !== input.form.preparation ||
    bestCard !== input.selectedCardId;
  if (latest && latest.time > best.time + 0.15) {
    return input.tt("chrono_report_suggestion_return_best", {
      approach: input.tt(`approach_${best.decision.approach}` as TranslationKey),
      preparation: input.tt(`preparation_${best.decision.preparation}` as TranslationKey)
    });
  }
  if (currentChanged) return input.tt("chrono_report_suggestion_compare_current", { left: input.attemptsLeft, limit: input.attemptLimit });
  if (input.forecastPick !== "dry" && input.form.preparation !== "weather") return input.tt("chrono_report_suggestion_weather");
  if (input.form.preparation !== "speed") return input.tt("chrono_report_suggestion_speed");
  return input.tt("chrono_report_suggestion_lock_best");
}

export function createInitialForm(locale: Locale): FormState {
  return {
    leagueName: randomLeagueName() || t("default_league_name", locale),
    joinCode: "",
    teamName: randomTeamName() || t("default_team_name", locale),
    maxPlayers: 8,
    fillWithBots: true,
    qualifyingAttemptLimit: 3,
    maxGrandPrixPerSeason: 6,
    cadence: "manual",
    preparationDeadlineAt: "",
    approach: "balanced",
    preparation: "weather",
    pitStrategy: "standard",
    cardId: "" as "" | CardId
  };
}
