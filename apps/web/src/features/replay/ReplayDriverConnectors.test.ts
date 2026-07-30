import { describe, expect, it } from "vitest";
import { canDrawConnector, centerInside } from "./ReplayStageOverlay.js";

const stage = { left: 100, top: 50, width: 800, height: 500 };
const badge = { left: 820, top: 90, width: 16, height: 16 };
const car = { left: 400, top: 300, width: 20, height: 20 };

describe("connector visibility", () => {
  it("draws between a listed team and a car on the stage", () => {
    expect(canDrawConnector({ badgeRect: badge, carRect: car }, stage)).toBe(true);
  });

  it("drops the connector when the tower is collapsed past that team's row", () => {
    // A row hidden with display: none measures 0x0 at the document origin, which used to draw a
    // line off to a corner of the map.
    expect(canDrawConnector({ badgeRect: { left: 0, top: 0, width: 0, height: 0 }, carRect: car }, stage)).toBe(false);
  });

  it("drops the connector when the focus camera pushes the car off the stage", () => {
    expect(canDrawConnector({ badgeRect: badge, carRect: { left: 2400, top: -900, width: 40, height: 40 } }, stage)).toBe(false);
  });

  it("drops the connector when either end is missing", () => {
    expect(canDrawConnector({ badgeRect: badge }, stage)).toBe(false);
    expect(canDrawConnector({ carRect: car }, stage)).toBe(false);
  });

  it("keeps a car straddling the stage edge as long as its center is on the stage", () => {
    expect(centerInside({ left: 880, top: 300, width: 40, height: 20 }, stage)).toBe(true);
    expect(centerInside({ left: 900, top: 300, width: 40, height: 20 }, stage)).toBe(false);
  });
});
