import { describe, expect, it } from "vitest";
import { angleDelta, driftAngle, poseOnRoute } from "./CircuitMap.js";

describe("CircuitMap route posing", () => {
  it("smooths heading through sharp route corners", () => {
    const route = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 0, y: 0 }
    ];

    const angles = [0.22, 0.24, 0.25, 0.26, 0.28].map((progress) => poseOnRoute(route, progress).angle);
    const jumps = angles.slice(1).map((angle, index) => Math.abs(angleDelta(angles[index]!, angle)));

    expect(Math.max(...jumps)).toBeLessThan(70);
    expect(Math.abs(driftAngle(route, 0.25))).toBeLessThanOrEqual(14);
  });
});
