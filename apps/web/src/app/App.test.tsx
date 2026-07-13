import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";

const baseState = {
  league: {
    id: "league_1",
    name: "Office League",
    code: "ABC123",
    status: "active"
  },
  currentGrandPrix: {
    id: "gp_1",
    name: "Silver Ridge GP",
    round: 1,
    status: "briefing",
    result: null
  },
  teams: [
    {
      id: "team_1",
      name: "Circle One",
      kind: "human",
      points: 0,
      credits: 0
    },
    {
      id: "team_2",
      name: "Mika Blitz",
      kind: "bot",
      points: 0,
      credits: 0
    }
  ],
  decisions: []
};

const decidedState = {
  ...baseState,
  decisions: [
    {
      teamId: "team_1",
      approach: "balanced",
      preparation: "weather",
      cardId: "rain_grip",
      rivalTeamId: null
    }
  ]
};

const resolvedState = {
  ...decidedState,
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    status: "resolved",
    result: {
      grandPrixName: "Silver Ridge GP",
      seed: "silver-ridge-001",
      resolvedWeather: {
        start: "dry",
        early: "dry",
        mid: "light_rain",
        late: "light_rain",
        finish: "light_rain"
      },
      classification: [
        {
          position: 1,
          teamId: "team_1",
          teamName: "Circle One",
          points: 25,
          credits: 150,
          positionChange: 1,
          status: "finished",
          resultTags: ["weather_gamble"]
        }
      ],
      events: [
        {
          id: "evt_001",
          order: 0,
          segment: "mid",
          lap: 5,
          type: "weather_gamble_paid",
          teamId: "team_1",
          cardId: "rain_grip",
          severity: "major",
          positionDelta: 2,
          tags: ["card", "weather"],
          replayText: "Rain Grip triggers for Circle One",
          reportText: "Circle One called the rain correctly."
        }
      ],
      consumedCards: [{ teamId: "team_1", cardId: "rain_grip" }],
      report: {
        headline: "Silver Ridge GP: Circle One wins.",
        blocks: [{ title: "Key moments", body: "Circle One called the rain correctly." }]
      }
    }
  },
  teams: [
    {
      id: "team_1",
      name: "Circle One",
      kind: "human",
      points: 25,
      credits: 150
    }
  ]
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("plays through the demo league flow", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(baseState))
      .mockResolvedValueOnce(response(decidedState))
      .mockResolvedValueOnce(response(resolvedState));

    render(<App />);

    expect(screen.getByRole("heading", { name: "CR League" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Create league" }));
    expect(await screen.findByText("Code ABC123 · Round 1 · briefing")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Submit directive" }));
    expect(await screen.findByText("Directive locked. You can launch the Grand Prix.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(await screen.findByText("Silver Ridge GP: Circle One wins.")).toBeTruthy();
    expect(screen.getByText("Rain Grip triggers for Circle One")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submit directive" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Launch GP" }).hasAttribute("disabled")).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

function response(body: unknown) {
  return {
    ok: true,
    json: async () => body
  } as Response;
}
