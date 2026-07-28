import { RACE_SEGMENTS, circuitIdentityForRound, circuitSeasonSeed, raceInputFromCircuit, strongestForecast, type CardId, type RaceResult } from "@cr-league/shared";
import type { TranslationKey, TranslationParams } from "../i18n/index.js";
import type { LeagueState } from "./types.js";
import { displayLapForEvent, maxEventLap } from "./lapDisplay.js";

export type Translator = (key: TranslationKey, params?: TranslationParams) => string;

export type RaceEvent = RaceResult["events"][number];
export type SeasonStanding = {
  position: number;
  teamId: string;
  teamName: string;
  livery?: LeagueState["teams"][number]["livery"];
  points: number;
};
export type CompletedSeasonSummary = {
  season: number;
  gpCount: number;
  standings: SeasonStanding[];
  champion: SeasonStanding;
};
export type RaceVerdictLine = {
  key: TranslationKey;
  params?: TranslationParams;
};
export type RaceVerdict = {
  outcome: "podium" | "gain" | "hold" | "loss";
  stance: RaceVerdictLine;
  cause: RaceVerdictLine;
  tryNext: RaceVerdictLine;
};
export type RaceActionRecommendation = {
  reason: string;
  nextAttempt: string;
  cardHint: string;
};
export type DerivedRival = {
  teamId: string;
  teamName: string;
  position: number;
  points: number;
  pointsGap: number;
};

export { strongestForecast };

