import type { CardId, RaceResult } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { LeagueState } from "./types.js";

export type Translator = (key: TranslationKey) => string;

export type RaceEvent = RaceResult["events"][number];
export type SeasonStanding = {
  position: number;
  teamId: string;
  teamName: string;
  livery: LeagueState["teams"][number]["livery"] | undefined;
  points: number;
};
export type CompletedSeasonSummary = {
  season: number;
  gpCount: number;
  standings: SeasonStanding[];
  champion: SeasonStanding;
};

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
  if (cardId === "adjustable_wing") return traits.includes("fast") || traits.includes("urban") ? { level: "recommended", score: 83 } : { level: "risky", score: 54 };
  if (cardId === "rain_mapping") return hasRain || traits.includes("weather_sensitive") ? { level: "recommended", score: 81 } : { level: "risky", score: 48 };
  if (cardId === "economy_mode") return { level: "risky", score: 57 };
  if (cardId === "pit_relay") return traits.includes("technical") || traits.includes("high_wear") ? { level: "recommended", score: 79 } : { level: "low", score: 44 };
  if (cardId === "hard_tires") return traits.includes("high_wear") ? { level: "recommended", score: 86 } : { level: "risky", score: 56 };
  if (cardId === "calculated_attack") return traits.includes("urban") ? { level: "recommended", score: 80 } : { level: "risky", score: 52 };
  return { level: "risky", score: 52 };
}

export function recommendedShopOffers(state: LeagueState, forecastPick: string) {
  return state.cardShop
    .map((item) => ({ ...item, fit: cardFit(item.cardId, state, forecastPick) }))
    .sort((left, right) => right.fit.score - left.fit.score || left.cardId.localeCompare(right.cardId));
}

export function startingGrid(state: LeagueState) {
  const baseRank = new Map(state.teams.map((team, index) => [team.id, index + 1]));
  const bestTime = new Map<string, number>();

  for (const run of state.currentGrandPrix.qualifyingRuns) {
    const current = bestTime.get(run.teamId);
    if (current === undefined || run.time < current) bestTime.set(run.teamId, run.time);
  }

  return [...state.teams]
    .sort(
      (left, right) =>
        (bestTime.get(left.id) ?? Number.POSITIVE_INFINITY) - (bestTime.get(right.id) ?? Number.POSITIVE_INFINITY) ||
        (baseRank.get(left.id) ?? 999) - (baseRank.get(right.id) ?? 999)
    )
    .map((team, index) => ({
      position: index + 1,
      team,
      bestTime: bestTime.get(team.id)
    }));
}

export function seasonStandings(state: LeagueState, season: number): SeasonStanding[] {
  const teamRank = new Map(state.teams.map((team, index) => [team.id, index]));
  const teams = new Map(state.teams.map((team) => [team.id, team]));
  const points = new Map(state.teams.map((team) => [team.id, 0]));
  const names = new Map(state.teams.map((team) => [team.id, team.name]));

  for (const grandPrix of state.grandPrixHistory) {
    if (grandPrix.season !== season || !grandPrix.result) continue;
    for (const entry of grandPrix.result.classification) {
      points.set(entry.teamId, (points.get(entry.teamId) ?? 0) + entry.points);
      names.set(entry.teamId, entry.teamName);
    }
  }

  return [...points.entries()]
    .sort((left, right) => right[1] - left[1] || (teamRank.get(left[0]) ?? 999) - (teamRank.get(right[0]) ?? 999) || (names.get(left[0]) ?? left[0]).localeCompare(names.get(right[0]) ?? right[0]))
    .map(([teamId, score], index) => ({
      position: index + 1,
      teamId,
      teamName: names.get(teamId) ?? teamId,
      livery: teams.get(teamId)?.livery,
      points: score
    }));
}

export function completedSeasonSummaries(state: LeagueState): CompletedSeasonSummary[] {
  const seasons = new Map<number, number>();
  for (const grandPrix of state.grandPrixHistory) {
    if (grandPrix.season >= state.currentGrandPrix.season || !grandPrix.result) continue;
    seasons.set(grandPrix.season, (seasons.get(grandPrix.season) ?? 0) + 1);
  }

  const summaries: CompletedSeasonSummary[] = [];
  for (const [season, gpCount] of seasons) {
    const standings = seasonStandings(state, season);
    const champion = standings[0];
    if (champion) summaries.push({ season, gpCount, standings, champion });
  }
  return summaries.sort((left, right) => right.season - left.season);
}

export function seasonWinsByTeamId(state: LeagueState) {
  const wins = new Map<string, number>();
  for (const season of completedSeasonSummaries(state)) {
    wins.set(season.champion.teamId, (wins.get(season.champion.teamId) ?? 0) + 1);
  }
  return wins;
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

export function statusLabel(status: string, tt: Translator) {
  if (status === "briefing" || status === "resolved") return tt(`gp_status_${status}` as TranslationKey);
  return status;
}
