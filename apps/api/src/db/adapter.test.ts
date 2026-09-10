import { describe, expect, it } from "vitest";
import { createPgAdapter, schemaFromUrl } from "./adapter.js";

describe("schemaFromUrl", () => {
  it("reads the schema the URL names", () => {
    expect(schemaFromUrl("postgresql://u:p@localhost:5432/db?schema=cr_league")).toBe("cr_league");
  });

  it("returns undefined when the URL names none", () => {
    expect(schemaFromUrl("postgresql://u:p@localhost:5432/db")).toBeUndefined();
  });

  it("builds an adapter either way", () => {
    expect(createPgAdapter("postgresql://u:p@localhost:5432/db?schema=cr_league")).toBeDefined();
    expect(createPgAdapter("postgresql://u:p@localhost:5432/db")).toBeDefined();
  });
});
