import { renderWithT } from "../testRender.js";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CardStatBadges } from "./CardStatBadges.js";


describe("CardStatBadges", () => {
  afterEach(() => {
    cleanup();
  });

  it("exposes trait explanations on stat badges", () => {
    renderWithT(<CardStatBadges cardId="soft_tires" />);

    expect(screen.getByLabelText("+ Attack. Higher means aggressive and offensive plans gain more time.").getAttribute("title")).toBe("+ Attack. Higher means aggressive and offensive plans gain more time.");
    expect(screen.getByLabelText("- Endurance. Higher means the car holds up better late in the race.").getAttribute("tabIndex")).toBe("0");
  });
});
