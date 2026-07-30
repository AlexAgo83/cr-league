import { describe, expect, it } from "vitest";
import { canDrawConnector } from "./ReplayStageOverlay.js";

const badge = { left: 820, top: 90, width: 16, height: 16 };
const car = { left: 400, top: 300, width: 20, height: 20 };
const hiddenRow = { left: 0, top: 0, width: 0, height: 0 };

describe("connector visibility", () => {
  it("draws between a listed standing and its car", () => {
    expect(canDrawConnector({ badgeRect: badge, carRect: car })).toBe(true);
  });

  it("drops the connector when the tower is collapsed past that team's row", () => {
    expect(canDrawConnector({ badgeRect: hiddenRow, carRect: car })).toBe(false);
  });

  it("keeps the connector when the focus camera has pushed the car out of frame", () => {
    // The line leaving the stage is fine; dropping it left listed teams without one.
    expect(canDrawConnector({ badgeRect: badge, carRect: { left: 2400, top: -900, width: 40, height: 40 } })).toBe(true);
  });

  it("drops the connector when either end is missing", () => {
    expect(canDrawConnector({ badgeRect: badge })).toBe(false);
    expect(canDrawConnector({ carRect: car })).toBe(false);
  });
});
