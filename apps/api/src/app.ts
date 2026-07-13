import cors from "@fastify/cors";
import type { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import type { ApiConfig } from "./config.js";
import { registerHealthRoutes } from "./features/health/routes.js";
import { registerLeagueRoutes } from "./features/leagues/routes.js";
import { registerSimulationRoutes } from "./features/simulation/routes.js";

export type AppDependencies = {
  db?: PrismaClient;
};

export async function buildApp(config: ApiConfig, dependencies: AppDependencies = {}) {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: config.webOrigin
  });

  await registerHealthRoutes(app);
  await registerSimulationRoutes(app);
  if (dependencies.db) {
    await registerLeagueRoutes(app, dependencies.db);
  }

  return app;
}
