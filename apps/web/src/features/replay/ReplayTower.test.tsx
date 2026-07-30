import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { t, TranslationProvider } from "../../i18n/index.js";
import { ReplayTower } from "./ReplayTower.js";

describe("ReplayTower", () => {
  it("keeps the rank pill light for every livery", () => {
    const { container } = render(
      <TranslationProvider value={(key) => t(key, "en")}>
        <ReplayTower
          entries={[{ teamId: "team_2", teamName: "Coastal Apex", value: "+0.3s" }]}
          positionPops={{}}
          title="Final classification"
          reportLabel="View"
          teamLiveries={{ team_2: { primary: "#0f172a", secondary: "#111827" } }}
        />
      </TranslationProvider>
    );

    expect(container.querySelector(".replay-tower-rank")?.textContent).toBe("1");
  });

  it("switches replay focus from a classification badge", () => {
    const onTeamFocus = vi.fn();
    const { container } = render(
      <TranslationProvider value={(key) => t(key, "en")}>
      <ReplayTower
        entries={[{ teamId: "team_2", teamName: "Coastal Apex", value: "+0.3s" }]}
        playerTeamId="team_1"
        positionPops={{}}
        title="Final classification"
        reportLabel="View"
        teamLiveries={{}}
        focusedTeamId="team_1"
        focusLabel="Focus driver"
        onTeamFocus={onTeamFocus}
      />
      </TranslationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Focus driver: Coastal Apex" }));

    expect(onTeamFocus).toHaveBeenCalledWith("team_2");
    expect(container.querySelector("[data-team-id='team_2']")).not.toBeNull();
    expect(container.querySelector<HTMLImageElement>(".replay-tower-helmet img")?.getAttribute("src")).toBe("/assets/crl/helmet-token-primary.png");
  });
});
