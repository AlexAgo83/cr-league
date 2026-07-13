import { config as loadEnv } from "dotenv";
import { buildApp } from "./app.js";
import { readApiConfig } from "./config.js";
import { prisma } from "./db/client.js";

loadEnv({ path: new URL("../../../.env", import.meta.url) });

const config = readApiConfig();
const app = await buildApp(config, { db: prisma });

app.addHook("onClose", async () => {
  await prisma.$disconnect();
});

try {
  await app.listen({
    host: config.host,
    port: config.port
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
