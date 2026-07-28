import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BoardIcon, VISUAL_ICON_ASSETS, VisualIcon } from "./VisualIcon.js";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public");
// RIFF container magic plus the WEBP fourcc at offset 8.
const riffMagic = [0x52, 0x49, 0x46, 0x46];
const webpFourCC = [0x57, 0x45, 0x42, 0x50];
const boardIconFiles = [
  "adjustable-wing",
  "admin-tools",
  "balanced-approach",
  "battery-harvest",
  "brake-risk",
  "boost",
  "car-skin",
  "card-info",
  "championship",
  "changelog",
  "chrono",
  "circuits",
  "clean-air",
  "comeback-run",
  "cornering-balance",
  "connect-admin",
  "copy-error",
  "credits",
  "cleanup-test-data",
  "circuit-preview",
  "create-league",
  "damage-risk",
  "delete-danger",
  "delete-user",
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
  "inspect-league",
  "inventory",
  "join-league",
  "key-moment",
  "launch-boost",
  "launch-gp",
  "leaderboard-gain",
  "leaderboard-loss",
  "locked-plan",
  "morale-momentum",
  "mini-pack",
  "new-chrono",
  "empty-card-slot",
  "empty-inventory",
  "next-gp",
  "next-action",
  "next-lesson",
  "no-chrono",
  "no-circuit-match",
  "open-replay",
  "overcut",
  "overtaking",
  "plan-worked",
  "pit-relay",
  "pit-stop",
  "podium-result",
  "position-gain",
  "position-loss",
  "previous-action",
  "profile-menu",
  "prudent-approach",
  "qualifying-setup",
  "race-report",
  "rain-mapping",
  "rain-grip",
  "race-director",
  "reliability",
  "reliability-prep",
  "replay",
  "report",
  "reset-action",
  "reset-recovery",
  "review-chrono",
  "review-race",
  "rival-pressure",
  "safety-car",
  "sector-pace",
  "security-warning",
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
  "standard-pack",
  "stand-drive",
  "steward-warning",
  "strategy",
  "straight-line-power",
  "team-profile",
  "tire-wear",
  "tire-window",
  "traffic",
  "undercut",
  "urban-draft",
  "users-admin",
  "leagues-admin",
  "weather",
  "weather-prep",
  "speed-prep",
  "settings",
  "logout-profile",
];

describe("VisualIcon", () => {
  it("keeps generated board icons available as webp assets", () => {
    for (const iconName of boardIconFiles) {
      const icon = readFileSync(join(publicDir, "assets", "crl", "icons", `${iconName}.webp`));

      expect([...icon.subarray(0, 4)]).toEqual(riffMagic);
      expect([...icon.subarray(8, 12)]).toEqual(webpFourCC);
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

    expect(icon?.getAttribute("src")).toBe("/assets/crl/icons/chrono.webp");
    expect(icon?.classList.contains("command-board-icon")).toBe(true);
  });

  it("renders weather icons from the CRL asset set", () => {
    const { container } = render(<VisualIcon name="dry" />);

    expect(container.querySelector("img.visual-icon-dry")?.getAttribute("src")).toBe(VISUAL_ICON_ASSETS.dry);
  });
});