export function clampNumber(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

export function countCards(cards: CardId[], cardId: CardId) {
  return cards.filter((candidate) => candidate === cardId).length;
}

export function sortCardIdsByName(cardIds: CardId[], tt: Translator) {
  return [...cardIds].sort((left, right) => tt(`card_${left}` as TranslationKey).localeCompare(tt(`card_${right}` as TranslationKey)));
}

export type CardFit = {
  level: "recommended" | "risky" | "low";
  reasonKey: TranslationKey;
  score: number;
};

export function cardFit(cardId: CardId, state: LeagueState, forecastPick: string): CardFit {
  const traits = [state.currentGrandPrix.primaryTrait, state.currentGrandPrix.secondaryTrait];
  const hasRain = forecastPick !== "dry";

  if (cardId === "rain_grip") return hasRain || traits.includes("weather_sensitive") ? { level: "recommended", reasonKey: "card_guidance_rain_match", score: 90 } : { level: "risky", reasonKey: "card_guidance_dry_risk", score: 45 };
  if (cardId === "fleet_maintenance") return traits.includes("high_wear") ? { level: "recommended", reasonKey: "card_guidance_wear_match", score: 85 } : { level: "low", reasonKey: "card_guidance_low_race_value", score: 35 };
  if (cardId === "launch_boost") return traits.includes("fast") ? { level: "recommended", reasonKey: "card_guidance_fast_match", score: 80 } : { level: "risky", reasonKey: "card_guidance_start_pressure", score: 50 };
  if (cardId === "urban_draft") return traits.includes("urban") ? { level: "recommended", reasonKey: "card_guidance_urban_match", score: 78 } : { level: "low", reasonKey: "card_guidance_needs_urban", score: 30 };
  if (cardId === "final_surge") return { level: "risky", reasonKey: "card_guidance_position_swing", score: 55 };
  if (cardId === "fleet_sponsorship") return { level: "risky", reasonKey: "card_guidance_economy_tradeoff", score: 57 };
  if (cardId === "soft_tires") return traits.includes("fast") ? { level: "recommended", reasonKey: "card_guidance_fast_match", score: 82 } : { level: "risky", reasonKey: "card_guidance_start_pressure", score: 58 };
  if (cardId === "qualifying_focus") return { level: "recommended", reasonKey: "card_guidance_chrono_value", score: 76 };
  if (cardId === "defensive_order") return traits.includes("high_wear") || traits.includes("technical") ? { level: "recommended", reasonKey: "card_guidance_control_match", score: 84 } : { level: "low", reasonKey: "card_guidance_low_race_value", score: 42 };
  if (cardId === "adjustable_wing") return traits.includes("fast") || traits.includes("urban") ? { level: "recommended", reasonKey: "card_guidance_fast_urban_match", score: 83 } : { level: "risky", reasonKey: "card_guidance_stability_cost", score: 54 };
  if (cardId === "rain_mapping") return hasRain || traits.includes("weather_sensitive") ? { level: "recommended", reasonKey: "card_guidance_rain_match", score: 81 } : { level: "risky", reasonKey: "card_guidance_dry_risk", score: 48 };
  if (cardId === "economy_mode") return { level: "risky", reasonKey: "card_guidance_economy_tradeoff", score: 57 };
  if (cardId === "pit_relay") return traits.includes("technical") || traits.includes("high_wear") ? { level: "recommended", reasonKey: "card_guidance_control_match", score: 79 } : { level: "low", reasonKey: "card_guidance_low_race_value", score: 44 };
  if (cardId === "hard_tires") return traits.includes("high_wear") ? { level: "recommended", reasonKey: "card_guidance_wear_match", score: 86 } : { level: "risky", reasonKey: "card_guidance_late_tradeoff", score: 56 };
  if (cardId === "calculated_attack") return traits.includes("urban") ? { level: "recommended", reasonKey: "card_guidance_position_swing", score: 80 } : { level: "risky", reasonKey: "card_guidance_needs_gap", score: 52 };
  return { level: "risky", reasonKey: "card_guidance_low_race_value", score: 52 };
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
  if (state.seasonSummaries?.length) return state.seasonSummaries;
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

export function derivedRivalForTeam(state: LeagueState, teamId: string | undefined): DerivedRival | null {
  if (!teamId || state.teams.every((team) => team.points === 0)) return null;
  const baseRank = new Map(state.teams.map((team, index) => [team.id, index]));
  const standings = [...state.teams]
    .sort((left, right) => right.points - left.points || (baseRank.get(left.id) ?? 999) - (baseRank.get(right.id) ?? 999) || left.id.localeCompare(right.id))
    .map((team, index) => ({ team, position: index + 1 }));
  const player = standings.find((entry) => entry.team.id === teamId);
  if (!player) return null;

  const rival = standings
    .filter((entry) => entry.team.id !== teamId)
    .sort(
      (left, right) =>
        Math.abs(left.position - player.position) - Math.abs(right.position - player.position) ||
        Math.abs(left.team.points - player.team.points) - Math.abs(right.team.points - player.team.points) ||
        left.team.id.localeCompare(right.team.id)
    )[0];
  if (!rival) return null;
  return {
    teamId: rival.team.id,
    teamName: rival.team.name,
    position: rival.position,
    points: rival.team.points,
    pointsGap: Math.abs(rival.team.points - player.team.points)
  };
}

export function raceRecapCards(
  result: RaceResult,
  state: LeagueState,
  playerTeamId: string | undefined,
  decision: LeagueState["decisions"][number] | undefined,
  raceTitle: string,
  tt: Translator,
  circuitLaps = maxEventLap(result)
) {
  return {
    difference: recapDifference(result, playerTeamId, raceTitle, tt, circuitLaps),
    directive: recapDirective(result, playerTeamId, decision, state.currentGrandPrix.round, tt),
    planRead: recapPlanRead(result, state, playerTeamId, decision, tt),
    lesson: recapNextLesson(result, state, playerTeamId, decision, tt)
  };
}

export function buildRaceVerdict(
  result: RaceResult,
  state: LeagueState,
  playerTeamId: string | undefined,
  decision: LeagueState["decisions"][number] | undefined,
  raceTitle: string,
  tt: Translator,
  circuitLaps = maxEventLap(result)
): RaceVerdict {
  const playerResult = result.classification.find((entry) => entry.teamId === playerTeamId);
  const outcome = playerResult?.position && playerResult.position <= 3 ? "podium" : (playerResult?.positionChange ?? 0) < 0 ? "loss" : (playerResult?.positionChange ?? 0) > 0 ? "gain" : "hold";
  return {
    outcome,
    stance: {
      key: "recap_verdict_stance",
      params: {
        position: playerResult?.position ?? "-",
        delta: positionDeltaText(playerResult?.positionChange ?? 0, tt),
        points: playerResult?.points ?? 0
      }
    },
    cause: raceDominantCause(result, playerTeamId, raceTitle, tt, true, circuitLaps, decision),
    tryNext: recapNextLessonLine(result, state, playerTeamId, decision, tt)
  };
}

export function buildRaceActionRecommendation(
  result: RaceResult,
  state: LeagueState,
  playerTeamId: string | undefined,
  decision: LeagueState["decisions"][number] | undefined,
  tt: Translator
): RaceActionRecommendation {
  const playerResult = result.classification.find((entry) => entry.teamId === playerTeamId);
  const autoRival = derivedRivalForTeam(state, playerTeamId);
  const rivalTeamId = decision?.rivalTeamId ?? autoRival?.teamId;
  const rivalResult = rivalTeamId ? result.classification.find((entry) => entry.teamId === rivalTeamId) : undefined;
  const ownCardEvent = decision?.cardId ? result.events.find((event) => event.teamId === playerTeamId && event.cardId === decision.cardId) : undefined;
  const nextSeason = state.currentGrandPrix.round >= state.league.maxGrandPrixPerSeason ? state.currentGrandPrix.season + 1 : state.currentGrandPrix.season;
  const nextRound = state.currentGrandPrix.round >= state.league.maxGrandPrixPerSeason ? 1 : state.currentGrandPrix.round + 1;
  const nextCircuit = circuitIdentityForRound(nextRound, circuitSeasonSeed(state.league.id, nextSeason));
  const nextInput = raceInputFromCircuit(nextCircuit);
  const nextCircuitName = `${nextCircuit.city} ${tt(nextCircuit.layoutKey as TranslationKey)}`;
  const nextFocus = nextCircuit.likelyWeather !== "dry" ? tt(`weather_${nextCircuit.likelyWeather}` as TranslationKey) : tt(`trait_${nextInput.primaryTrait}` as TranslationKey);

  const reason =
    rivalResult && playerResult
      ? tt(playerResult.position < rivalResult.position ? "report_action_reason_rival_beat" : "report_action_reason_rival_lost", { rival: rivalResult.teamName })
      : ownCardEvent?.cardId
        ? tt("report_action_reason_card_hit", { card: tt(`card_${ownCardEvent.cardId}` as TranslationKey), delta: eventImpactText(ownCardEvent.positionDelta, tt) })
        : decision?.cardId
          ? tt("report_action_reason_card_miss", { card: tt(`card_${decision.cardId}` as TranslationKey) })
          : playerResult?.position === 1
            ? tt("report_action_reason_win")
            : tt("report_action_reason_result", { position: playerResult?.position ?? "-", delta: positionDeltaText(playerResult?.positionChange ?? 0, tt) });

  const nextAttempt = tt((playerResult?.position ?? 99) <= 3 ? "report_action_next_podium" : "report_action_next_chase", {
    circuit: nextCircuitName,
    focus: nextFocus
  });

  const cardHint = decision?.cardId
    ? tt(ownCardEvent ? "report_action_card_keep" : "report_action_card_review", { card: tt(`card_${decision.cardId}` as TranslationKey), focus: nextFocus })
    : tt(nextCircuit.likelyWeather !== "dry" ? "report_action_card_weather" : "report_action_card_setup", { focus: nextFocus });

  return { reason, nextAttempt, cardHint };
}

export function translateLine(line: RaceVerdictLine, tt: Translator) {
  return tt(line.key, line.params);
}

function recapDifference(result: RaceResult, playerTeamId: string | undefined, raceTitle: string, tt: Translator, circuitLaps: number) {
  return translateLine(raceDominantCause(result, playerTeamId, raceTitle, tt, false, circuitLaps), tt);
}

function raceDominantCause(
  result: RaceResult,
  playerTeamId: string | undefined,
  raceTitle: string,
  tt: Translator,
  includeApproach: boolean,
  circuitLaps: number,
  decision?: LeagueState["decisions"][number]
): RaceVerdictLine {
  const names = teamNamesFromResult(result);
  const ownEvents = result.events.filter((event) => event.teamId === playerTeamId);
  const impactful = ownEvents
    .filter((event) => event.type !== "finish" && event.type !== "race_note")
    .sort((left, right) => Math.abs(right.positionDelta) - Math.abs(left.positionDelta))[0];
  const variant = resultVariant(result);

  if (impactful && impactful.positionDelta !== 0) {
    return {
      key: pickRecapKey("recap_difference_event", variant),
      params: {
        event: impactful.cardId ? tt(`card_${impactful.cardId}` as TranslationKey) : eventReplayText(impactful, names, tt),
        lap: displayLapForEvent(impactful, maxEventLap(result), circuitLaps),
        segment: tt(`segment_${impactful.segment}` as TranslationKey),
        delta: eventImpactText(impactful.positionDelta, tt)
      }
    };
  }

  const cardEvent = ownEvents.find((event) => event.cardId);
  if (cardEvent?.cardId) {
    return {
      key: pickRecapKey("recap_difference_card", variant),
      params: {
        card: tt(`card_${cardEvent.cardId}` as TranslationKey),
        lap: displayLapForEvent(cardEvent, maxEventLap(result), circuitLaps),
        segment: tt(`segment_${cardEvent.segment}` as TranslationKey)
      }
    };
  }

  const weatherEvent = result.events.find((event) => event.type === "weather_change");
  if (weatherEvent) {
    return {
      key: pickRecapKey("recap_difference_weather", variant),
      params: {
        lap: displayLapForEvent(weatherEvent, maxEventLap(result), circuitLaps),
        segment: tt(`segment_${weatherEvent.segment}` as TranslationKey),
        weather: tt(`weather_${result.resolvedWeather[weatherEvent.segment]}` as TranslationKey)
      }
    };
  }

  const playerResult = result.classification.find((entry) => entry.teamId === playerTeamId);
  if (includeApproach && decision && (playerResult?.positionChange ?? 0) !== 0) {
    return {
      key: pickRecapKey(`recap_verdict_cause_approach_${playerResult!.positionChange > 0 ? "gain" : "loss"}`, variant),
      params: {
        approach: tt(`approach_${decision.approach}` as TranslationKey),
        delta: positionDeltaText(playerResult!.positionChange, tt)
      }
    };
  }

  return { key: pickRecapKey("recap_difference_headline", variant), params: { headline: resultHeadline(result, tt, raceTitle) } };
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
  const resolvedWeather = strongestResolvedWeather(result);
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
      weather: tt(`weather_${resolvedWeather}` as TranslationKey)
    }),
    tt(pickRecapKey(cardKey, variant), {
      card: decision.cardId ? tt(`card_${decision.cardId}` as TranslationKey) : "",
      delta: eventImpactText(cardEvents.reduce((total, event) => total + event.positionDelta, 0), tt)
    }),
    tt(pickRecapKey(approachKey, variant), {
      approach: tt(`approach_${decision.approach}` as TranslationKey),
      delta: positionDeltaText(playerResult?.positionChange ?? 0, tt)
    })
  ].join(" ");
}

