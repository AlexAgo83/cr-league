import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CardId } from "@cr-league/shared";
import { t } from "../i18n/index.js";
import type { FormState } from "../app/types.js";
import { DirectivePanel } from "./DirectivePanel.js";

const form: FormState = {
  leagueName: "",
  joinCode: "",
  teamName: "",
  maxPlayers: "",
  fillWithBots: true,
  qualifyingAttemptLimit: "",
  maxGrandPrixPerSeason: "",
  cadence: "manual",
  preparationDeadlineAt: "",
  approach: "balanced",
  preparation: "weather",
  pitStrategy: "standard",
  cardId: "rain_grip"
};

const baseProps = {
  form,
  ownedCardIds: ["rain_grip"] as CardId[],
  selectedCardId: "rain_grip" as const,
  selectedCardFit: null,
  step: "card" as const,
  circuitTraits: { grip: 70, overtaking: 55, energy: 62 },
  planRiskRead: {
    level: "safe" as const,
    strengthKey: "plan_risk_strength_grip" as const,
    failureKey: "plan_risk_failure_pace" as const,
    bandKey: "plan_risk_band_safe" as const
  },
  primaryCommand: { label: "Launch GP", action: vi.fn(), disabled: false },
  cardLocked: false,
  disabled: false,
  locked: false,
  tt: (key: Parameters<typeof t>[0], params?: Parameters<typeof t>[2]) => t(key, "en", params)
};

describe("DirectivePanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("warns that the selected card will be consumed when the GP launches", () => {
    render(<DirectivePanel {...baseProps} setForm={vi.fn()} onSelectStep={vi.fn()} />);

    expect(screen.getByText("Rain Grip will be consumed when this Grand Prix is launched.")).not.toBeNull();
  });

  it("runs the provided primary command from the directive tab", () => {
    const action = vi.fn();
    const { rerender } = render(<DirectivePanel {...baseProps} primaryCommand={{ label: "Launch GP", action, disabled: false }} setForm={vi.fn()} onSelectStep={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(action).toHaveBeenCalledTimes(1);

    rerender(<DirectivePanel {...baseProps} primaryCommand={{ label: "Launch GP", action, disabled: true }} setForm={vi.fn()} onSelectStep={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Launch GP" })).toHaveProperty("disabled", true);
  });
});
