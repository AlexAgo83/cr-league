import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { t } from "../i18n/index.js";
import { CardStatBadges } from "./CardStatBadges.js";

const tt = (key: Parameters<typeof t>[0], params?: Parameters<typeof t>[2]) => t(key, "en", params);

describe("CardStatBadges", () => {
  afterEach(() => {
    cleanup();
  });

  it("exposes trait explanations on stat badges", () => {
    render(<CardStatBadges cardId="soft_tires" tt={tt} />);

    expect(screen.getByLabelText("+ Attack. Higher means aggressive and offensive plans gain more time.").getAttribute("title")).toBe("+ Attack. Higher means aggressive and offensive plans gain more time.");
    expect(screen.getByLabelText("- Endurance. Higher means the car holds up better late in the race.").getAttribute("tabIndex")).toBe("0");
  });
});
