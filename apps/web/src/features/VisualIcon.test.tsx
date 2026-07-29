import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BOARD_ICON_NAMES, BoardIcon, VISUAL_ICON_ASSETS, VisualIcon } from "./VisualIcon.js";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public");
// RIFF container magic plus the WEBP fourcc at offset 8.
const riffMagic = [0x52, 0x49, 0x46, 0x46];
const webpFourCC = [0x57, 0x45, 0x42, 0x50];
const boardIconFiles = BOARD_ICON_NAMES;

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
