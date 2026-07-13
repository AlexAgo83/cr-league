import { APP_NAME, type HealthStatus } from "@cr-league/shared";
import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", async (): Promise<HealthStatus> => ({
    app: APP_NAME,
    service: "api",
    status: "ok",
    timestamp: new Date().toISOString()
  }));
}
