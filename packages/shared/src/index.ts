export const APP_NAME = "CR League";

export type HealthStatus = {
  app: typeof APP_NAME;
  service: "api";
  status: "ok";
  timestamp: string;
};
