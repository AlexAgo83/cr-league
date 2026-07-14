import { expect, test } from "@playwright/test";

const player = { teamId: "team_1", claimCode: "CLAIM123" };
let round = 1;
let cadence = "manual";
let currentStatus = "briefing";
let hasDecision = false;
let credits = 0;
let points = 0;
let cards: string[] = ["rain_grip"];

test.beforeEach(() => {
  round = 1;
  cadence = "manual";
  currentStatus = "briefing";
  hasDecision = false;
  credits = 0;
  points = 0;
  cards = ["rain_grip"];
});

test("plays a three Grand Prix private league loop", async ({ page }) => {
  await page.route("http://localhost:4874/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === "/leagues") {
      return route.fulfill({ json: leagueState() });
    }
    if (path === "/leagues/league_1/settings") {
      cadence = "weekly";
      return route.fulfill({ json: leagueState() });
    }
    if (path === "/leagues/league_1/decisions") {
      hasDecision = true;
      return route.fulfill({ json: leagueState() });
    }
    if (path === "/leagues/league_1/resolve") {
      currentStatus = "resolved";
      credits += 150;
      points += 25;
      cards = cards.filter((cardId) => cardId !== "rain_grip");
      return route.fulfill({ json: leagueState(resultForRound(round)) });
    }
    if (path === "/leagues/league_1/cards/buy") {
      credits -= 100;
      cards = [...cards, "launch_boost"];
      return route.fulfill({ json: leagueState(resultForRound(round)) });
    }
    if (path === "/leagues/league_1/next-grand-prix") {
      round += 1;
      currentStatus = "briefing";
      hasDecision = false;
      return route.fulfill({ json: leagueState() });
    }

    return route.fulfill({ status: 404, json: { message: "Unhandled mock route" } });
  });

  await page.goto("/");

  await page.getByRole("button", { name: "Create league" }).click();
  await expect(page.getByText("Code ABC123 · Round 1 · briefing")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current GP" })).toBeVisible();
  await expect(page.getByText("0 ready · 2 missing")).toBeVisible();

  await page.getByLabel("Cadence").selectOption("weekly");
  await page.getByRole("button", { name: "Update settings" }).click();
  await expect(page.getByText("League settings updated.")).toBeVisible();
  await expect(page.getByText("Cadence Weekly · Next action Wait for directives")).toBeVisible();

  for (const expectedRound of [1, 2, 3]) {
    await page.getByRole("button", { name: "Submit directive" }).click();
    await expect(page.getByText("Directive locked. You can launch the Grand Prix.")).toBeVisible();

    await page.getByRole("button", { name: "Launch GP" }).click();
    await expect(page.locator("p").filter({ hasText: `Silver Ridge GP ${expectedRound}: Circle One wins.` })).toBeVisible();
    await expect(page.getByText("Lap 5")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Garage" })).toBeVisible();
    await expect(page.getByText("Last GP")).toBeVisible();

    if (expectedRound < 3) {
      if (expectedRound === 1) {
        await page.getByRole("button", { name: /Launch Boost .*100/ }).click();
        await expect(page.getByText("Card added to your garage.")).toBeVisible();
      }
      await page.getByRole("button", { name: "Next GP" }).click();
      await expect(page.getByText(`Code ABC123 · Round ${expectedRound + 1} · briefing`)).toBeVisible();
    }
  }

  await expect(page.getByText("Round 3").first()).toBeVisible();
  await expect(page.getByText("Your team Circle One")).toBeVisible();
});

function leagueState(result: ReturnType<typeof resultForRound> | null = null) {
  return {
    league: {
      id: "league_1",
      name: "Office League",
      code: "ABC123",
      status: "active",
      cadence,
      preparationDeadlineAt: null
    },
    currentGrandPrix: {
      id: `gp_${round}`,
      name: "Silver Ridge GP",
      round,
      status: currentStatus,
      primaryTrait: "fast",
      secondaryTrait: "weather_sensitive",
      forecast: {
        dry: 60,
        light_rain: 30,
        heavy_rain: 10
      },
      result
    },
    grandPrixHistory: Array.from({ length: round }, (_, index) => {
      const historyRound = round - index;
      return {
        id: `gp_${historyRound}`,
        name: "Silver Ridge GP",
        round: historyRound,
        status: historyRound === round ? currentStatus : "resolved",
        result: historyRound === round ? result : resultForRound(historyRound)
      };
    }),
    teams: [
      {
        id: "team_1",
        name: "Circle One",
        kind: "human",
        points,
        credits,
        cards,
        ready: hasDecision
      },
      {
        id: "team_2",
        name: "Mika Blitz",
        kind: "bot",
        points: 0,
        credits: 0,
        cards: [],
        ready: false
      }
    ],
    cardShop: [
      { cardId: "rain_grip", price: 100 },
      { cardId: "launch_boost", price: 100 }
    ],
    actionState: {
      submittedTeamIds: hasDecision ? ["team_1"] : [],
      missingTeamIds: currentStatus === "resolved" ? [] : hasDecision ? ["team_2"] : ["team_1", "team_2"],
      canResolve: currentStatus !== "resolved" && hasDecision,
      canStartNextGrandPrix: currentStatus === "resolved",
      nextAction: currentStatus === "resolved" ? "start_next_grand_prix" : hasDecision ? "resolve_grand_prix" : "wait_for_directives"
    },
    player,
    decisions: hasDecision
      ? [
          {
            teamId: "team_1",
            approach: "balanced",
            preparation: "weather",
            cardId: "rain_grip",
            rivalTeamId: null
          }
        ]
      : []
  };
}

function resultForRound(resultRound: number) {
  return {
    grandPrixName: "Silver Ridge GP",
    seed: `silver-ridge-${resultRound}`,
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
        id: `evt_${resultRound}`,
        order: 0,
        segment: "mid",
        lap: 5,
        type: "weather_gamble_paid",
        teamId: "team_1",
        cardId: "rain_grip",
        severity: "major",
        positionDelta: 2,
        tags: ["card", "weather"],
        replayText: `Silver Ridge GP ${resultRound}: Circle One wins.`,
        reportText: "Circle One called the rain correctly."
      }
    ],
    consumedCards: [{ teamId: "team_1", cardId: "rain_grip" }],
    report: {
      headline: `Silver Ridge GP ${resultRound}: Circle One wins.`,
      blocks: [{ title: "Key moments", body: "Circle One called the rain correctly." }]
    }
  };
}
