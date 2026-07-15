import { APP_NAME, type HealthStatus } from "@cr-league/shared";
import type { FastifyInstance } from "fastify";
import { APP_COMMIT, APP_VERSION } from "../../version.js";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", async (): Promise<HealthStatus> => ({
    app: APP_NAME,
    service: "api",
    status: "ok",
    version: APP_VERSION,
    commit: APP_COMMIT,
    timestamp: new Date().toISOString()
  }));
}
