import { describe, expect, it } from "vitest";
import { parseAppRoute, pathForAppRoute } from "./routes.js";

describe("app routes", () => {
  it("maps stable navigation paths to app state", () => {
    expect(parseAppRoute("/plan/chrono")).toEqual({ view: "plan", planSubscreen: "chrono", championshipTab: "standings" });
    expect(parseAppRoute("/championship/circuits")).toEqual({ view: "championship", planSubscreen: "plan", championshipTab: "calendar" });
    expect(parseAppRoute("/garage")).toEqual({ view: "garage", planSubscreen: "plan", championshipTab: "standings" });
  });

  it("builds canonical paths from app state", () => {
    expect(pathForAppRoute({ view: "plan", planSubscreen: "chrono", championshipTab: "standings" })).toBe("/plan/chrono");
    expect(pathForAppRoute({ view: "championship", planSubscreen: "plan", championshipTab: "calendar" })).toBe("/championship/circuits");
    expect(pathForAppRoute({ view: "drive", planSubscreen: "plan", championshipTab: "standings" })).toBe("/drive");
  });
});
