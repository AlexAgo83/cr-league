import { describe, expect, it } from "vitest";
import { parseAppRoute, pathForAppRoute } from "./routes.js";

describe("app routes", () => {
  it("maps stable navigation paths to app state", () => {
    expect(parseAppRoute("/plan/chrono")).toEqual({ view: "plan", planSubscreen: "chrono", directiveStep: "approach", championshipTab: "standings", garagePanel: "inventory" });
    expect(parseAppRoute("/plan/pit")).toEqual({ view: "plan", planSubscreen: "plan", directiveStep: "pit", championshipTab: "standings", garagePanel: "inventory" });
    expect(parseAppRoute("/plan/card")).toEqual({ view: "plan", planSubscreen: "plan", directiveStep: "card", championshipTab: "standings", garagePanel: "inventory" });
    expect(parseAppRoute("/championship/circuits")).toEqual({ view: "championship", planSubscreen: "plan", directiveStep: "approach", championshipTab: "calendar", garagePanel: "inventory" });
    expect(parseAppRoute("/garage/shop")).toEqual({ view: "garage", planSubscreen: "plan", directiveStep: "approach", championshipTab: "standings", garagePanel: "shop" });
  });

  it("builds canonical paths from app state", () => {
    expect(pathForAppRoute({ view: "plan", planSubscreen: "chrono", directiveStep: "approach", championshipTab: "standings", garagePanel: "inventory" })).toBe("/plan/chrono");
    expect(pathForAppRoute({ view: "plan", planSubscreen: "plan", directiveStep: "preparation", championshipTab: "standings", garagePanel: "inventory" })).toBe("/plan/preparation");
    expect(pathForAppRoute({ view: "plan", planSubscreen: "plan", directiveStep: "pit", championshipTab: "standings", garagePanel: "inventory" })).toBe("/plan/pit");
    expect(pathForAppRoute({ view: "championship", planSubscreen: "plan", directiveStep: "approach", championshipTab: "calendar", garagePanel: "inventory" })).toBe("/championship/circuits");
    expect(pathForAppRoute({ view: "garage", planSubscreen: "plan", directiveStep: "approach", championshipTab: "standings", garagePanel: "team" })).toBe("/garage/team");
    expect(pathForAppRoute({ view: "drive", planSubscreen: "plan", directiveStep: "approach", championshipTab: "standings", garagePanel: "inventory" })).toBe("/drive");
  });
});