function strongestResolvedWeather(result: RaceResult) {
  return RACE_SEGMENTS.some((segment) => result.resolvedWeather[segment] === "heavy_rain")
    ? "heavy_rain"
    : RACE_SEGMENTS.some((segment) => result.resolvedWeather[segment] === "light_rain")
      ? "light_rain"
      : "dry";
}

function recapNextLesson(
  result: RaceResult,
  state: LeagueState,
  playerTeamId: string | undefined,
  decision: LeagueState["decisions"][number] | undefined,
  tt: Translator
) {
  return translateLine(recapNextLessonLine(result, state, playerTeamId, decision, tt), tt);
}

function recapNextLessonLine(
  result: RaceResult,
  state: LeagueState,
  playerTeamId: string | undefined,
  decision: LeagueState["decisions"][number] | undefined,
  tt: Translator
): RaceVerdictLine {
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

  return {
    key: pickRecapKey(family, variant),
    params: {
      circuit: `${nextCircuit.city} ${tt(nextCircuit.layoutKey as TranslationKey)}`,
      focus,
      card: decision?.cardId ? tt(`card_${decision.cardId}` as TranslationKey) : ""
    }
  };
}

function recapPlanRead(
  result: RaceResult,
  state: LeagueState,
  playerTeamId: string | undefined,
  decision: LeagueState["decisions"][number] | undefined,
  tt: Translator
) {
  if (!decision) return tt("result_no_directive");
  const playerResult = result.classification.find((entry) => entry.teamId === playerTeamId);
  const winner = result.classification[0];
  const winnerDecision = state.decisions.find((candidate) => candidate.teamId === winner?.teamId);
  const ownCardEvent = decision.cardId ? result.events.find((event) => event.teamId === playerTeamId && event.cardId === decision.cardId) : undefined;
  const ownSetup = `${tt(`approach_${decision.approach}` as TranslationKey)} / ${tt(`preparation_${decision.preparation}` as TranslationKey)} / ${decision.cardId ? tt(`card_${decision.cardId}` as TranslationKey) : tt("card_none")}`;

  if (playerResult?.position === 1) {
    return tt(ownCardEvent ? "recap_plan_win_card" : "recap_plan_win_setup", {
      setup: ownSetup,
      signal: ownCardEvent ? tt(`card_${ownCardEvent.cardId}` as TranslationKey) : tt(`approach_${decision.approach}` as TranslationKey)
    });
  }

  if (winner && winnerDecision) {
    const winnerSetup = `${tt(`approach_${winnerDecision.approach}` as TranslationKey)} / ${tt(`preparation_${winnerDecision.preparation}` as TranslationKey)} / ${winnerDecision.cardId ? tt(`card_${winnerDecision.cardId}` as TranslationKey) : tt("card_none")}`;
    return tt("recap_plan_chase_winner", {
      winner: winner.teamName,
      setup: ownSetup,
      winnerSetup
    });
  }

  return tt("recap_plan_no_reference", { setup: ownSetup });
}

