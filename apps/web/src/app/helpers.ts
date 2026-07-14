import type { CardId, RaceResult } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { LeagueState } from "./types.js";

export type Translator = (key: TranslationKey) => string;

export type RaceEvent = RaceResult["events"][number];

export function strongestForecast(forecast: Record<string, number>) {
  return Object.entries(forecast).reduce((best, current) => (current[1] > best[1] ? current : best), ["dry", 0])[0];
}

export function countCards(cards: CardId[], cardId: CardId) {
  return cards.filter((candidate) => candidate === cardId).length;
}

export type CardFit = {
  level: "recommended" | "risky" | "low";
  score: number;
};

export function cardFit(cardId: CardId, state: LeagueState, forecastPick: string): CardFit {
  const traits = [state.currentGrandPrix.primaryTrait, state.currentGrandPrix.secondaryTrait];
  const hasRain = forecastPick !== "dry";

  if (cardId === "rain_grip") return hasRain || traits.includes("weather_sensitive") ? { level: "recommended", score: 90 } : { level: "risky", score: 45 };
  if (cardId === "fleet_maintenance") return traits.includes("high_wear") ? { level: "recommended", score: 85 } : { level: "low", score: 35 };
  if (cardId === "launch_boost") return traits.includes("fast") ? { level: "recommended", score: 80 } : { level: "risky", score: 50 };
  if (cardId === "urban_draft") return traits.includes("urban") ? { level: "recommended", score: 78 } : { level: "low", score: 30 };
  if (cardId === "final_surge") return { level: "risky", score: 55 };
  if (cardId === "soft_tires") return traits.includes("fast") ? { level: "recommended", score: 82 } : { level: "risky", score: 58 };
  if (cardId === "qualifying_focus") return { level: "recommended", score: 76 };
  if (cardId === "defensive_order") return traits.includes("high_wear") || traits.includes("technical") ? { level: "recommended", score: 84 } : { level: "low", score: 42 };
  return { level: "risky", score: 52 };
}

export function recommendedShopOffers(state: LeagueState, forecastPick: string) {
  return state.cardShop
    .map((item) => ({ ...item, fit: cardFit(item.cardId, state, forecastPick) }))
    .sort((left, right) => right.fit.score - left.fit.score || left.cardId.localeCompare(right.cardId))
    .slice(0, 3);
}

export function describeDecision(decision: LeagueState["decisions"][number] | undefined, tt: Translator) {
  if (!decision) return tt("result_no_directive");
  const card = decision.cardId ? ` · ${tt(`card_${decision.cardId}` as TranslationKey)}` : "";
  return `${tt(`approach_${decision.approach}` as TranslationKey)} · ${tt(`preparation_${decision.preparation}` as TranslationKey)}${card}`;
}

export function nextLesson(
  state: LeagueState | null,
  decision: LeagueState["decisions"][number] | undefined,
  events: RaceEvent[],
  forecastPick: string,
  tt: Translator
) {
  if (events.some((event) => event.cardId)) return tt("lesson_card_paid");
  if (decision?.preparation === "weather" && forecastPick !== "dry") return tt("lesson_weather_paid");
  if (state?.currentGrandPrix.secondaryTrait === "high_wear") return tt("lesson_reliability");
  if (state?.currentGrandPrix.primaryTrait === "fast") return tt("lesson_speed");
  return tt("lesson_balanced");
}

export function teamNamesFromResult(result: RaceResult) {
  return new Map(result.classification.map((entry) => [entry.teamId, entry.teamName]));
}

export function eventReplayText(event: RaceEvent, names: Map<string, string>, tt: Translator) {
  if (event.type === "weather_change" || event.type === "race_note") {
    return tt(`event_${event.type}` as TranslationKey);
  }
  const team = names.get(event.teamId) ?? "";
  const base = `${team} ${tt(`event_${event.type}` as TranslationKey)}`.trim();
  return event.cardId ? `${tt(`card_${event.cardId}` as TranslationKey)} · ${base}` : base;
}

export function eventReportText(event: RaceEvent, names: Map<string, string>, tt: Translator) {
  const delta = event.positionDelta ? ` (${event.positionDelta > 0 ? "+" : ""}${event.positionDelta})` : "";
  return `${eventReplayText(event, names, tt)}${delta}.`;
}

export function resultHeadline(result: RaceResult, tt: Translator, title = result.grandPrixName) {
  const winner = result.classification[0];
  return winner ? `${title}: ${winner.teamName} ${tt("report_wins")}.` : title;
}

export function localizedReportBlocks(result: RaceResult, tt: Translator) {
  const names = teamNamesFromResult(result);
  const keyEvents = result.events.filter((event) => event.severity === "major").slice(0, 4);
  return [
    {
      title: tt("report_key_moments"),
      body: keyEvents.length ? keyEvents.map((event) => eventReportText(event, names, tt)).join(" ") : tt("report_clean_race")
    },
    {
      title: tt("report_rewards"),
      body: result.classification.map((entry) => `${entry.teamName}: ${entry.points} ${tt("unit_points")}, ${entry.credits} ${tt("unit_credits")}`).join(" · ")
    }
  ];
}

export function statusLabel(status: string, tt: Translator) {
  if (status === "briefing" || status === "resolved") return tt(`gp_status_${status}` as TranslationKey);
  return status;
}
