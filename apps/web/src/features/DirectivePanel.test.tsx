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
  cardFitForCard: () => ({ level: "recommended" as const, reasonKey: "card_guidance_rain_match" as const, score: 90 }),
  cardLocked: false,
  disabled: false,
  locked: false,
  tt: (key: Parameters<typeof t>[0], params?: Parameters<typeof t>[2]) => t(key, "en", params)
};

describe("DirectivePanel", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("does not show selected-card consumption copy in the plan summary", () => {
    render(<DirectivePanel {...baseProps} setForm={vi.fn()} onSelectStep={vi.fn()} />);

    expect(document.querySelector(".directive-summary-stack > .directive-lock-note")).toBe(null);
    expect(document.querySelector(".directive-summary-stack")?.textContent).not.toContain("Rain Grip");
  });

  it("shows the locked plan badge on the risk summary", () => {
    render(<DirectivePanel {...baseProps} locked step="approach" setForm={vi.fn()} onSelectStep={vi.fn()} />);

    expect(document.querySelector(".directive-summary-stack > .directive-lock-note")).toBe(null);
    const badge = document.querySelector(".plan-risk-lock-badge");
    expect(badge?.textContent).toBe("Locked");
    expect(badge?.getAttribute("title")).toBe("Plan locked. This directive is sent for the current Grand Prix. Choices stay visible but cannot be changed.");
  });

  it("keeps explaining card consumption until the reminder is dismissed", () => {
    render(<DirectivePanel {...baseProps} selectedCardId="" setForm={vi.fn()} onSelectStep={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Card: Rain Grip" }));
    expect(screen.getByRole("dialog", { name: "Card committed" }).textContent).toContain("If it is used during the Grand Prix");
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));

    fireEvent.click(screen.getByRole("button", { name: "Card: Rain Grip" }));
    expect(screen.getByRole("dialog", { name: "Card committed" })).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Do not show this reminder again."));
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));

    fireEvent.click(screen.getByRole("button", { name: "Card: Rain Grip" }));
    expect(screen.queryByRole("dialog", { name: "Card committed" })).toBe(null);
  });

  it("ignores the old auto-dismissed card help preference", () => {
    localStorage.setItem("cr-league-card-consumption-help", "1");
    render(<DirectivePanel {...baseProps} selectedCardId="" setForm={vi.fn()} onSelectStep={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Card: Rain Grip" }));
    expect(screen.getByRole("dialog", { name: "Card committed" })).toBeTruthy();
  });

  it("runs the provided primary command from the directive tab", () => {
    const action = vi.fn();
    const { rerender } = render(<DirectivePanel {...baseProps} primaryCommand={{ label: "Launch GP", action, disabled: false }} setForm={vi.fn()} onSelectStep={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(action).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Launch GP" }).querySelector(".command-board-icon")?.getAttribute("src")).toBe("/assets/crl/icons/launch-gp.png");

    rerender(<DirectivePanel {...baseProps} primaryCommand={{ label: "Launch GP", action, disabled: true }} setForm={vi.fn()} onSelectStep={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Launch GP" })).toHaveProperty("disabled", true);
  });

  it("shows board icons on plan choices", () => {
    const { rerender } = render(<DirectivePanel {...baseProps} step="approach" setForm={vi.fn()} onSelectStep={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Approach: Balanced" }).querySelector(".plan-choice-board-icon")?.getAttribute("src")).toBe("/assets/crl/icons/balanced-approach.png");

    rerender(<DirectivePanel {...baseProps} step="preparation" setForm={vi.fn()} onSelectStep={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Tire prep: Weather" }).querySelector(".plan-choice-board-icon")?.getAttribute("src")).toBe("/assets/crl/icons/weather-prep.png");

    rerender(<DirectivePanel {...baseProps} step="pit" setForm={vi.fn()} onSelectStep={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Pit strategy: Standard swap" }).querySelector(".plan-choice-board-icon")?.getAttribute("src")).toBe("/assets/crl/icons/standard-pack.png");
  });

  it("shows card fit in the plan card cell and opens card info separately", () => {
    render(<DirectivePanel {...baseProps} selectedCardId="" setForm={vi.fn()} onSelectStep={vi.fn()} />);

    const cardButton = screen.getByRole("button", { name: "Card: Rain Grip" });
    expect(cardButton.textContent).toContain("Useful here");
    expect(cardButton.textContent).toContain("Rain or weather sensitivity can pay off this GP.");
    expect(cardButton.textContent).not.toContain("Pays off if rain appears around mid-race.");

    fireEvent.click(screen.getByRole("button", { name: "Rain Grip Info" }));
    const dialog = screen.getByRole("dialog", { name: "Rain Grip" });
    expect(dialog.textContent).toContain("Pays off if rain appears around mid-race.");
    expect(dialog.querySelector(".garage-buy-card .card-stat-badges")).toBeTruthy();
  });

  it("shows a chrono command beside the primary command when attempts remain", () => {
    const onQualifying = vi.fn();
    render(<DirectivePanel {...baseProps} qualifyingAttemptsLeft={1} onQualifying={onQualifying} setForm={vi.fn()} onSelectStep={vi.fn()} />);

    const chronoButton = screen.getByRole("button", { name: "New chrono" });
    expect(chronoButton.className).toContain("highlight-command");
    expect(chronoButton.querySelector(".command-board-icon")?.getAttribute("src")).toBe("/assets/crl/icons/new-chrono.png");
    fireEvent.click(chronoButton);
    expect(onQualifying).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Launch GP" }).parentElement?.className).toContain("directive-command-row");
  });

  it("highlights the primary command after a chrono exists", () => {
    render(<DirectivePanel {...baseProps} qualifyingRunCount={1} qualifyingAttemptsLeft={1} onQualifying={vi.fn()} primaryCommand={{ label: "Send plan", action: vi.fn(), disabled: false }} setForm={vi.fn()} onSelectStep={vi.fn()} />);

    expect(screen.getByRole("button", { name: "New chrono" }).className).not.toContain("highlight-command");
    expect(screen.getByRole("button", { name: "Send plan" }).className).toContain("highlight-command");
  });

  it("shows a non-blocking rival read when provided", () => {
    render(
      <DirectivePanel
        {...baseProps}
        planRecommendation={{ traitKey: "grip", weatherKey: "dry", trait: "Grip", weather: "Dry", traitAdvice: "", weatherAdvice: "" }}
        rival={{ teamId: "team_2", teamName: "Mika Blitz", position: 2, points: 15, pointsGap: 3 }}
        setForm={vi.fn()}
        onSelectStep={vi.fn()}
      />
    );

    expect(screen.getByText("Rival")).toBeTruthy();
    expect(screen.getByText("Mika Blitz is your closest standings target, 3 points away.")).toBeTruthy();
  });
});
