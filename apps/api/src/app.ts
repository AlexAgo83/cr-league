import cors from "@fastify/cors";
import Fastify from "fastify";
import type { ApiConfig } from "./config.js";
import { registerHealthRoutes } from "./features/health/routes.js";
import { registerSimulationRoutes } from "./features/simulation/routes.js";

export async function buildApp(config: ApiConfig) {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: config.webOrigin
  });

  await registerHealthRoutes(app);
  await registerSimulationRoutes(app);

  return app;
}
