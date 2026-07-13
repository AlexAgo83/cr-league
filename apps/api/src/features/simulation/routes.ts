import { DEMO_RACE_INPUT, simulateRace, type RaceInput, type RaceResult } from "@cr-league/shared";
import type { FastifyInstance } from "fastify";

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
    typeof candidate.primaryTrait === "string" &&
    typeof candidate.secondaryTrait === "string" &&
    Boolean(candidate.forecast) &&
    Array.isArray(candidate.participants) &&
    candidate.participants.length >= 2
  );
}
