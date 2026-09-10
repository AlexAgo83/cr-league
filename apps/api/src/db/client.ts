import { PrismaClient } from "@prisma/client";
import { createPgAdapter } from "./adapter.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

export const prisma = new PrismaClient({ adapter: createPgAdapter(databaseUrl) });
