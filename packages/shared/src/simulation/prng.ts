type Prng = {
  next: () => number;
  pickWeighted: <T extends string>(weights: Record<T, number>) => T;
};

export function createPrng(seed: string): Prng {
  let state = hashSeed(seed);

  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  return {
    next,
    pickWeighted: (weights) => {
      const entries = Object.entries(weights) as Array<[keyof typeof weights, number]>;
      const total = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
      let cursor = next() * total;

      for (const [key, weight] of entries) {
        cursor -= Math.max(0, weight);
        if (cursor <= 0) {
          return key;
        }
      }

      return entries[entries.length - 1]?.[0] ?? (Object.keys(weights)[0] as keyof typeof weights);
    }
  };
}

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
