import { describe, expect, it } from "vitest";
import { centerInside } from "./ReplayStageOverlay.js";

const stage = { left: 100, top: 50, width: 800, height: 500 };

describe("connector visibility", () => {
  it("keeps a connector when the car sits on the stage", () => {
    expect(centerInside({ left: 400, top: 300, width: 20, height: 20 }, stage)).toBe(true);
  });

  it("drops a connector when the focus camera pushes the car off the stage", () => {
    // What the bug looked like: zoomed camera, car far past the top right corner.
    expect(centerInside({ left: 2400, top: -900, width: 40, height: 40 }, stage)).toBe(false);
    expect(centerInside({ left: -600, top: 300, width: 40, height: 40 }, stage)).toBe(false);
  });

  it("keeps a car straddling the edge as long as its center is on the stage", () => {
    expect(centerInside({ left: 880, top: 300, width: 40, height: 20 }, stage)).toBe(true);
    expect(centerInside({ left: 900, top: 300, width: 40, height: 20 }, stage)).toBe(false);
  });
});
