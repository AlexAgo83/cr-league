import { describe, expect, it } from "vitest";
import { readApiConfig } from "./config.js";

describe("readApiConfig", () => {
  it("falls back to the default port when API_PORT is not numeric", () => {
    expect(readApiConfig({ API_PORT: "not-a-number" }).port).toBe(4874);
  });
});
