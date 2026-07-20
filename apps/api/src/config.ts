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
  return {
    host: env.API_HOST ?? "127.0.0.1",
    port: Number.isFinite(port) ? port : 4874,
    webOrigin: env.WEB_ORIGIN ?? "http://localhost:4873",
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
