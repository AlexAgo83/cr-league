export type ApiConfig = {
  host: string;
  port: number;
  webOrigin: string;
};

export function readApiConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  return {
    host: env.API_HOST ?? "127.0.0.1",
    port: Number(env.API_PORT ?? 4000),
    webOrigin: env.WEB_ORIGIN ?? "http://localhost:5173"
  };
}
