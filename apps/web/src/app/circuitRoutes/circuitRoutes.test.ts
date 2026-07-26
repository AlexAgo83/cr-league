import { describe, expect, it } from "vitest";
import { CITY_CIRCUIT_IDENTITIES } from "@cr-league/shared";
import { CIRCUIT_ROUTES } from "./data.js";

describe("circuit route catalogue", () => {
  it("has one loaded route for every shared circuit identity", () => {
    const missing = CITY_CIRCUIT_IDENTITIES.map((circuit) => circuit.layoutKey).filter((layoutKey) => !CIRCUIT_ROUTES[layoutKey]?.length);
    const extra = Object.keys(CIRCUIT_ROUTES).filter((layoutKey) => !CITY_CIRCUIT_IDENTITIES.some((circuit) => circuit.layoutKey === layoutKey));

    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
  });
});
