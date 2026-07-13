import cors from "@fastify/cors";
import Fastify from "fastify";
import { APP_NAME, type HealthStatus } from "@cr-league/shared";
import type { ApiConfig } from "./config.js";

export async function buildApp(config: ApiConfig) {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: config.webOrigin
  });

  app.get("/health", async (): Promise<HealthStatus> => ({
    app: APP_NAME,
    service: "api",
    status: "ok",
    timestamp: new Date().toISOString()
  }));

  return app;
}
