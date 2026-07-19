import { describe, expect, it } from "vitest";
import { normalizeEmail } from "./utils.js";

describe("normalizeEmail", () => {
  it("normalizes simple email addresses", () => {
    expect(normalizeEmail(" Pilot@Example.Test ")).toBe("pilot@example.test");
  });

  it("rejects malformed email addresses without regex backtracking", () => {
    expect(normalizeEmail("pilot")).toBe("");
    expect(normalizeEmail("pilot@@example.test")).toBe("");
    expect(normalizeEmail("pilot@example")).toBe("");
    expect(normalizeEmail("pilot@example..test")).toBe("");
    expect(normalizeEmail(`${"a".repeat(255)}@example.test`)).toBe("");
  });
});
