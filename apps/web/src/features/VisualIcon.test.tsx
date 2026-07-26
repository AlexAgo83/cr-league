import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BoardIcon, VISUAL_ICON_ASSETS, VisualIcon } from "./VisualIcon.js";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public");
const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const boardIconFiles = [
  "adjustable-wing",
  "balanced-approach",
  "battery-harvest",
  "brake-risk",
  "boost",
  "car-skin",
  "card-info",
  "championship",
  "chrono",
  "circuits",
  "clean-air",
  "comeback-run",
  "cornering-balance",
  "credits",
  "damage-risk",
  "defensive-order",
  "dirty-air",
  "edit-plan",
  "energy",
  "engine-heat",
  "finish-flag-icon",
  "fleet-maintenance",
  "fleet-sponsorship",
  "fuel-delta",
  "garage",
  "gp-history",
  "grip",
  "hard-tires",
  "heavy-pack",
  "honors",
  "incident-review",
  "inventory",
  "launch-boost",
  "launch-gp",
  "leaderboard-gain",
  "leaderboard-loss",
  "locked-plan",
  "morale-momentum",
  "mini-pack",
  "new-chrono",
  "empty-card-slot",
  "next-gp",
  "open-replay",
  "overcut",
  "overtaking",
  "pit-relay",
  "pit-stop",
  "qualifying-setup",
  "race-report",
  "rain-mapping",
  "rain-grip",
  "race-director",
  "reliability",
  "replay",
  "report",
  "review-chrono",
  "review-race",
  "rival-pressure",
  "safety-car",
  "sector-pace",
  "send-plan",
  "setup-locked",
  "shop",
  "save-colors",
  "save-name",
  "sell-card",
  "speed",
  "soft-tires",
  "standings",
  "standings-board",
  "steward-warning",
  "strategy",
  "straight-line-power",
  "team-profile",
  "tire-wear",
  "tire-window",
  "traffic",
  "undercut",
  "urban-draft",
  "weather",
];

describe("VisualIcon", () => {
  it("keeps generated board icons available as png assets", () => {
    for (const iconName of boardIconFiles) {
      const icon = readFileSync(join(publicDir, "assets", "crl", "icons", `${iconName}.png`));

      expect([...icon.subarray(0, pngSignature.length)]).toEqual(pngSignature);
    }
  });

  it("renders mapped board icons as image assets", () => {
    const { container } = render(<VisualIcon name="grip" />);
    const icon = container.querySelector("img.visual-icon");

    expect(icon?.getAttribute("src")).toBe(VISUAL_ICON_ASSETS.grip);
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders standalone board icons from the CRL asset set", () => {
    const { container } = render(<BoardIcon name="chrono" className="command-board-icon" />);
    const icon = container.querySelector("img.board-icon");

    expect(icon?.getAttribute("src")).toBe("/assets/crl/icons/chrono.png");
    expect(icon?.classList.contains("command-board-icon")).toBe(true);
  });

  it("keeps unmapped icons as inline svg", () => {
    const { container } = render(<VisualIcon name="dry" />);

    expect(container.querySelector("svg.visual-icon-dry")).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
  });
});
