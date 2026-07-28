import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { timingSafeEqual } from "node:crypto";
import type { ApiConfig } from "../../config.js";
import {
  AdminCleanupError,
  cleanupAdminTestData,
  deleteAdminUser,
  inspectAdminLeague,
  listAdminLeagues,
  listAdminUsers,
  resetAdminUserRecoveryCode,
  type AdminListInput
} from "./adminData.js";

type AdminListQuery = {
  q?: string;
  page?: string;
  limit?: string;
};
type AdminCleanupBody = {
  profileIds?: string[];
  leagueIds?: string[];
  confirmation?: string;
};
type AdminDeleteBody = {
  confirmation?: string;
};

// ponytail: stricter than the leagues WRITE_RATE_LIMIT (30/min) on purpose — admin routes are token-guarded
// and legitimately low-traffic, so a tight budget also throttles Authorization-header guessing.
const ADMIN_RATE_LIMIT = { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } };

export async function registerAdminRoutes(app: FastifyInstance, db: PrismaClient, config: ApiConfig) {
  app.addHook("preHandler", async (request, reply) => {
    if (!request.url.startsWith("/admin/")) return;
    if (!config.adminToken) return reply.code(503).send({ error: "Unavailable", message: "Admin operations are not configured." });
    if (!sameToken(adminTokenFrom(request), config.adminToken)) return reply.code(403).send({ error: "Forbidden", message: "Admin token is required." });
  });

  app.get<{ Querystring: AdminListQuery }>("/admin/users", ADMIN_RATE_LIMIT, async (request) => listAdminUsers(db, adminListInput(request.query)));

  app.post<{ Params: { profileId: string } }>("/admin/users/:profileId/recovery-code", ADMIN_RATE_LIMIT, async (request, reply) => {
    try {
      return await resetAdminUserRecoveryCode(db, request.params.profileId);
    } catch (error) {
      return sendAdminStoreError(reply, error, "Profile not found.");
    }
  });

  app.delete<{ Params: { profileId: string }; Body: AdminDeleteBody }>("/admin/users/:profileId", ADMIN_RATE_LIMIT, async (request, reply) => {
    try {
      return await deleteAdminUser(db, request.params.profileId, request.body ?? {});
    } catch (error) {
      if (error instanceof AdminCleanupError) return reply.code(400).send({ error: "Bad Request", message: error.message });
      return sendAdminStoreError(reply, error, "Profile not found.");
    }
  });

  app.post<{ Body: AdminCleanupBody }>("/admin/test-data-cleanup", ADMIN_RATE_LIMIT, async (request, reply) => {
    try {
      return await cleanupAdminTestData(db, request.body);
    } catch (error) {
      if (error instanceof AdminCleanupError) return reply.code(400).send({ error: "Bad Request", message: error.message });
      return sendAdminStoreError(reply, error, "Selected test data not found.");
    }
  });

  app.get<{ Querystring: AdminListQuery }>("/admin/leagues", ADMIN_RATE_LIMIT, async (request) => listAdminLeagues(db, adminListInput(request.query)));

  app.get<{ Params: { leagueId: string } }>("/admin/leagues/:leagueId", ADMIN_RATE_LIMIT, async (request, reply) => {
    const state = await inspectAdminLeague(db, request.params.leagueId);
    if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
    return state;
  });
}

function adminListInput(query: AdminListQuery): AdminListInput {
  return {
    q: query.q,
    page: numberParam(query.page),
    limit: numberParam(query.limit)
  };
}

function numberParam(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function adminTokenFrom(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : undefined;
}

function sameToken(actualToken: string | undefined, expectedToken: string) {
  const expected = Buffer.from(expectedToken);
  const actual = Buffer.from(actualToken ?? "");
  if (actual.length !== expected.length) {
    timingSafeEqual(expected, Buffer.alloc(expected.length));
    return false;
  }
  return timingSafeEqual(actual, expected);
}

function sendAdminStoreError(reply: FastifyReply, error: unknown, message: string) {
  if (typeof error === "object" && error && "code" in error && error.code === "P2025") {
    return reply.code(404).send({ error: "Not Found", message });
  }
  throw error;
}
