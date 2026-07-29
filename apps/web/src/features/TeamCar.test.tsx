// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_CAR_ASSET } from "./carAssets.js";
import { TeamCar } from "./TeamCar.js";

describe("TeamCar", () => {
  it("paints the skin the team wears", () => {
    const { container } = render(<TeamCar livery={{ primary: "#ff0000", secondary: "#00ff00", carAssetId: "car-004" }} />);
    const frame = container.querySelector(".garage-car-preview-frame") as HTMLElement;

    expect(container.querySelector("img")?.getAttribute("src")).toContain("car-004");
    expect(frame.style.getPropertyValue("--garage-car-stroke")).toBe("#ff0000");
  });

  it("falls back to the default car when the stored skin is unknown", () => {
    // A save can name a skin a later build no longer ships; an empty sprite would be worse.
    const { container } = render(<TeamCar livery={{ primary: "#ff0000", secondary: "#00ff00", carAssetId: "car-gone" }} />);

    expect(container.querySelector("img")?.getAttribute("src")).toBe(DEFAULT_CAR_ASSET.side);
  });
});
