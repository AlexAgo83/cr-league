import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { PrismaClient } from "@prisma/client";
import type { ApiConfig } from "../../config.js";
import { deleteAdminUser, inspectAdminLeague, listAdminLeagues, listAdminUsers, resetAdminUserRecoveryCode } from "./store.js";

export async function registerAdminRoutes(app: FastifyInstance, db: PrismaClient, config: ApiConfig) {
  app.addHook("preHandler", async (request, reply) => {
    if (!request.url.startsWith("/admin/")) return;
    if (!config.adminToken) return reply.code(503).send({ error: "Unavailable", message: "Admin operations are not configured." });
    if (adminTokenFrom(request) !== config.adminToken) return reply.code(403).send({ error: "Forbidden", message: "Admin token is required." });
  });

  app.get("/admin/users", async () => listAdminUsers(db));

  app.post<{ Params: { profileId: string } }>("/admin/users/:profileId/recovery-code", async (request, reply) => {
    try {
      return await resetAdminUserRecoveryCode(db, request.params.profileId);
    } catch (error) {
      return sendAdminStoreError(reply, error, "Profile not found.");
    }
  });

  app.delete<{ Params: { profileId: string } }>("/admin/users/:profileId", async (request, reply) => {
    try {
      return await deleteAdminUser(db, request.params.profileId);
    } catch (error) {
      return sendAdminStoreError(reply, error, "Profile not found.");
    }
  });

  app.get("/admin/leagues", async () => listAdminLeagues(db));

  app.get<{ Params: { leagueId: string } }>("/admin/leagues/:leagueId", async (request, reply) => {
    const state = await inspectAdminLeague(db, request.params.leagueId);
    if (!state) return reply.code(404).send({ error: "Not Found", message: "League not found." });
    return state;
  });
}

function adminTokenFrom(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : undefined;
}

function sendAdminStoreError(reply: FastifyReply, error: unknown, message: string) {
  if (typeof error === "object" && error && "code" in error && error.code === "P2025") {
    return reply.code(404).send({ error: "Not Found", message });
  }
  throw error;
}
