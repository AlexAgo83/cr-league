import type { PrismaClient } from "@prisma/client";
import { buildApp } from "./app.js";

export function createTestApp(db?: PrismaClient, adminToken?: string, adminEmails: string[] = []) {
  const config = {
    host: "127.0.0.1",
    port: 0,
    webOrigin: "http://localhost:4873",
    adminToken,
    adminEmails
  };
  return buildApp(config, { db, logger: false });
}
