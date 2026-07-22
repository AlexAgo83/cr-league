import {
  CARD_DEFINITIONS,
  DEMO_RACE_INPUT,
  PIT_STRATEGIES,
  RACE_APPROACHES,
  TECHNICAL_PREPARATIONS,
  simulateRace,
  type RaceInput,
  type RaceResult,
  type RaceTraits
} from "@cr-league/shared";
import type { FastifyInstance } from "fastify";

const TRAITS = ["fast", "technical", "urban", "high_wear", "weather_sensitive"] as const;
// ponytail: 16 mirrors MAX_PLAYERS_LIMIT in leagues/store.ts — keeps the public route from doing unbounded simulateRace work
const MAX_PREVIEW_PARTICIPANTS = 16;

export async function registerSimulationRoutes(app: FastifyInstance) {
  app.post("/simulation/preview", async (request, reply): Promise<RaceResult> => {
    const input = request.body === undefined ? DEMO_RACE_INPUT : request.body;

    if (!isRaceInput(input)) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "Expected a RaceInput body or no body for the demo race."
      }) as never;
    }

    return simulateRace(input);
  });
}

function isRaceInput(value: unknown): value is RaceInput {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<RaceInput>;
  return (
    typeof candidate.seed === "string" &&
    typeof candidate.grandPrixName === "string" &&
    isOneOf(candidate.primaryTrait, TRAITS) &&
    isOneOf(candidate.secondaryTrait, TRAITS) &&
    (candidate.traits === undefined || isRaceTraits(candidate.traits)) &&
    isForecast(candidate.forecast) &&
    (candidate.trackLengthMeters === undefined || (typeof candidate.trackLengthMeters === "number" && Number.isFinite(candidate.trackLengthMeters))) &&
    Array.isArray(candidate.participants) &&
    candidate.participants.length >= 2 &&
    candidate.participants.length <= MAX_PREVIEW_PARTICIPANTS &&
    candidate.participants.every(isParticipant)
  );
}

function isRaceTraits(value: unknown): value is RaceTraits {
  if (!value || typeof value !== "object") return false;
  const traits = value as Partial<Record<keyof RaceTraits, unknown>>;
  return ["grip", "overtaking", "energy"].every((key) => typeof traits[key as keyof RaceTraits] === "number" && Number.isFinite(traits[key as keyof RaceTraits]));
}

function isForecast(value: unknown): value is RaceInput["forecast"] {
  if (!value || typeof value !== "object") return false;
  const forecast = value as Record<string, unknown>;
  const weights = [forecast.dry, forecast.light_rain, forecast.heavy_rain];
  return (
    weights.every((weight): weight is number => typeof weight === "number" && Number.isFinite(weight) && weight >= 0) &&
    weights.some((weight) => weight > 0)
  );
}

function isParticipant(value: unknown): value is RaceInput["participants"][number] {
  if (!value || typeof value !== "object") return false;
  const participant = value as Partial<RaceInput["participants"][number]>;
  const decision = participant.decision;
  return (
    typeof participant.teamId === "string" &&
    typeof participant.teamName === "string" &&
    (participant.kind === "human" || participant.kind === "bot") &&
    typeof participant.standingsRank === "number" &&
    Number.isFinite(participant.standingsRank) &&
    participant.standingsRank > 0 &&
    Boolean(decision) &&
    isOneOf(decision?.approach, RACE_APPROACHES) &&
    isOneOf(decision?.preparation, TECHNICAL_PREPARATIONS) &&
    (decision?.pitStrategy === undefined || isOneOf(decision.pitStrategy, PIT_STRATEGIES)) &&
    (decision?.cardId === undefined || decision.cardId in CARD_DEFINITIONS) &&
    (decision?.rivalTeamId === undefined || typeof decision.rivalTeamId === "string")
  );
}

function isOneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && allowed.includes(value);
}
