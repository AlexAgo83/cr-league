export type ApiConfig = {
  host: string;
  port: number;
  webOrigin: string;
  adminToken?: string;
  adminEmails: string[];
  smtp: {
    host?: string;
    port: number;
    user?: string;
    pass?: string;
    from?: string;
  };
};

export function readApiConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const port = Number(env.API_PORT ?? 4874);
  const smtpPort = Number(env.SMTP_PORT ?? 587);
  const production = env.NODE_ENV === "production";
  const webOrigin = env.WEB_ORIGIN ?? (production ? "" : "http://localhost:4873");
  if (!webOrigin) throw new Error("WEB_ORIGIN is required in production.");
  if (production && !env.DATABASE_URL) throw new Error("DATABASE_URL is required in production.");
  return {
    host: env.API_HOST ?? "127.0.0.1",
    port: Number.isFinite(port) ? port : 4874,
    webOrigin,
    adminToken: env.ADMIN_TOKEN?.trim() || undefined,
    adminEmails: (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
    smtp: {
      host: env.SMTP_HOST?.trim() || undefined,
      port: Number.isFinite(smtpPort) ? smtpPort : 587,
      user: env.SMTP_USER?.trim() || undefined,
      pass: env.SMTP_PASS?.trim() || undefined,
      from: env.MAIL_FROM?.trim() || undefined
    }
  };
}
