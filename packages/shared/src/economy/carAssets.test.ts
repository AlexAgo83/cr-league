import { describe, expect, it } from "vitest";
import { CAR_ASSET_IDS, CAR_ASSET_PRICES } from "./carAssets.js";

describe("car asset economy", () => {
  it("prices the free, premium, F1, and rally groups", () => {
    expect(CAR_ASSET_IDS.map((id) => CAR_ASSET_PRICES[id])).toEqual([
      0, 0, 0, 0, 0, 0, 0,
      1_000, 1_000, 1_000,
      2_000, 2_000, 2_000,
      3_000, 3_000, 3_000
    ]);
  });
});
