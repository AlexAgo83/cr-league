import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { PrismaClient } from "@prisma/client";
import type { ApiConfig } from "../../config.js";
import {
  LeagueRuleError,
  buyCarAsset,
  buyCard,
  createDemoLeague,
  createProfile,
  getGrandPrixResult,
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
  sendPlanReminders,
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
const WRITE_RATE_LIMIT = { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } };

export async function registerLeagueRoutes(app: FastifyInstance, db: PrismaClient, config?: Pick<ApiConfig, "adminEmails">, mailer?: RecoveryMailer) {
  const recoveryLimiter = createRecoveryLimiter();

  app.post("/profiles", WRITE_RATE_LIMIT, async (request, reply) => {
    if (!isCreateProfileBody(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: "Expected a valid email." });
    }

    try {
      await createProfile(db, request.body, mailer);
      return RECOVERY_REQUEST_OK;
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        if (error.message.includes("already has a profile")) return RECOVERY_REQUEST_OK;
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

  app.post("/leagues", WRITE_RATE_LIMIT, async (request, reply) => {
    try {
      return await createDemoLeague(db, request.body ?? {});
    } catch (error) {
      if (error instanceof LeagueRuleError) {
        return sendLeagueRuleError(reply, error);
      }
      throw error;
    }
  });

  app.post("/leagues/join", WRITE_RATE_LIMIT, jsonRoute({
    guard: isJoinBody,
    badRequest: "Expected a league code and team name.",
    run: (body) => joinLeagueByCode(db, body),
    serialize: (state) => state
  }));

  app.post("/leagues/rejoin", WRITE_RATE_LIMIT, jsonRoute({
    guard: isTeamClaimBody,
    badRequest: "Expected a team id and claim code.",
    run: (body) => rejoinLeague(db, body),
    serialize: (state) => state,
    notFound: "Team claim not found."
  }));

  app.get<{ Params: { leagueId: string } }>("/leagues/:leagueId", async (request, reply) => {
    const state = await getLeagueState(db, request.params.leagueId);
    if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
    return publicLeagueState(state);
  });

  // League state ships replay traces for the two most recent races only, so opening an older
  // replay fetches that one result on demand instead of every state read carrying all of them.
  app.get<{ Params: { leagueId: string; grandPrixId: string } }>("/leagues/:leagueId/grand-prix/:grandPrixId/result", async (request, reply) => {
    const result = await getGrandPrixResult(db, request.params.leagueId, request.params.grandPrixId);
    if (!result) return reply.code(404).send({ error: "Not Found", message: "Grand Prix result not found." });
    return { result };
  });

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/opponent-configs", WRITE_RATE_LIMIT, jsonRoute({
    guard: isTeamClaimBody,
    badRequest: "Expected a team id and claim code.",
    run: (body, leagueId) => getOpponentConfigComparison(db, leagueId, body),
    serialize: (comparison) => comparison
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/settings", WRITE_RATE_LIMIT, jsonRoute({
    guard: isSettingsBody,
    badRequest: "Expected league settings body.",
    run: (body, leagueId) => updateLeagueSettings(db, leagueId, body)
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/cards/buy", WRITE_RATE_LIMIT, jsonRoute({
    guard: isBuyCardBody,
    badRequest: "Expected a team id and card id.",
    run: (body, leagueId) => buyCard(db, leagueId, body)
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/cars/buy", WRITE_RATE_LIMIT, jsonRoute({
    guard: isBuyCarBody,
    badRequest: "Expected a team id and car asset id.",
    run: (body, leagueId) => buyCarAsset(db, leagueId, body)
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/cards/sell", WRITE_RATE_LIMIT, jsonRoute({
    guard: isBuyCardBody,
    badRequest: "Expected a team id and card id.",
    run: (body, leagueId) => sellCard(db, leagueId, body)
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/teams/livery", WRITE_RATE_LIMIT, jsonRoute({
    guard: isLiveryBody,
    badRequest: "Expected team livery body.",
    run: (body, leagueId) => updateTeamLivery(db, leagueId, body)
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/teams/name", WRITE_RATE_LIMIT, jsonRoute({
    guard: isTeamNameBody,
    badRequest: "Expected team name body.",
    run: (body, leagueId) => updateTeamName(db, leagueId, body)
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/decisions", WRITE_RATE_LIMIT, jsonRoute({
    guard: isDecisionBody,
    badRequest: "Expected a team decision body.",
    run: (body, leagueId) => submitDecision(db, leagueId, body)
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/qualifying", WRITE_RATE_LIMIT, async (request, reply) => {
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

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/resolve", WRITE_RATE_LIMIT, jsonRoute({
    guard: isAdminBody,
    badRequest: "Expected an admin proof body.",
    run: (body, leagueId) => resolveCurrentGrandPrix(db, leagueId, body)
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/reminders/plan", WRITE_RATE_LIMIT, jsonRoute({
    guard: isAdminBody,
    badRequest: "Expected an admin proof body.",
    run: (body, leagueId) => sendPlanReminders(db, leagueId, body, mailer),
    serialize: (result, body) => {
      const payload = result as Awaited<ReturnType<typeof sendPlanReminders>>;
      if (!payload?.state) return payload;
      return { ...stateForBody(payload.state, body), reminder: payload.reminder };
    }
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/next-grand-prix", WRITE_RATE_LIMIT, jsonRoute({
    guard: isAdminBody,
    badRequest: "Expected an admin proof body.",
    run: (body, leagueId) => startNextGrandPrix(db, leagueId, body)
  }));

  app.post<{ Params: { leagueId: string } }>("/leagues/:leagueId/restart", WRITE_RATE_LIMIT, jsonRoute({
    guard: isAdminBody,
    badRequest: "Expected an admin proof body.",
    run: (body, leagueId) => restartLeague(db, leagueId, body)
  }));
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

