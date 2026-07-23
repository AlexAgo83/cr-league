import { describe, expect, it } from "vitest";
import { CITY_CIRCUITS } from "../app/circuits.js";
import { carRenderGeometryForId } from "./carAssets.js";
import { __resetRouteGeometryStatsForTest, __routeGeometryBuildCountForTest, analyzeCircuitRoute, angleDelta, circuitRouteAnalysis, driftAngle, poseOnRoute, routeFitTransform } from "./CircuitMap.js";

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

  it("normalizes every car around its front axle without flattening model proportions", () => {
    const regular = carRenderGeometryForId("car-001");
    const reversedSource = carRenderGeometryForId("car-014");
    const longCar = carRenderGeometryForId("car-011");

    for (const geometry of [regular, reversedSource, longCar]) {
      expect(geometry.rearWheels.every(([x]) => x < 0)).toBe(true);
      expect(geometry.wheelbase).toBeGreaterThanOrEqual(18);
      expect(geometry.wheelbase).toBeLessThanOrEqual(22);
    }
    expect(longCar.bounds.width).not.toBeCloseTo(regular.bounds.width);
  });

  it("reuses route geometry for repeated poses on the same points array", () => {
    const route = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
      { x: 0, y: 0 }
    ];

    __resetRouteGeometryStatsForTest();
    for (const progress of [0, 0.1, 0.25, 0.5, 0.75, 0.9]) {
      poseOnRoute(route, progress);
      driftAngle(route, progress);
    }

    expect(__routeGeometryBuildCountForTest()).toBe(1);
  });

  it("projects canonical start and pit markers through the same route pose math", () => {
    const route = [
      { x: 0, y: 0 },
      { x: 300, y: 0 },
      { x: 300, y: 50 },
      { x: 0, y: 50 },
      { x: 0, y: 0 }
    ];

    const analysis = analyzeCircuitRoute(route, {
      startProgress: 264 / 700,
      pitLaneProgress: (((54 / 700 - 264 / 700) % 1) + 1) % 1
    });

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
      expect(circuit.mainStraightEndProgress, circuit.layoutKey).not.toBe(circuit.mainStraightStartProgress);
    }
  });

  it("fits the whole route layer inside the static map viewport", () => {
    const route = [
      { x: 100, y: 50 },
      { x: 900, y: 50 },
      { x: 900, y: 450 },
      { x: 100, y: 450 },
      { x: 100, y: 50 }
    ];
    const fit = routeFitTransform(route);
    const transformed = route.map((point) => ({
      x: point.x * fit.scale + fit.x,
      y: point.y * fit.scale + fit.y
    }));

    expect(Math.min(...transformed.map((point) => point.x))).toBeGreaterThanOrEqual(58);
    expect(Math.max(...transformed.map((point) => point.x))).toBeLessThanOrEqual(942);
    expect(Math.min(...transformed.map((point) => point.y))).toBeGreaterThanOrEqual(58);
    expect(Math.max(...transformed.map((point) => point.y))).toBeLessThanOrEqual(502);
    expect(fit.value).toContain("scale(");
  });
});
