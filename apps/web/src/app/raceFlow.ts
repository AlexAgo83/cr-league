import { type CardId, type QualifyingRun, type Weather } from "@cr-league/shared";
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

const CIRCUIT_TRAITS: CircuitTraitKey[] = ["grip", "overtaking", "energy"];
const WEATHER_VALUES: Weather[] = ["dry", "light_rain", "heavy_rain"];

export function traitImpacts(form: FormState, selectedCardId: FormState["cardId"], tt: (key: TranslationKey) => string): MapTraitImpacts {
  const impacts: MapTraitImpacts = {};
  const add = (trait: keyof MapTraitImpacts, label: string) => {
    impacts[trait] = [...(impacts[trait] ?? []), `+${label}`];
  };

  if (form.preparation === "weather") add("grip", tt("preparation_weather"));
  if (form.preparation === "speed") add("overtaking", tt("preparation_speed"));
  if (form.preparation === "reliability") add("energy", tt("preparation_reliability"));
  if (form.approach === "aggressive") add("overtaking", tt("approach_aggressive"));
  if (form.approach === "prudent") add("energy", tt("approach_prudent"));
  if (form.pitStrategy === "heavy_pack") add("energy", tt("pit_strategy_heavy_pack"));
  if (form.pitStrategy === "mini_pack") add("overtaking", tt("pit_strategy_mini_pack"));
  if (selectedCardId === "rain_grip" || selectedCardId === "rain_mapping") add("grip", tt("field_card"));
  if (selectedCardId === "launch_boost" || selectedCardId === "urban_draft" || selectedCardId === "soft_tires" || selectedCardId === "qualifying_focus" || selectedCardId === "adjustable_wing" || selectedCardId === "calculated_attack") add("overtaking", tt("field_card"));
  if (selectedCardId === "fleet_maintenance" || selectedCardId === "final_surge" || selectedCardId === "defensive_order" || selectedCardId === "economy_mode" || selectedCardId === "pit_relay" || selectedCardId === "hard_tires") add("energy", tt("field_card"));

  return impacts;
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
  const trait = CIRCUIT_TRAITS.reduce((best, current) => (input.circuitTraits[current] > input.circuitTraits[best] ? current : best), "grip");
  const weather = WEATHER_VALUES.includes(input.forecastPick as Weather) ? (input.forecastPick as Weather) : "dry";
  return input.tt("plan_recommendation", {
    trait: input.tt(`map_trait_${trait}` as TranslationKey),
    weather: input.tt(`weather_${weather}` as TranslationKey),
    traitAdvice: input.tt(`plan_recommendation_trait_${trait}` as TranslationKey),
    weatherAdvice: input.tt(`plan_recommendation_weather_${weather}` as TranslationKey)
  });
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
    (best.decision.pitStrategy ?? "standard") !== input.form.pitStrategy ||
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