// ponytail: collapses the guard -> 404-on-null -> LeagueRuleError-catch block that was copy-pasted
// across ~14 handlers. Each route still supplies its own 400 message and (via `serialize`) whether to
// return player-scoped or public state; behavior and response bodies are unchanged.
function jsonRoute<B>(config: {
  guard: (value: unknown) => value is B;
  badRequest: string;
  run: (body: B, leagueId: string) => Promise<unknown | null | undefined>;
  serialize?: (result: unknown, body: B) => unknown;
  notFound?: string;
}) {
  const serialize = config.serialize ?? ((result: unknown, body: B) => stateForBody(result as LeagueState, body));
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!config.guard(request.body)) {
      return reply.code(400).send({ error: "Bad Request", message: config.badRequest });
    }
    const leagueId = (request.params as { leagueId?: string } | undefined)?.leagueId ?? "";
    try {
      const result = await config.run(request.body, leagueId);
      if (result === null || result === undefined) {
        return reply.code(404).send({ error: "Not Found", message: config.notFound ?? "League not found." });
      }
      return serialize(result, request.body);
    } catch (error) {
      if (error instanceof LeagueRuleError) return sendLeagueRuleError(reply, error);
      throw error;
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function isCreateProfileBody(value: unknown): value is Parameters<typeof createProfile>[1] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return typeof candidate.email === "string";
}

function isRecoverProfileBody(value: unknown): value is Parameters<typeof recoverProfile>[1] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return typeof candidate.email === "string" && typeof candidate.recoveryCode === "string";
}

function isRequestRecoveryCodeBody(value: unknown): value is Parameters<typeof requestRecoveryCode>[1] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return typeof candidate.email === "string";
}

function isJoinBody(value: unknown): value is Parameters<typeof joinLeagueByCode>[1] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return typeof candidate.code === "string" && typeof candidate.teamName === "string";
}

function isTeamClaimBody(value: unknown): value is { teamId: string; claimCode: string } {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string";
}

function isSettingsBody(value: unknown): value is Parameters<typeof updateLeagueSettings>[2] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return (
    typeof candidate.teamId === "string" &&
    typeof candidate.claimCode === "string" &&
    (candidate.name === undefined || typeof candidate.name === "string") &&
    (candidate.cadence === undefined || typeof candidate.cadence === "string") &&
    (candidate.preparationDeadlineAt === undefined ||
      candidate.preparationDeadlineAt === null ||
      typeof candidate.preparationDeadlineAt === "string")
  );
}

function isBuyCardBody(value: unknown): value is Parameters<typeof buyCard>[2] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string" && typeof candidate.cardId === "string" && (candidate.quantity === undefined || typeof candidate.quantity === "number");
}

function isBuyCarBody(value: unknown): value is Parameters<typeof buyCarAsset>[2] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string" && typeof candidate.carAssetId === "string";
}

function isLiveryBody(value: unknown): value is Parameters<typeof updateTeamLivery>[2] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string" && typeof candidate.livery === "object" && candidate.livery !== null;
}

function isTeamNameBody(value: unknown): value is Parameters<typeof updateTeamName>[2] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return typeof candidate.teamId === "string" && typeof candidate.claimCode === "string" && typeof candidate.name === "string";
}

function isDecisionBody(value: unknown): value is Parameters<typeof submitDecision>[2] {
  const candidate = asRecord(value);
  if (!candidate) return false;
  return (
    typeof candidate.teamId === "string" &&
    typeof candidate.claimCode === "string" &&
    typeof candidate.approach === "string" &&
    typeof candidate.preparation === "string"
  );
}

function isAdminBody(value: unknown): value is { teamId: string; claimCode: string; allowDefaults?: boolean; traits?: unknown; laps?: unknown; pitLaneProgress?: unknown } {
  const candidate = asRecord(value);
  if (!candidate) return false;
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
