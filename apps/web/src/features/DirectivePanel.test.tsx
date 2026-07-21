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

    const warning = document.querySelector(".directive-lock-note") as HTMLElement;
    expect(warning).not.toBeNull();
    expect(warning.previousElementSibling?.className).toContain("plan-risk-summary");
    expect(warning.textContent).toContain("Rain Grip");
    expect(warning.querySelector("strong")?.textContent).toBe("will be consumed when this Grand Prix is launched.");
  });

  it("keeps the selected-card warning outside the card sub-screen", () => {
    render(<DirectivePanel {...baseProps} step="approach" setForm={vi.fn()} onSelectStep={vi.fn()} />);

    const warning = document.querySelector(".directive-selection-panel > .directive-lock-note") as HTMLElement;
    expect(warning).not.toBeNull();
    expect(warning.textContent).toContain("Rain Grip");
    expect(warning.previousElementSibling?.className).toContain("plan-risk-summary");
  });

  it("shows the locked plan note after the selected-card warning", () => {
    render(<DirectivePanel {...baseProps} locked step="approach" setForm={vi.fn()} onSelectStep={vi.fn()} />);

    const notes = [...document.querySelectorAll(".directive-selection-panel > .directive-lock-note")];
    expect(notes.map((note) => note.textContent)).toEqual([
      "Rain Grip will be consumed when this Grand Prix is launched.",
      "Plan lockedThis directive is sent for the current Grand Prix. Choices stay visible but cannot be changed."
    ]);
  });

  it("says the selected card is consumed after the Grand Prix has run", () => {
    render(<DirectivePanel {...baseProps} cardConsumed setForm={vi.fn()} onSelectStep={vi.fn()} />);

    const warning = document.querySelector(".directive-selection-panel > .directive-lock-note") as HTMLElement;
    expect(warning.textContent).toContain("Rain Grip");
    expect(warning.querySelector("strong")?.textContent).toBe("has been consumed for this Grand Prix.");
  });

  it("runs the provided primary command from the directive tab", () => {
    const action = vi.fn();
    const { rerender } = render(<DirectivePanel {...baseProps} primaryCommand={{ label: "Launch GP", action, disabled: false }} setForm={vi.fn()} onSelectStep={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(action).toHaveBeenCalledTimes(1);

    rerender(<DirectivePanel {...baseProps} primaryCommand={{ label: "Launch GP", action, disabled: true }} setForm={vi.fn()} onSelectStep={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Launch GP" })).toHaveProperty("disabled", true);
  });

  it("shows a chrono command beside the primary command when attempts remain", () => {
    const onQualifying = vi.fn();
    render(<DirectivePanel {...baseProps} qualifyingAttemptsLeft={1} onQualifying={onQualifying} setForm={vi.fn()} onSelectStep={vi.fn()} />);

    const chronoButton = screen.getByRole("button", { name: "New chrono" });
    expect(chronoButton.className).toContain("highlight-command");
    fireEvent.click(chronoButton);
    expect(onQualifying).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Launch GP" }).parentElement?.className).toContain("directive-command-row");
  });

  it("highlights the primary command after a chrono exists", () => {
    render(<DirectivePanel {...baseProps} qualifyingRunCount={1} qualifyingAttemptsLeft={1} onQualifying={vi.fn()} primaryCommand={{ label: "Send plan", action: vi.fn(), disabled: false }} setForm={vi.fn()} onSelectStep={vi.fn()} />);

    expect(screen.getByRole("button", { name: "New chrono" }).className).not.toContain("highlight-command");
    expect(screen.getByRole("button", { name: "Send plan" }).className).toContain("highlight-command");
  });
});
