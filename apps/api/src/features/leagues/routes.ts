import type { FastifyInstance, FastifyReply } from "fastify";
import type { PrismaClient } from "@prisma/client";
import type { ApiConfig } from "../../config.js";
import {
  LeagueRuleError,
  buyCard,
  createDemoLeague,
  createProfile,
  getLeagueState,
  getOpponentConfigComparison,
  joinLeagueByCode,
  publicLeagueState,
  recoverProfile,
  requestRecoveryCode,
  rejoinLeague,
  restartLeague,
  resolveCurrentGrandPrix,
  sellCard,
  startNextGrandPrix,
  submitDecision,
  submitQualifyingRun,
  updateLeagueSettings,
  updateTeamLivery,
  updateTeamName,
  withPlayer
} from "./store.js";
import type { RecoveryMailer } from "../../mailer.js";
import type { LeagueState } from "./types.js";

const RECOVERY_REQUEST_OK = { ok: true, message: "If a profile exists for this email, a fresh recovery code will be sent." };

export async function registerLeagueRoutes(app: FastifyInstance, db: PrismaClient, config?: Pick<ApiConfig, "adminEmails">, mailer?: RecoveryMailer) {
  const recoveryLimiter = createRecoveryLimiter();

  app.post("/profiles", async (request, reply) => {
    if (!isCreateProfileBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a valid email." });
    }

    try {
      return withAdminFlag(await createProfile(db, request.body, mailer), config);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post("/profiles/recovery-code", async (request, reply) => {
    if (!isRequestRecoveryCodeBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a valid email." });
    }
    const body = request.body as { email: string };

    if (!recoveryLimiter.take(body.email ?? "", request.ip)) {
      return reply.code(429).send({ error: "Too Many Requests", message: "Too many recovery attempts. Try again later." });
    }

    try {
      await requestRecoveryCode(db, body, mailer);
      return RECOVERY_REQUEST_OK;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post("/profiles/recover", async (request, reply) => {
    if (!isRecoverProfileBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected an email and recovery code." });
    }
    const body = request.body as { email: string; recoveryCode: string };

    try {
      if (!recoveryLimiter.take(body.email ?? "", request.ip)) {
        return reply.code(429).send({ error: "Too Many Requests", message: "Too many recovery attempts. Try again later." });
      }
      const session = await recoverProfile(db, body);
      if (!session) return reply.code(404).send({ error: "Not Found", message: "Profile not found." });
      return withAdminFlag(session, config);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post("/leagues", async (request, reply) => {
    try {
      return await createDemoLeague(db, request.body ?? {});
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

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
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post("/leagues/rejoin", async (request, reply) => {
    if (!isTeamClaimBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a team id and claim code." });
    }

    try {
      const state = await rejoinLeague(db, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "Team claim not found." });
      return state;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.get<{ Params: { leagueId: string } }>("/leagues/:leagueId", async (request, reply) => {
    const state = await getLeagueState(db, request.params.leagueId);
    if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
    return publicLeagueState(state);
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/opponent-configs", async (request, reply) => {
    if (!isTeamClaimBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a team id and claim code." });
    }

    try {
      const comparison = await getOpponentConfigComparison(db, request.params.leagueId, request.body);
      if (!comparison) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return comparison;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/settings", async (request, reply) => {
    if (!isSettingsBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected league settings body." });
    }

    try {
      const state = await updateLeagueSettings(db, request.params.leagueId, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return stateForBody(state, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
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
      return stateForBody(state, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/cards/sell", async (request, reply) => {
    if (!isBuyCardBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a team id and card id." });
    }

    try {
      const state = await sellCard(db, request.params.leagueId, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return stateForBody(state, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
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
      return stateForBody(state, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
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
      return stateForBody(state, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
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
      return stateForBody(state, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
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
      return { ...response, state: stateForBody(response.state, request.body) };
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/resolve", async (request, reply) => {
    try {
      if (!isAdminBody(request.body)) {
        return reply.code(400).send({ error: "Bad Request", message: "Expected an admin proof body." });
      }
      const state = await resolveCurrentGrandPrix(db, request.params.leagueId, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return stateForBody(state, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/next-grand-prix", async (request, reply) => {
    try {
      if (!isAdminBody(request.body)) {
        return reply.code(400).send({ error: "Bad Request", message: "Expected an admin proof body." });
      }
      const state = await startNextGrandPrix(db, request.params.leagueId, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return stateForBody(state, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/restart", async (request, reply) => {
    if (!isAdminBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected an admin proof body." });
    }
    try {
      const state = await restartLeague(db, request.params.leagueId, request.body);
      if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
      return stateForBody(state, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });
}

function withAdminFlag<T extends { profile: { email: string } }>(session: T, config?: Pick<ApiConfig, "adminEmails">) {
  return {
    ...session,
    admin: isAdminEmail(session.profile.email, config)
  };
}

function isAdminEmail(email: string, config?: Pick<ApiConfig, "adminEmails">) {
  return Boolean(config?.adminEmails.includes(email.toLowerCase()));
}

function createRecoveryLimiter(limit = 5, windowMs = 15 * 60 * 1000) {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  const prune = (now: number) => {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  };
  const canTake = (key: string, now: number) => {
    const bucket = buckets.get(key);
    return !bucket || bucket.resetAt <= now || bucket.count < limit;
  };
  const increment = (key: string, now: number) => {
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      bucket.count += 1;
    }
  };

  const takePair = (emailKey: string, ipKey: string) => {
    const now = Date.now();
    prune(now);
    if (!canTake(emailKey, now) || !canTake(ipKey, now)) return false;
    increment(emailKey, now);
    increment(ipKey, now);
    return true;
  };

  return {
    take(email: string, ip: string) {
      // ponytail: in-process limiter is enough for single-node Render; use Redis if API scales horizontally.
      return takePair(`email:${email.trim().toLowerCase()}`, `ip:${ip}`);
    }
  };
}

function sendLeagueRuleError(reply: FastifyReply, error: LeagueRuleError) {
  const label = error.statusCode === 403 ? "Forbidden" : error.statusCode === 400 ? "Bad Request" : "Conflict";
  return reply.code(error.statusCode).send({ error: label, message: error.message });
}

function stateForBody(state: LeagueState, body: unknown) {
  return isTeamClaimBody(body) ? withPlayer(state, body.teamId, body.claimCode) : publicLeagueState(state);
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

function isRequestRecoveryCodeBody(value: unknown): value is Parameters<typeof requestRecoveryCode>[1] {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.email === "string";
}

function isJoinBody(value: unknown): value is Parameters<typeof joinLeagueByCode>[1] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.code === "string" && typeof candidate.teamName === "string";
}

function isTeamClaimBody(value: unknown): value is { teamId: string; claimCode: string } {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string";
}

function isSettingsBody(value: unknown): value is Parameters<typeof updateLeagueSettings>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.teamId === "string" &&
    typeof candidate.claimCode === "string" &&
    (candidate.cadence === undefined || typeof candidate.cadence === "string") &&
    (candidate.preparationDeadlineAt === undefined ||
      candidate.preparationDeadlineAt === null ||
      typeof candidate.preparationDeadlineAt === "string")
  );
}

function isBuyCardBody(value: unknown): value is Parameters<typeof buyCard>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string" && typeof candidate.cardId === "string" && (candidate.quantity === undefined || typeof candidate.quantity === "number");
}

function isLiveryBody(value: unknown): value is Parameters<typeof updateTeamLivery>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string" && typeof candidate.livery === "object" && candidate.livery !== null;
}

function isTeamNameBody(value: unknown): value is Parameters<typeof updateTeamName>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string" && typeof candidate.name === "string";
}

function isDecisionBody(value: unknown): value is Parameters<typeof submitDecision>[2] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.teamId === "string" &&
    typeof candidate.claimCode === "string" &&
    typeof candidate.approach === "string" &&
    typeof candidate.preparation === "string"
  );
}

function isAdminBody(value: unknown): value is { teamId: string; claimCode: string; allowDefaults?: boolean; traits?: unknown; laps?: unknown; pitLaneProgress?: unknown } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.teamId === "string" &&
    typeof candidate.claimCode === "string" &&
    (candidate.allowDefaults === undefined || typeof candidate.allowDefaults === "boolean") &&
    (candidate.laps === undefined || typeof candidate.laps === "number") &&
    (candidate.pitLaneProgress === undefined || typeof candidate.pitLaneProgress === "number")
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
