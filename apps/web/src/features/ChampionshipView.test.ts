// @vitest-environment node

import { describe, expect, it } from "vitest";
import { CITY_CIRCUITS } from "../app/circuits.js";
import { COUNTRY_REGION } from "./ChampionshipView.js";

describe("ChampionshipView circuit regions", () => {
  it("maps every catalog country to a world region", () => {
    const missing = [...new Set(CITY_CIRCUITS.map((circuit) => circuit.country))].filter((country) => !COUNTRY_REGION[country]);

    expect(missing).toEqual([]);
  });

  it("places new Iceland and Morocco circuits in the expected regions", () => {
    expect(COUNTRY_REGION.IS).toBe("europe");
    expect(COUNTRY_REGION.MA).toBe("africa");
  });
});
