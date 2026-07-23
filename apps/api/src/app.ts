import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import type { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import type { ApiConfig } from "./config.js";
import { registerAdminRoutes } from "./features/admin/routes.js";
import { registerHealthRoutes } from "./features/health/routes.js";
import { registerLeagueRoutes } from "./features/leagues/routes.js";
import { registerSimulationRoutes } from "./features/simulation/routes.js";
import { createRecoveryMailer, type RecoveryMailer } from "./mailer.js";

export type AppDependencies = {
  db?: PrismaClient;
  logger?: boolean;
  recoveryMailer?: RecoveryMailer;
};

export async function buildApp(config: ApiConfig, dependencies: AppDependencies = {}) {
  const app = Fastify({
    logger: dependencies.logger ?? true
  });

  const webOrigins = new Set([config.webOrigin]);
  if (isLocalOrigin(config.webOrigin)) {
    webOrigins.add("http://localhost:4873");
    webOrigins.add("http://127.0.0.1:4873");
  }

  await app.register(cors, {
    allowedHeaders: ["authorization", "content-type"],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    origin: (origin, callback) => {
      callback(null, !origin || webOrigins.has(origin));
    }
  });
  await app.register(rateLimit, { global: false });

  await registerHealthRoutes(app);
  await registerSimulationRoutes(app);
  if (dependencies.db) {
    await registerAdminRoutes(app, dependencies.db, config);
    await registerLeagueRoutes(app, dependencies.db, config, dependencies.recoveryMailer ?? createRecoveryMailer(config, app.log));
  }

  return app;
}

function isLocalOrigin(origin: string) {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
