// @vitest-environment node

import { describe, expect, it } from "vitest";
import { APP_NAME } from "./index.js";

describe("shared metadata", () => {
  it("exports the app name", () => {
    expect(APP_NAME).toBe("CR League");
  });
});
