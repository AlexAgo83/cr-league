import { describe, expect, it } from "vitest";
import { CITY_CIRCUITS } from "../app/circuits.js";
import { analyzeCircuitRoute, angleDelta, circuitRouteAnalysis, driftAngle, poseOnRoute } from "./CircuitMap.js";

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

  it("places start near the end of the longest straight and pit near its beginning", () => {
    const route = [
      { x: 0, y: 0 },
      { x: 300, y: 0 },
      { x: 300, y: 50 },
      { x: 0, y: 50 },
      { x: 0, y: 0 }
    ];

    const analysis = analyzeCircuitRoute(route);

    expect(analysis.longestStraight.length).toBe(300);
    expect(analysis.pitStop.x).toBeCloseTo(54);
    expect(analysis.pitStop.y).toBeCloseTo(0);
    expect((analysis.startLine.x1 + analysis.startLine.x2) / 2).toBeCloseTo(264);
    expect((analysis.startLine.y1 + analysis.startLine.y2) / 2).toBeCloseTo(0);
    expect(poseOnRoute(route, analysis.startProgress).x).toBeCloseTo(264);
  });

  it("finds usable staging markers for every catalog circuit", () => {
    for (const circuit of CITY_CIRCUITS) {
      const analysis = circuitRouteAnalysis(circuit);
      const values = [analysis.startLine.x1, analysis.startLine.y1, analysis.startLine.x2, analysis.startLine.y2, analysis.pitStop.x, analysis.pitStop.y];
      expect(values.every(Number.isFinite), circuit.layoutKey).toBe(true);
      expect(analysis.longestStraight.length, circuit.layoutKey).toBeGreaterThan(20);
    }
  });
});
