import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import {
  LeagueRuleError,
  buyCard,
  createDemoLeague,
  createProfile,
  getLeagueState,
  joinLeagueByCode,
  recoverProfile,
  rejoinLeague,
  restartLeague,
  resolveCurrentGrandPrix,
  startNextGrandPrix,
  submitDecision,
  submitQualifyingRun,
  updateLeagueSettings,
  updateTeamLivery,
  updateTeamName
} from "./store.js";

export async function registerLeagueRoutes(app: FastifyInstance, db: PrismaClient) {
  app.post("/profiles", async (request, reply) => {
    if (!isCreateProfileBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a valid email." });
    }

    try {
      return await createProfile(db, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });

  app.post("/profiles/recover", async (request, reply) => {
    if (!isRecoverProfileBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected an email and recovery code." });
    }

    try {
      const session = await recoverProfile(db, request.body);
      if (!session) return reply.code(404).send({ error: "Not Found", message: "Profile not found." });
      return session;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });

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

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/cards/buy", async (request, reply) => {
    if (!isBuyCardBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a team id and card id." });
    }

    try {
      const state = await buyCard(db, request.params.leagueId, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return state;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/teams/livery", async (request, reply) => {
    if (!isLiveryBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected team livery body." });
    }

    try {
      const state = await updateTeamLivery(db, request.params.leagueId, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return state;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return reply.code(409).send({ error: "Conflict", message: error.message });
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/teams/name", async (request, reply) => {
    if (!isTeamNameBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected team name body." });
    }

    try {
      const state = await updateTeamName(db, request.params.leagueId, request.body);
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

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/qualifying", async (request, reply) => {
    if (!isQualifyingBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a team qualifying body." });
    }

    try {
      const response = await submitQualifyingRun(db, request.params.leagueId, request.body);
      if (!response?.state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return response;
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

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/restart", async (request, reply) => {
    const state = await restartLeague(db, request.params.leagueId);
    if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
    return state;
  });
}

function isCreateProfileBody(value: unknown): value is Parameters<typeof createProfile>[1] {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.email === "string";
}

function isRecoverProfileBody(value: unknown): value is Parameters<typeof recoverProfile>[1] {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.email === "string" && typeof candidate.recoveryCode === "string";
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

function isBuyCardBody(value: unknown): value is Parameters<typeof buyCard>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.teamId === "string" && typeof candidate.cardId === "string";
}

function isLiveryBody(value: unknown): value is Parameters<typeof updateTeamLivery>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.teamId === "string" && typeof candidate.livery === "object" && candidate.livery !== null;
}

function isTeamNameBody(value: unknown): value is Parameters<typeof updateTeamName>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.teamId === "string" && typeof candidate.name === "string";
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

function isQualifyingBody(value: unknown): value is Parameters<typeof submitQualifyingRun>[2] {
  if (!isDecisionBody(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.traits === undefined || (typeof candidate.traits === "object" && candidate.traits !== null)) &&
    (candidate.laps === undefined || typeof candidate.laps === "number")
  );
}
