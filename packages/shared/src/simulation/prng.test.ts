// @vitest-environment node

import { describe, expect, it } from "vitest";
import { createPrng, pickWeightedWithNext } from "./prng.js";

describe("createPrng", () => {
  it("yields the same sequence for the same seed", () => {
    const first = createPrng("determinism-check");
    const second = createPrng("determinism-check");

    const firstSequence = Array.from({ length: 50 }, () => first.next());
    const secondSequence = Array.from({ length: 50 }, () => second.next());

    expect(firstSequence).toEqual(secondSequence);
  });

  it("stays within [0, 1)", () => {
    const prng = createPrng("range-check");

    for (let index = 0; index < 200; index += 1) {
      const value = prng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("diverges for different seeds", () => {
    const first = createPrng("seed-alpha");
    const second = createPrng("seed-beta");

    const firstSequence = Array.from({ length: 20 }, () => first.next());
    const secondSequence = Array.from({ length: 20 }, () => second.next());

    expect(firstSequence).not.toEqual(secondSequence);
  });

  describe("pickWeighted", () => {
    it("never picks an entry whose weight is zero", () => {
      const prng = createPrng("zero-weight");

      for (let index = 0; index < 500; index += 1) {
        expect(prng.pickWeighted({ never: 0, always: 1 })).toBe("always");
      }
    });

    it("skips a leading zero-weight entry when the cursor is exactly zero", () => {
      expect(pickWeightedWithNext({ never: 0, always: 1 }, () => 0)).toBe("always");
    });

    it("treats negative weights as zero", () => {
      const prng = createPrng("negative-weight");

      for (let index = 0; index < 500; index += 1) {
        expect(prng.pickWeighted({ negative: -10, positive: 5 })).toBe("positive");
      }
    });

    it("falls back to a valid key when all weights are zero", () => {
      const prng = createPrng("all-zero");

      for (let index = 0; index < 100; index += 1) {
        const picked = prng.pickWeighted({ first: 0, second: 0, third: 0 });
        expect(["first", "second", "third"]).toContain(picked);
      }
    });

    it("still consumes the generator and stays deterministic on the all-zero fallback", () => {
      const first = createPrng("all-zero-deterministic");
      const second = createPrng("all-zero-deterministic");

      const firstPicks = Array.from({ length: 20 }, () => first.pickWeighted({ a: 0, b: 0 }));
      const secondPicks = Array.from({ length: 20 }, () => second.pickWeighted({ a: 0, b: 0 }));

      expect(firstPicks).toEqual(secondPicks);
      expect(first.next()).toBe(second.next());
    });

    it("distributes picks across all positively weighted entries", () => {
      const prng = createPrng("distribution");
      const counts = { left: 0, right: 0 };

      for (let index = 0; index < 500; index += 1) {
        counts[prng.pickWeighted({ left: 1, right: 1 })] += 1;
      }

      expect(counts.left).toBeGreaterThan(0);
      expect(counts.right).toBeGreaterThan(0);
      expect(counts.left + counts.right).toBe(500);
    });

    it("is independent of weight key insertion order across seeds and sequential draws", () => {
      for (const seed of ["forecast-order-a", "forecast-order-b", "forecast-order-c", "forecast-order-d"]) {
        const first = createPrng(seed);
        const second = createPrng(seed);

        const firstPicks = Array.from({ length: 20 }, () => first.pickWeighted({ dry: 60, light_rain: 30, heavy_rain: 10 }));
        const secondPicks = Array.from({ length: 20 }, () => second.pickWeighted({ heavy_rain: 10, light_rain: 30, dry: 60 }));

        expect(firstPicks).toEqual(secondPicks);
        expect(first.next()).toBe(second.next());
      }
    });
  });
});
