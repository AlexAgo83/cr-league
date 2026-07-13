import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("api app", () => {
  it("responds to health checks", async () => {
    const app = await buildApp({
      host: "127.0.0.1",
      port: 0,
      webOrigin: "http://localhost:4873"
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

  it("returns a demo simulation preview", async () => {
    const app = await buildApp({
      host: "127.0.0.1",
      port: 0,
      webOrigin: "http://localhost:4873"
    });

    const response = await app.inject({
      method: "POST",
      url: "/simulation/preview"
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      grandPrixName: "Silver Ridge GP",
      classification: expect.any(Array),
      events: expect.any(Array),
      report: expect.objectContaining({
        headline: expect.any(String)
      })
    });
  });

  it("rejects invalid simulation preview input", async () => {
    const app = await buildApp({
      host: "127.0.0.1",
      port: 0,
      webOrigin: "http://localhost:4873"
    });

    const response = await app.inject({
      method: "POST",
      url: "/simulation/preview",
      payload: { seed: "missing-race-shape" }
    });

    await app.close();

    expect(response.statusCode).toBe(400);
  });
});
