import { describe, expect, it } from "vitest";
import { t } from "./index.js";

describe("i18n interpolation", () => {
  it("substitutes placeholders without changing legacy lookups", () => {
    expect(t("action_close")).toBe("Close");
    expect(t("recap_position_delta_gain", "en", { delta: 2 })).toBe("Gained 2 positions");
    expect(t("recap_position_delta_gain", "fr", { delta: 2 })).toBe("Gagne 2 positions");
  });

  it("leaves missing placeholders readable", () => {
    expect(t("recap_position_delta_gain")).toBe("Gained {delta} positions");
  });
});
