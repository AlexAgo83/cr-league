import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const stylesDir = dirname(fileURLToPath(import.meta.url));

describe("replay controls stacking", () => {
  it("keeps speed options above mobile chrono overlays", () => {
    const layout = readFileSync(join(stylesDir, "layout.css"), "utf8");
    const controlsZ = zIndexForRule(layout, ".replay-map-controls");
    const speedMenuZ = zIndexForRule(layout, ".replay-speed-menu");
    const speedOptionsZ = zIndexForRule(layout, ".replay-speed-options");
    const responsive = readFileSync(join(stylesDir, "responsive.css"), "utf8");
    const mobileChronosZ = zIndexForRule(responsive, ".map-screen .replay-map-panel .replay-qualifying-times");

    expect(controlsZ).toBeGreaterThan(mobileChronosZ);
    expect(speedMenuZ).toBeGreaterThan(controlsZ);
    expect(speedOptionsZ).toBeGreaterThan(speedMenuZ);
  });
});

function zIndexForRule(css: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escapedSelector}\\s*\\{[\\s\\S]*?z-index:\\s*(\\d+)`).exec(css);
  if (!match) throw new Error(`Missing z-index for ${selector}`);
  return Number(match[1]);
}
