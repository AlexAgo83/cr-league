import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";

const preview = {
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
      teamId: "circle",
      teamName: "Circle Works",
      points: 25,
      credits: 150,
      positionChange: 4,
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
      teamId: "circle",
      cardId: "rain_grip",
      severity: "major",
      positionDelta: 2,
      tags: ["card", "weather"],
      replayText: "Rain Grip triggers for Circle Works",
      reportText: "Circle Works called the rain correctly."
    }
  ],
  consumedCards: [{ teamId: "circle", cardId: "rain_grip" }],
  report: {
    headline: "Silver Ridge GP: Circle Works wins.",
    blocks: [{ title: "Key moments", body: "Circle Works called the rain correctly." }]
  }
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders the app name", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => preview
    } as Response);

    render(<App />);

    expect(screen.getByRole("heading", { name: "CR League" })).toBeTruthy();
    expect(await screen.findByText("Silver Ridge GP")).toBeTruthy();
    expect(screen.getByText(/Circle Works/)).toBeTruthy();
  });
});
