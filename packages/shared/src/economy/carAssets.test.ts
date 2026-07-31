import { describe, expect, it } from "vitest";
import { CAR_ASSET_IDS, CAR_ASSET_PRICES, carAssetPrice, isCarAssetId } from "./carAssets.js";

describe("car asset economy", () => {
  it("prices the free, premium, F1, and rally groups", () => {
    expect(CAR_ASSET_IDS.map((id) => CAR_ASSET_PRICES[id])).toEqual([
      0, 0, 0, 0, 0, 0, 0,
      1_000, 1_000, 1_000,
      2_000, 2_000, 2_000,
      3_000, 3_000, 3_000
    ]);
  });

  it("prices a car by id, and only recognises ids it ships", () => {
    expect(carAssetPrice("car-011")).toBe(2_000);
    expect(carAssetPrice("car-001")).toBe(0);
    expect(isCarAssetId("car-016")).toBe(true);
    expect(isCarAssetId("car-017")).toBe(false);
    expect(isCarAssetId("")).toBe(false);
  });
});
