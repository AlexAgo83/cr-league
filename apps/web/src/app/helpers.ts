import { RACE_SEGMENTS, circuitIdentityForRound, circuitSeasonSeed, raceInputFromCircuit, type CardId, type RaceResult } from "@cr-league/shared";
import type { TranslationKey, TranslationParams } from "../i18n/index.js";
import type { LeagueState } from "./types.js";

export type Translator = (key: TranslationKey, params?: TranslationParams) => string;

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

export function clampNumber(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
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

export function raceRecapCards(
  result: RaceResult,
  state: LeagueState,
  playerTeamId: string | undefined,
  decision: LeagueState["decisions"][number] | undefined,
  raceTitle: string,
  tt: Translator
) {
  return {
    difference: recapDifference(result, playerTeamId, raceTitle, tt),
    directive: recapDirective(result, playerTeamId, decision, state.currentGrandPrix.round, tt),
    lesson: recapNextLesson(result, state, playerTeamId, decision, tt)
  };
}

function recapDifference(result: RaceResult, playerTeamId: string | undefined, raceTitle: string, tt: Translator) {
  const names = teamNamesFromResult(result);
  const ownEvents = result.events.filter((event) => event.teamId === playerTeamId);
  const impactful = [...ownEvents].sort((left, right) => Math.abs(right.positionDelta) - Math.abs(left.positionDelta))[0];
  const variant = resultVariant(result);

  if (impactful && impactful.positionDelta !== 0) {
    return tt(pickRecapKey("recap_difference_event", variant), {
      event: eventReplayText(impactful, names, tt),
      lap: impactful.lap,
      segment: tt(`segment_${impactful.segment}` as TranslationKey),
      delta: signedDelta(impactful.positionDelta)
    });
  }

  const cardEvent = ownEvents.find((event) => event.cardId);
  if (cardEvent?.cardId) {
    return tt(pickRecapKey("recap_difference_card", variant), {
      card: tt(`card_${cardEvent.cardId}` as TranslationKey),
      lap: cardEvent.lap,
      segment: tt(`segment_${cardEvent.segment}` as TranslationKey)
    });
  }

  const weatherEvent = result.events.find((event) => event.type === "weather_change");
  if (weatherEvent) {
    return tt(pickRecapKey("recap_difference_weather", variant), {
      lap: weatherEvent.lap,
      segment: tt(`segment_${weatherEvent.segment}` as TranslationKey),
      weather: tt(`weather_${result.resolvedWeather[weatherEvent.segment]}` as TranslationKey)
    });
  }

  return tt(pickRecapKey("recap_difference_headline", variant), { headline: resultHeadline(result, tt, raceTitle) });
}

function recapDirective(
  result: RaceResult,
  playerTeamId: string | undefined,
  decision: LeagueState["decisions"][number] | undefined,
  round: number,
  tt: Translator
) {
  if (!decision) return tt("result_no_directive");
  const playerResult = result.classification.find((entry) => entry.teamId === playerTeamId);
  const ownEvents = result.events.filter((event) => event.teamId === playerTeamId);
  const hasRain = RACE_SEGMENTS.some((segment) => result.resolvedWeather[segment] !== "dry");
  const variant = round % 3;
  const prepKey =
    decision.preparation === "weather" && hasRain
      ? "recap_directive_prep_good"
      : decision.preparation === "speed" && !hasRain
        ? "recap_directive_prep_good"
        : "recap_directive_prep_mixed";
  const cardEvents = decision.cardId ? ownEvents.filter((event) => event.cardId === decision.cardId) : [];
  const cardKey = decision.cardId ? (cardEvents.length ? "recap_directive_card_hit" : "recap_directive_card_miss") : "recap_directive_card_none";
  const approachKey = (playerResult?.positionChange ?? 0) > 0 ? "recap_directive_approach_gain" : (playerResult?.positionChange ?? 0) < 0 ? "recap_directive_approach_loss" : "recap_directive_approach_hold";

  return [
    tt(pickRecapKey(prepKey, variant), {
      preparation: tt(`preparation_${decision.preparation}` as TranslationKey),
      weather: tt(`weather_${hasRain ? "light_rain" : "dry"}` as TranslationKey)
    }),
    tt(pickRecapKey(cardKey, variant), {
      card: decision.cardId ? tt(`card_${decision.cardId}` as TranslationKey) : "",
      delta: signedDelta(cardEvents.reduce((total, event) => total + event.positionDelta, 0))
    }),
    tt(pickRecapKey(approachKey, variant), {
      approach: tt(`approach_${decision.approach}` as TranslationKey),
      delta: signedDelta(playerResult?.positionChange ?? 0)
    })
  ].join(" ");
}

function recapNextLesson(
  result: RaceResult,
  state: LeagueState,
  playerTeamId: string | undefined,
  decision: LeagueState["decisions"][number] | undefined,
  tt: Translator
) {
  const ownCardEvent = decision?.cardId ? result.events.find((event) => event.teamId === playerTeamId && event.cardId === decision.cardId) : undefined;
  const playerResult = result.classification.find((entry) => entry.teamId === playerTeamId);
  const nextSeason = state.currentGrandPrix.round >= state.league.maxGrandPrixPerSeason ? state.currentGrandPrix.season + 1 : state.currentGrandPrix.season;
  const nextRound = state.currentGrandPrix.round >= state.league.maxGrandPrixPerSeason ? 1 : state.currentGrandPrix.round + 1;
  const nextCircuit = circuitIdentityForRound(nextRound, circuitSeasonSeed(state.league.id, nextSeason));
  const nextInput = raceInputFromCircuit(nextCircuit);
  const variant = state.currentGrandPrix.round % 3;
  const focus =
    nextCircuit.likelyWeather !== "dry"
      ? tt(`weather_${nextCircuit.likelyWeather}` as TranslationKey)
      : tt(`trait_${nextInput.primaryTrait}` as TranslationKey);
  const family = ownCardEvent ? "recap_lesson_card" : (playerResult?.positionChange ?? 0) < 0 ? "recap_lesson_recover" : "recap_lesson_prepare";

  return tt(pickRecapKey(family, variant), {
    circuit: `${nextCircuit.city} ${tt(nextCircuit.layoutKey as TranslationKey)}`,
    focus,
    card: decision?.cardId ? tt(`card_${decision.cardId}` as TranslationKey) : ""
  });
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
  const text = `${eventReplayText(event, names, tt)}${delta}`;
  return /[.!?…]$/.test(text) ? text : `${text}.`;
}

export function resultHeadline(result: RaceResult, tt: Translator, title = result.grandPrixName) {
  const winner = result.classification[0];
  return winner ? `${title}: ${winner.teamName} ${tt("report_wins")}.` : title;
}

function signedDelta(delta: number) {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

function resultVariant(result: RaceResult) {
  return Math.abs([...result.seed].reduce((total, char) => total + char.charCodeAt(0), 0)) % 3;
}

function pickRecapKey(prefix: string, variant: number) {
  return `${prefix}_${variant % 3}` as TranslationKey;
}

export function statusLabel(status: string, tt: Translator) {
  if (status === "briefing" || status === "resolved") return tt(`gp_status_${status}` as TranslationKey);
  return status;
}
