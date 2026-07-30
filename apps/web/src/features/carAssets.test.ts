import { CAR_ASSET_IDS } from "@cr-league/shared";
import { describe, expect, it } from "vitest";
import { carRenderGeometryForId } from "./carAssets.js";

describe("headlights", () => {
  it("dims the open-wheelers and leaves everything else at full beam", () => {
    for (const id of CAR_ASSET_IDS) {
      const formula = ["car-011", "car-012", "car-013"].includes(id);
      expect(carRenderGeometryForId(id).headlightBeam, id).toBe(formula ? 0.35 : 1);
    }
  });

  it("falls back to full beam for a car it does not know", () => {
    expect(carRenderGeometryForId("car-999").headlightBeam).toBe(1);
  });
});
