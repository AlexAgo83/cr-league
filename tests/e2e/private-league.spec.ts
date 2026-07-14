import { expect, type Page, test } from "@playwright/test";

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

async function mockLeagueApi(page: Page) {
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
    if (path === "/leagues/league_1/restart") {
      round = 1;
      currentStatus = "briefing";
      hasDecision = false;
      credits = 0;
      points = 0;
      cards = ["rain_grip"];
      return route.fulfill({ json: leagueState() });
    }

    return route.fulfill({ status: 404, json: { message: "Unhandled mock route" } });
  });
}

test("plays a three Grand Prix private league loop", async ({ page }) => {
  await mockLeagueApi(page);

  await page.goto("/");

  await page.getByRole("button", { name: "Create league" }).click();
  await expect(page.getByRole("button", { name: "Race", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Championship", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Garage", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Result" })).toBeDisabled();
  await page.getByRole("button", { name: "Championship", exact: true }).click();
  await expect(page.getByText("ABC123")).toBeVisible();
  await expect(page.getByText("Round 1").first()).toBeVisible();
  await expect(page.getByText("Current GP")).toBeVisible();
  await expect(page.getByText("0/2")).toBeVisible();

  await expect(page.getByLabel("League summary").getByText("Wait for directives")).toBeVisible();
  await page.getByRole("button", { name: "Race", exact: true }).click();

  for (const expectedRound of [1, 2, 3]) {
    await page.getByRole("button", { name: "Submit directive" }).click();
    await expect(page.getByRole("button", { name: "Launch GP" })).toBeVisible();

    await page.getByRole("button", { name: "Launch GP" }).click();
    await expect(page.getByRole("button", { name: "Result" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Next GP" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Race replay" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Report" })).toBeVisible();
    await expect(page.locator(".replay-timeline").getByText("L5")).toBeVisible();
    await page.getByRole("button", { name: "Report" }).click();
    await expect(page.getByRole("heading", { name: expectedCircuitTitle(expectedRound) })).toBeVisible();
    await expect(page.getByLabel("Race phases")).toBeVisible();
    await expect(page.locator(".report-blocks")).toHaveCount(0);
    await expect(page.locator(".report-content-column > .report-key-moments")).toBeVisible();
    await expect(page.locator(".report-content-column > .report-rewards")).toBeVisible();
    await expect(page.getByText(`${expectedCircuitTitle(expectedRound)}: Circle One wins.`).first()).toBeVisible();

    if (expectedRound < 3) {
      await page.getByRole("button", { name: "Race", exact: true }).click();
      await page.getByRole("button", { name: "Next GP" }).click();
      await page.getByRole("button", { name: "Championship", exact: true }).click();
      await expect(page.getByText(`Round ${expectedRound + 1}`).first()).toBeVisible();
      await page.getByRole("button", { name: "Race", exact: true }).click();
    }
  }

  await page.getByRole("button", { name: "Championship", exact: true }).click();
  await expect(page.getByText("Round 3").first()).toBeVisible();
});

test("keeps replay layout zones separated", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await mockLeagueApi(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Create league" }).click();
  await page.getByRole("button", { name: "Race", exact: true }).click();

  const driveMap = page.locator(".drive-map-panel");
  await expect(driveMap).toHaveClass(/circuit-map/);
  await expect(driveMap).toHaveClass(/circuit-map-unframed/);
  await expect(driveMap).toHaveCSS("padding", "0px");
  await expect(driveMap).toHaveCSS("border-top-width", "0px");
  await expect(page.locator(".drive-map-panel .map-status")).toContainText("🇫🇷 Paris");
  await expect(page.locator(".drive-map-panel .map-status")).toContainText("5 laps");
  await expect(page.locator(".drive-map-panel .map-traits-panel")).toContainText("Grip");
  await expect(page.locator(".drive-map-panel .map-traits-panel")).toContainText("64");
  await expect(page.locator(".drive-content-column > .race-context-panel")).toBeVisible();
  const directiveWidth = await page.locator(".directive-panel").evaluate((element) => element.getBoundingClientRect().width);
  await expect
    .poll(async () => page.locator(".drive-content-column > .race-context-panel").evaluate((element) => element.getBoundingClientRect().width))
    .toBeCloseTo(await driveMap.evaluate((element) => element.getBoundingClientRect().width), 0);

  await page.getByRole("button", { name: "Submit directive" }).click();
  await page.getByRole("button", { name: "Launch GP" }).click();
  await expect(page.getByRole("heading", { name: "Race replay" })).toBeVisible();

  const mapPanel = page.locator(".replay-map-panel");
  const copyPanel = page.locator(".replay-copy-panel");
  const momentsPanel = page.locator(".replay-moments-panel");
  const replayMap = mapPanel;

  await expect(mapPanel.locator(".circuit-map-stage")).toBeVisible();
  await expect(mapPanel.locator(".circuit-map-stage")).toHaveCSS("border-top-width", "1px");
  await expect(replayMap).toHaveClass(/circuit-map-unframed/);
  await expect(replayMap).toHaveCSS("padding", "0px");
  await expect(replayMap).toHaveCSS("border-top-width", "0px");
  await expect(mapPanel.locator(".map-status")).toContainText("🇫🇷 Paris");
  await expect(mapPanel.locator(".map-status")).toContainText("Lap 1/5");
  await expect(mapPanel.locator(".map-status")).toContainText("Dry");
  await expect(mapPanel.locator(".map-traits-panel")).toContainText("64");
  await expect(mapPanel.locator(".map-traits-panel")).toContainText("58");
  await expect(mapPanel.locator(".replay-map-controls").getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(mapPanel.locator(".replay-map-controls").getByRole("button", { name: "Restart" })).toBeVisible();
  await mapPanel.locator(".replay-map-controls").getByRole("button", { name: "Focus driver" }).click();
  await expect(mapPanel.locator(".replay-map-controls").getByRole("button", { name: "Focus driver" })).toHaveClass(/active/);
  await expect.poll(async () => mapPanel.locator(".circuit-camera").getAttribute("transform")).not.toBeNull();
  await expect(mapPanel.locator(".replay-map-controls").getByLabel("Speed")).toHaveValue("1");
  await expect
    .poll(async () => momentsPanel.evaluate((element) => element.getBoundingClientRect().width))
    .toBeCloseTo(directiveWidth, 0);
  await expect(mapPanel.locator(".replay-progress")).toBeVisible();
  await mapPanel.locator(".replay-marker").click();
  await expect(mapPanel.locator(".map-traits-panel")).toContainText("59");
  await expect(mapPanel.locator(".map-traits-panel")).toContainText("50");
  await expect(copyPanel.getByRole("button", { name: "Pause" })).toHaveCount(0);
  await expect(momentsPanel.getByRole("heading", { name: "Key moments" })).toBeVisible();

  const desktop = await page.evaluate(() => {
    const mapPanel = document.querySelector(".replay-map-panel")?.getBoundingClientRect();
    const copyPanel = document.querySelector(".replay-copy-panel")?.getBoundingClientRect();
    const momentsPanel = document.querySelector(".replay-moments-panel")?.getBoundingClientRect();
    return {
      mapBelowCopy: Boolean(mapPanel && copyPanel && mapPanel.top > copyPanel.bottom),
      momentsRightOfCopy: Boolean(copyPanel && momentsPanel && momentsPanel.left > copyPanel.right),
      momentsAlignedWithCopy: Boolean(copyPanel && momentsPanel && Math.abs(momentsPanel.top - copyPanel.top) < 2)
    };
  });
  expect(desktop).toEqual({ mapBelowCopy: true, momentsRightOfCopy: true, momentsAlignedWithCopy: true });
  await page.screenshot({ path: testInfo.outputPath("replay-layout-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 900 });
  const mobile = await page.evaluate(() => {
    const mapPanel = document.querySelector(".replay-map-panel")?.getBoundingClientRect();
    const copyPanel = document.querySelector(".replay-copy-panel")?.getBoundingClientRect();
    const momentsPanel = document.querySelector(".replay-moments-panel")?.getBoundingClientRect();
    return {
      mapBelowCopy: Boolean(mapPanel && copyPanel && mapPanel.top > copyPanel.bottom),
      momentsBelowMap: Boolean(mapPanel && momentsPanel && momentsPanel.top > mapPanel.bottom)
    };
  });
  expect(mobile).toEqual({ mapBelowCopy: true, momentsBelowMap: true });
  await page.screenshot({ path: testInfo.outputPath("replay-layout-mobile.png"), fullPage: true });
});

function expectedCircuitTitle(resultRound: number) {
  if (resultRound === 1) return "Paris Docklands Sprint";
  if (resultRound === 2) return "Paris Left Bank Loop";
  return "Amsterdam Canal Loop";
}

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
      },
      {
        position: 2,
        teamId: "team_2",
        teamName: "Mika Blitz",
        points: 18,
        credits: 100,
        positionChange: -1,
        status: "finished",
        resultTags: []
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
