import { describe, expect, it } from "vitest";
import { readApiConfig } from "./config.js";

describe("readApiConfig", () => {
  it("falls back to the default port when API_PORT is not numeric", () => {
    expect(readApiConfig({ API_PORT: "not-a-number" }).port).toBe(4874);
  });

  it("parses admin emails from environment configuration", () => {
    expect(readApiConfig({ ADMIN_EMAILS: " Owner@Example.test, ops@example.test " }).adminEmails).toEqual(["owner@example.test", "ops@example.test"]);
  });
});
