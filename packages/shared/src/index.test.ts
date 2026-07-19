// @vitest-environment node

import { describe, expect, it } from "vitest";
import packageJson from "../package.json" with { type: "json" };
import { APP_NAME, APP_VERSION } from "./index.js";

describe("shared metadata", () => {
  it("exports the app name", () => {
    expect(APP_NAME).toBe("CR League");
  });

  it("exports the package version", () => {
    expect(APP_VERSION).toBe(packageJson.version);
  });
});
