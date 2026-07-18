import cors from "@fastify/cors";
import type { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import type { ApiConfig } from "./config.js";
import { registerHealthRoutes } from "./features/health/routes.js";
import { registerLeagueRoutes } from "./features/leagues/routes.js";
import { registerSimulationRoutes } from "./features/simulation/routes.js";

export type AppDependencies = {
  db?: PrismaClient;
  logger?: boolean;
};

export async function buildApp(config: ApiConfig, dependencies: AppDependencies = {}) {
  const app = Fastify({
    logger: dependencies.logger ?? true
  });

  const webOrigins = new Set([config.webOrigin, "http://localhost:4873", "http://127.0.0.1:4873"]);

  await app.register(cors, {
    origin: (origin, callback) => {
      callback(null, !origin || webOrigins.has(origin));
    }
  });

  await registerHealthRoutes(app);
  await registerSimulationRoutes(app);
  if (dependencies.db) {
    await registerLeagueRoutes(app, dependencies.db);
  }

  return app;
}
