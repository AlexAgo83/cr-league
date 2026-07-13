import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { createDemoLeague, getLeagueState, resolveCurrentGrandPrix, submitDecision } from "./store.js";

export async function registerLeagueRoutes(app: FastifyInstance, db: PrismaClient) {
  app.post("/leagues", async (request) => createDemoLeague(db, request.body ?? {}));

  app.get<{ Params: { leagueId: string } }>("/leagues/:leagueId", async (request, reply) => {
    const state = await getLeagueState(db, request.params.leagueId);
    if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
    return state;
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/decisions", async (request, reply) => {
    if (!isDecisionBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a team decision body." });
    }

    const state = await submitDecision(db, request.params.leagueId, request.body);
    if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
    return state;
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/resolve", async (request, reply) => {
    const state = await resolveCurrentGrandPrix(db, request.params.leagueId);
    if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
    return state;
  });
}

function isDecisionBody(value: unknown): value is Parameters<typeof submitDecision>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.teamId === "string" &&
    typeof candidate.approach === "string" &&
    typeof candidate.preparation === "string"
  );
}
