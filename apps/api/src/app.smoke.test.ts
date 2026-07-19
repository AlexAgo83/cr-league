import { describe, expect, it } from "vitest";
import { DEMO_RACE_INPUT } from "@cr-league/shared";
import { createTestApp } from "./app.testHelpers.js";
import { APP_COMMIT, APP_VERSION } from "./version.js";

describe("api app smoke", () => {
  it("responds to health checks", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      app: "CR League",
      service: "api",
      status: "ok",
      version: APP_VERSION,
      commit: APP_COMMIT
    });
  });

  it("returns a demo simulation preview", async () => {
    const app = await createTestApp();

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
    const app = await createTestApp();

    const responses = await Promise.all(
      [
        { seed: "missing-race-shape" },
        { ...DEMO_RACE_INPUT, primaryTrait: "magic" },
        { ...DEMO_RACE_INPUT, forecast: { dry: 0, light_rain: -1, heavy_rain: 0 } },
        { ...DEMO_RACE_INPUT, participants: [{ ...DEMO_RACE_INPUT.participants[0], decision: { approach: "wild", preparation: "speed" } }] }
      ].map((payload) =>
        app.inject({
          method: "POST",
          url: "/simulation/preview",
          payload
        })
      )
    );

    await app.close();

    expect(responses.map((response) => response.statusCode)).toEqual([400, 400, 400, 400]);
  });

  it("accepts a valid custom simulation preview input", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/simulation/preview",
      payload: DEMO_RACE_INPUT
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json().classification).toEqual(expect.any(Array));
  });
});