export function teamNamesFromResult(result: RaceResult) {
  return new Map(result.classification.map((entry) => [entry.teamId, entry.teamName]));
}

export function eventReplayText(event: RaceEvent, names: Map<string, string>, tt: Translator) {
  const qualifyingTag = event.tags.find((tag) => tag === "qualifying_start" || tag === "qualifying_pace" || tag === "qualifying_final");
  if (qualifyingTag) {
    return tt(`event_${qualifyingTag}` as TranslationKey);
  }
  if (event.type === "weather_change") {
    return tt(`event_${event.type}` as TranslationKey);
  }
  const team = names.get(event.teamId) ?? "";
  if (event.tags.includes("mini_info") || event.type === "race_note") {
    const text = tt(`event_${event.type}` as TranslationKey);
    return team && event.type !== "race_note" ? `${team} ${text}` : text;
  }
  const base = `${team} ${tt(`event_${event.type}` as TranslationKey)}`.trim();
  return event.cardId ? `${tt(`card_${event.cardId}` as TranslationKey)} · ${base}` : base;
}

export function eventReportText(event: RaceEvent, names: Map<string, string>, tt: Translator) {
  const delta = event.positionDelta ? ` (${event.positionDelta > 0 ? "+" : ""}${event.positionDelta})` : "";
  const zone = event.zoneLabel ? ` · ${event.zoneLabel.replace(/^sector_/, "").replaceAll("_", " ")}` : "";
  const text = `${eventReplayText(event, names, tt)}${delta}${zone}`;
  return /[.!?…]$/.test(text) ? text : `${text}.`;
}

export function resultHeadline(result: RaceResult, tt: Translator, title = result.grandPrixName) {
  const winner = result.classification[0];
  return winner ? `${title ? `${title}: ` : ""}${winner.teamName} ${tt("report_wins")}.` : title;
}

function positionDeltaText(delta: number, tt: Translator) {
  if (delta > 0) return tt("recap_position_delta_gain", { delta });
  if (delta < 0) return tt("recap_position_delta_loss", { delta: Math.abs(delta) });
  return tt("recap_position_delta_hold");
}

function eventImpactText(delta: number, tt: Translator) {
  if (delta > 0) return tt("recap_event_delta_gain", { delta });
  if (delta < 0) return tt("recap_event_delta_loss", { delta: Math.abs(delta) });
  return tt("recap_event_delta_hold");
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

// ponytail: one place for the lap-time/gap "12.34s" formatting that was inlined across the plan/drive views.
export function formatSeconds(value: number, decimals = 2) {
  return `${value.toFixed(decimals)}s`;
}
