import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import {
  LeagueRuleError,
  createDemoLeague,
  getLeagueState,
  joinLeagueByCode,
  rejoinLeague,
  resolveCurrentGrandPrix,
  startNextGrandPrix,
  submitDecision,
  updateLeagueSettings
} from "./store.js";

export async function registerLeagueRoutes(app: FastifyInstance, db: PrismaClient) {
  app.post("/leagues", async (request) => createDemoLeague(db, request.body ?? {}));

  app.post("/leagues/join", async (request, reply) => {
    if (!isJoinBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a league code and team name." });
    }

    try {
      const state = await joinLeagueByCode(db, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return state;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });

  app.post("/leagues/rejoin", async (request, reply) => {
    if (!isRejoinBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a team id and claim code." });
    }

    try {
      const state = await rejoinLeague(db, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "Team claim not found." });
      return state;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });

  app.get<{ Params: { leagueId: string } }>("/leagues/:leagueId", async (request, reply) => {
    const state = await getLeagueState(db, request.params.leagueId);
    if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
    return state;
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/settings", async (request, reply) => {
    if (!isSettingsBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected league settings body." });
    }

    try {
      const state = await updateLeagueSettings(db, request.params.leagueId, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return state;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/decisions", async (request, reply) => {
    if (!isDecisionBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a team decision body." });
    }

    try {
      const state = await submitDecision(db, request.params.leagueId, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return state;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/resolve", async (request, reply) => {
    try {
      const state = await resolveCurrentGrandPrix(db, request.params.leagueId, request.body ?? {});
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return state;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/next-grand-prix", async (request, reply) => {
    try {
      const state = await startNextGrandPrix(db, request.params.leagueId);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return state;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });
}

function isJoinBody(value: unknown): value is Parameters<typeof joinLeagueByCode>[1] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.code === "string" && typeof candidate.teamName === "string";
}

function isRejoinBody(value: unknown): value is Parameters<typeof rejoinLeague>[1] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string";
}

function isSettingsBody(value: unknown): value is Parameters<typeof updateLeagueSettings>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    (candidate.cadence === undefined || typeof candidate.cadence === "string") &&
    (candidate.preparationDeadlineAt === undefined ||
      candidate.preparationDeadlineAt === null ||
      typeof candidate.preparationDeadlineAt === "string")
  );
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
