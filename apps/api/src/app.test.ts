import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("api app", () => {
  it("responds to health checks", async () => {
    const app = await buildApp({
      host: "127.0.0.1",
      port: 0,
      webOrigin: "http://localhost:5173"
    });

    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      app: "CR League",
      service: "api",
      status: "ok"
    });
  });
});
