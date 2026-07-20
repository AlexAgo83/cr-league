import type { PrismaClient } from "@prisma/client";
import { buildApp } from "./app.js";
import type { RecoveryMailer } from "./mailer.js";

export function createTestApp(db?: PrismaClient, adminToken?: string, adminEmails: string[] = [], webOrigin = "http://localhost:4873", recoveryMailer?: RecoveryMailer) {
  const config = {
    host: "127.0.0.1",
    port: 0,
    webOrigin,
    adminToken,
    adminEmails,
    smtp: { port: 587 }
  };
  return buildApp(config, { db, logger: false, recoveryMailer });
}
