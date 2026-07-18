import { expect, type Page, test } from "@playwright/test";

const player = { teamId: "team_1", claimCode: "CLAIM123" };
let round = 1;
let cadence = "manual";
let currentStatus = "briefing";
let hasDecision = false;
let credits = 0;
let points = 0;
let cards: string[] = ["rain_grip"];
let livery = { primary: "#16c784", secondary: "#38bdf8" };

test.beforeEach(() => {
  round = 1;
  cadence = "manual";
  currentStatus = "briefing";
  hasDecision = false;
  credits = 0;
  points = 0;
  cards = ["rain_grip"];
  livery = { primary: "#16c784", secondary: "#38bdf8" };
});

async function mockLeagueApi(page: Page) {
  await page.route("http://localhost:4874/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === "/profiles") {
      return route.fulfill({
        json: {
          profile: { id: "profile_1", email: "pilot@example.test" },
          recoveryCode: "ABCD1234",
          teams: []
        }
      });
    }
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
    if (path === "/leagues/league_1/teams/livery") {
      livery = (request.postDataJSON() as { livery: { primary: string; secondary: string } }).livery;
      return route.fulfill({ json: leagueState(currentStatus === "resolved" ? resultForRound(round) : null) });
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
      livery = { primary: "#16c784", secondary: "#38bdf8" };
      return route.fulfill({ json: leagueState() });
    }

    return route.fulfill({ status: 404, json: { message: "Unhandled mock route" } });
  });
}

test("plays a three Grand Prix private league loop", async ({ page }, testInfo) => {
  await mockLeagueApi(page);

  await page.goto("/");
  await createProfile(page);

  await createLeague(page);
  await expect(page.getByRole("button", { name: "Race", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Plan", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Championship", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Garage", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Result" })).toHaveCount(0);
  await page.getByRole("button", { name: "Championship", exact: true }).click();
  await expect(page.getByText("ABC123")).toBeVisible();
  await expect(page.getByText("Round 1").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current GP" })).toBeVisible();
  await expect(page.getByText("0/2")).toBeVisible();
  await expect(page.locator(".championship-grid")).toBeVisible();
  await expect(page.locator(".championship-view")).toHaveCSS("max-width", "860px");
  await expect
    .poll(async () => page.locator(".dashboard-summary").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(4);
  await expect(page.locator(".standings-table")).toContainText("Volt Union");
  await page.getByRole("tab", { name: "Grand Prix history" }).click();
  await expect(page.locator(".round-timeline")).toContainText("R1");
  await page.getByRole("tab", { name: "Standings" }).click();
  await expect(page.locator(".championship-settings-panel")).toHaveCount(0);
  await page.getByRole("button", { name: "Profile menu" }).click();
  await expect(page.getByRole("button", { name: "Manage league" })).toBeVisible();
  await expect(page.getByRole("button", { name: "League controls" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy profile code" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset UI preferences" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  const menuButtons = await page.locator(".profile-menu-panel button").evaluateAll((buttons) => buttons.map((button) => button.textContent?.trim()));
  expect(menuButtons).toEqual(["Manage league", "League controls", "Copy profile code", "Reset UI preferences", "Sign out"]);
  await expect(page.getByLabel("Language")).toBeVisible();
  await page.getByRole("button", { name: "Copy profile code" }).click();
  await expect(page.getByRole("dialog", { name: "Profile code" })).toBeVisible();
  await expect(page.getByLabel("Copy profile code")).toHaveValue("ABCD1234");
  await page.getByLabel("Copy profile code").click();
  await expect(page.getByText("Profile code copied: ABCD1234")).toBeVisible();
  await page.getByRole("dialog", { name: "Profile code" }).getByRole("button", { name: "Close", exact: true }).click();
  await hideReadmeNoise(page);
  await page.screenshot({ path: testInfo.outputPath("championship-layout-desktop.png"), fullPage: true });

  await expect(page.getByLabel("League summary").getByText("Wait for directives")).toBeVisible();

  for (const expectedRound of [1, 2, 3]) {
    await page.getByRole("button", { name: "Race", exact: true }).click();
    await page.getByRole("button", { name: "Lock plan" }).click();
    await page.getByRole("dialog", { name: "Lock race plan" }).getByRole("button", { name: "Lock plan" }).click();
    await expect(page.getByRole("button", { name: "Launch GP" })).toBeVisible();

    await page.getByRole("button", { name: "Launch GP" }).click();
    await expect(page.getByRole("dialog", { name: "Launch Grand Prix?" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Launch Grand Prix?" })).toContainText("Starting grid");
    await expect(page.getByRole("dialog", { name: "Launch Grand Prix?" })).toContainText("Grip");
    await expect(page.getByRole("dialog", { name: "Launch Grand Prix?" })).toContainText("Likely weather");
    await page.getByRole("dialog", { name: "Launch Grand Prix?" }).getByRole("button", { name: "Launch GP" }).click();
    await expect(page.getByRole("heading", { name: "Race replay" })).toBeVisible();
    await expect(page.locator(".replay-moments-panel")).toHaveCount(0);
    await expect(page.locator(".replay-marker").first()).toBeVisible();
    await page.getByRole("button", { name: "Back to circuit" }).click();
    await expect(page.getByRole("button", { name: "Next GP" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Report" })).toBeVisible();
    await page.getByRole("button", { name: "Report" }).click();
    await expect(page.getByRole("heading", { name: expectedCircuitTitle(expectedRound) })).toBeVisible();
    await expect(page.getByLabel("Race phases")).toBeVisible();
    await expect(page.locator(".report-blocks")).toHaveCount(0);
    await expect(page.locator(".report-content-column > .report-key-moments")).toBeVisible();
    await expect(page.locator(".report-content-column > .report-rewards")).toBeVisible();
    await expect(page.getByText(`${expectedCircuitTitle(expectedRound)}: Volt Union wins.`).first()).toBeVisible();

    if (expectedRound < 3) {
      await page.getByRole("button", { name: "Race", exact: true }).click();
      await page.getByRole("button", { name: "Next GP" }).click();
      await page.getByRole("dialog", { name: "Start the next race day?" }).getByRole("button", { name: "Next GP" }).click();
      await page.getByRole("button", { name: "Championship", exact: true }).click();
      await expect(page.getByText(`Round ${expectedRound + 1}`).first()).toBeVisible();
    }
  }

  await page.getByRole("button", { name: "Championship", exact: true }).click();
  await expect(page.getByText("Round 3").first()).toBeVisible();
});

test("keeps replay layout zones separated", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await mockLeagueApi(page);
  await page.goto("/");
  await createProfile(page);
  await createLeague(page);
  await page.getByRole("button", { name: "Garage", exact: true }).click();
  await page.getByRole("tab", { name: "My team" }).click();
  await page.getByLabel("Primary").fill("#c51697");
  await page.getByLabel("Secondary").fill("#633af8");
  await page.getByRole("button", { name: "Save colors" }).click();
  await expect(page.getByText("Car colors updated.")).toBeVisible();
  await page.getByRole("button", { name: "Race", exact: true }).click();

  const driveMap = page.locator(".drive-map-panel");
  await expect(driveMap).toHaveClass(/circuit-map/);
  await expect(driveMap).toHaveClass(/circuit-map-unframed/);
  await expect(driveMap).toHaveCSS("padding", "0px");
  await expect(driveMap).toHaveCSS("border-top-width", "0px");
  await expect(page.locator(".drive-map-panel .map-status")).toContainText("FR Paris");
  await expect(page.locator(".drive-map-panel .map-status")).toContainText("5 laps");
  await expect(page.locator(".drive-map-panel .map-traits-panel")).toContainText("Grip");
  await expect(page.locator(".drive-map-panel .map-traits-panel")).toContainText("64");
  await expect(page.locator(".drive-map-panel .map-workflow-panel")).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Read the circuit" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tune the race plan" })).toHaveCount(0);
  await hideReadmeNoise(page);
  await page.screenshot({ path: testInfo.outputPath("drive-layout-desktop.png"), fullPage: true });
  await expect
    .poll(async () =>
      page.locator(".drive-map-panel .map-workflow-panel").evaluate((element) => {
        const panel = element.getBoundingClientRect();
        const map = element.closest(".drive-map-panel")?.getBoundingClientRect();
        return map ? panel.width / map.width : 0;
      })
    )
    .toBeGreaterThan(0.95);

  await page.setViewportSize({ width: 390, height: 900 });
  await expect.poll(async () => page.locator(".drive-map-panel").evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(900);
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1)).toBe(true);
  await expect.poll(async () =>
    page.evaluate(() => {
      const header = document.querySelector(".topbar")?.getBoundingClientRect();
      const status = document.querySelector(".drive-map-panel .map-status")?.getBoundingClientRect();
      return Boolean(header && status && status.top >= header.bottom);
    })
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("drive-map-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.getByRole("button", { name: "Edit plan" }).click();
  await expect(page.getByRole("heading", { name: "Tune the race plan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approach: Balanced" })).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.locator(".directive-panel")).toBeVisible();
  await expect.poll(async () => page.locator(".directive-panel").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await hideReadmeNoise(page);
  await page.screenshot({ path: testInfo.outputPath("drive-layout-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.getByRole("button", { name: "Race", exact: true }).click();
  await page.getByRole("button", { name: "Lock plan" }).click();
  await page.getByRole("dialog", { name: "Lock race plan" }).getByRole("button", { name: "Lock plan" }).click();
  await page.getByRole("button", { name: "Launch GP" }).click();
  await page.getByRole("dialog", { name: "Launch Grand Prix?" }).getByRole("button", { name: "Launch GP" }).click();
  await expect(page.getByRole("heading", { name: "Race replay" })).toBeVisible();

  const mapPanel = page.locator(".replay-map-panel");
  const copyPanel = page.locator(".replay-copy-panel");
  const replayMap = mapPanel;

  await expect(mapPanel.locator(".circuit-map-stage")).toBeVisible();
  await expect(mapPanel.locator(".circuit-map-stage")).toHaveCSS("border-top-width", "1px");
  await expect(replayMap).toHaveClass(/circuit-map-unframed/);
  await expect(replayMap).toHaveCSS("padding", "0px");
  await expect(replayMap).toHaveCSS("border-top-width", "0px");
  await expect(mapPanel.locator(".map-status")).toContainText("FR Paris");
  await expect(mapPanel.locator(".map-status")).toContainText("Lap 1/5");
  await expect(mapPanel.locator(".map-weather-readout")).toContainText("Dry");
  await expect(mapPanel.locator(".map-status")).toContainText("Dry");
  await expect(mapPanel.locator(".map-traits-panel")).toContainText("64");
  await expect(mapPanel.locator(".map-traits-panel")).toContainText("58");
  await expect(mapPanel.locator(".map-car.player").first()).toHaveAttribute("style", /--car-primary: #c51697/);
  await expect(mapPanel.locator(".replay-map-controls").getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(mapPanel.locator(".replay-map-controls").getByRole("button", { name: "Restart" })).toBeVisible();
  const focusButton = mapPanel.locator(".replay-map-controls").getByRole("button", { name: "Focus driver" });
  await expect(focusButton).toHaveClass(/active/);
  await expect(mapPanel.locator(".map-car.player > g").first()).toHaveAttribute("transform", /scale\(0\.[0-9]+/);
  await expect.poll(async () => mapPanel.locator(".circuit-camera").getAttribute("transform")).not.toBeNull();
  await focusButton.click();
  await expect(focusButton).not.toHaveClass(/active/);
  const speedButton = mapPanel.locator(".replay-map-controls").getByRole("button", { name: "Speed ×1" });
  await expect(speedButton).toBeVisible();
  await speedButton.click();
  await expect(mapPanel.locator(".replay-speed-options")).toBeVisible();
  await expect
    .poll(async () =>
      mapPanel.evaluate(() => {
        const options = document.querySelector(".replay-speed-options");
        const traits = document.querySelector(".replay-map-panel .map-traits-panel");
        return options && traits ? Number(getComputedStyle(options).zIndex) > Number(getComputedStyle(traits).zIndex) : false;
      })
    )
    .toBe(true);
  await mapPanel.locator(".replay-speed-options").getByRole("option", { name: "×1" }).click();
  await expect(page.locator(".replay-moments-panel")).toHaveCount(0);
  await expect
    .poll(async () => mapPanel.evaluate((element) => element.getBoundingClientRect().width))
    .toBeCloseTo(await copyPanel.evaluate((element) => element.getBoundingClientRect().width), 0);
  await expect(mapPanel.locator(".replay-progress")).toBeVisible();
  await mapPanel.locator(".replay-marker").click();
  await expect(mapPanel.locator(".replay-moment-notification")).toContainText("Rain Grip");
  await expect(mapPanel.locator(".map-traits-panel")).toContainText("59");
  await expect(mapPanel.locator(".map-traits-panel")).toContainText("50");
  await expect(copyPanel.getByRole("button", { name: "Pause" })).toHaveCount(0);

  const desktop = await page.evaluate(() => {
    const mapPanel = document.querySelector(".replay-map-panel")?.getBoundingClientRect();
    const copyPanel = document.querySelector(".replay-copy-panel")?.getBoundingClientRect();
    return {
      mapBelowCopy: Boolean(mapPanel && copyPanel && mapPanel.top > copyPanel.bottom),
      noMomentsPanel: !document.querySelector(".replay-moments-panel"),
      mapSameWidthAsCopy: Boolean(mapPanel && copyPanel && Math.abs(mapPanel.width - copyPanel.width) < 2)
    };
  });
  expect(desktop).toEqual({ mapBelowCopy: true, noMomentsPanel: true, mapSameWidthAsCopy: true });
  await hideReadmeNoise(page);
  await page.screenshot({ path: testInfo.outputPath("replay-layout-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 900 });
  const mobile = await page.evaluate(() => {
    const mapPanel = document.querySelector(".replay-map-panel")?.getBoundingClientRect();
    const copyPanel = document.querySelector(".replay-copy-panel")?.getBoundingClientRect();
    return {
      mapBelowCopy: Boolean(mapPanel && copyPanel && mapPanel.top > copyPanel.bottom),
      noMomentsPanel: !document.querySelector(".replay-moments-panel"),
      noMapOverflow: Boolean(mapPanel && mapPanel.width <= document.documentElement.clientWidth),
      mapFillsMobileViewport: Boolean(mapPanel && mapPanel.height >= window.innerHeight),
      pageDoesNotScroll: document.documentElement.scrollHeight <= window.innerHeight + 1,
      topOverlaysBelowHeader: (() => {
        const header = document.querySelector(".topbar")?.getBoundingClientRect();
        const status = document.querySelector(".replay-map-panel .map-status")?.getBoundingClientRect();
        const controls = document.querySelector(".replay-map-controls")?.getBoundingClientRect();
        return Boolean(header && status && controls && status.top >= header.bottom && controls.top >= header.bottom);
      })(),
      statsAboveWeather: (() => {
        const traits = document.querySelector(".replay-map-panel .map-traits-panel");
        const weather = document.querySelector(".replay-weather");
        return traits && weather ? Number(getComputedStyle(traits).zIndex) > Number(getComputedStyle(weather).zIndex) : false;
      })()
    };
  });
  expect(mobile).toEqual({
    mapBelowCopy: false,
    noMomentsPanel: true,
    noMapOverflow: true,
    mapFillsMobileViewport: true,
    pageDoesNotScroll: true,
    topOverlaysBelowHeader: true,
    statsAboveWeather: true
  });
  await hideReadmeNoise(page);
  await page.screenshot({ path: testInfo.outputPath("replay-layout-mobile.png"), fullPage: true });
});

test("keeps mobile document pages on the app background", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await mockLeagueApi(page);
  await page.goto("/");
  await createProfile(page);
  await createLeague(page);

  await expectDocumentBackgroundToDiffer(page, 1, ".plan-view .panel");
  await expectDocumentBackgroundToDiffer(page, 2, ".championship-overview");
  await expect
    .poll(async () => page.locator(".dashboard-summary").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(1);
  await expectDocumentBackgroundToDiffer(page, 3, ".garage-grid .panel");
  await expect(page.locator(".garage-grid")).toHaveCSS("max-width", "860px");
  await expect(page.locator(".garage-grid > .panel")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Shop" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Inventory" }).click();
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Inventory" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "My team" }).click();
  await expect(page.getByRole("heading", { name: "My team" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "My team" })).toHaveAttribute("aria-selected", "true");
});

function expectedCircuitTitle(resultRound: number) {
  if (resultRound === 1) return "Paris Docklands Sprint";
  if (resultRound === 2) return "Paris Left Bank Loop";
  return "Amsterdam Canal Loop";
}

async function expectDocumentBackgroundToDiffer(page: Page, navIndex: number, panelSelector: string) {
  await page.locator(".game-nav button").nth(navIndex).click();
  await expect(page.locator(panelSelector).first()).toBeVisible();
  await expect
    .poll(async () =>
      page.locator(".game-shell").evaluate((shell, selector) => {
        const panel = document.querySelector(selector);
        return panel ? getComputedStyle(shell).backgroundColor !== getComputedStyle(panel).backgroundColor : false;
      }, panelSelector)
    )
    .toBe(true);
}

async function createProfile(page: Page) {
  await page.getByRole("button", { name: /Create profile/ }).click();
  await page.getByLabel("Email").fill("pilot@example.test");
  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByText("Profile created. Save this recovery code: ABCD1234")).toBeVisible();
  await expect(page.getByRole("button", { name: "Profile menu" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".profile-menu-panel")).toHaveCount(0);
  await expect(page.getByText("No saved leagues yet.")).toBeVisible();
  await expect(page.getByLabel("Language")).toHaveCount(0);
}

async function createLeague(page: Page) {
  await page.getByRole("button", { name: "Create league" }).click();
  await page.getByRole("button", { name: "Start league" }).click();
}

async function hideReadmeNoise(page: Page) {
  await page.addStyleTag({ content: ".notification-stack { display: none !important; }" });
}

function leagueState(result: ReturnType<typeof resultForRound> | null = null) {
  return {
    league: {
      id: "league_1",
      name: "Office League",
      code: "ABC123",
      status: "active",
      cadence,
      maxPlayers: 2,
      fillWithBots: true,
      qualifyingAttemptLimit: 3,
      maxGrandPrixPerSeason: 6,
      preparationDeadlineAt: null
    },
    currentGrandPrix: {
      id: `gp_${round}`,
      name: "Silver Ridge GP",
      season: 1,
      round,
      status: currentStatus,
      primaryTrait: "fast",
      secondaryTrait: "weather_sensitive",
      forecast: {
        dry: 60,
        light_rain: 30,
        heavy_rain: 10
      },
      qualifyingRuns: [],
      result
    },
    grandPrixHistory: Array.from({ length: round }, (_, index) => {
      const historyRound = round - index;
      return {
        id: `gp_${historyRound}`,
        name: "Silver Ridge GP",
        season: 1,
        round: historyRound,
        status: historyRound === round ? currentStatus : "resolved",
        result: historyRound === round ? result : resultForRound(historyRound)
      };
    }),
    teams: [
      {
        id: "team_1",
        name: "Volt Union",
        kind: "human",
        points,
        credits,
        cards,
        livery,
        ready: hasDecision
      },
      {
        id: "team_2",
        name: "Mika Blitz",
        kind: "bot",
        points: 0,
        credits: 0,
        cards: [],
        livery: { primary: "#38bdf8", secondary: "#16c784" },
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
        teamName: "Volt Union",
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
        replayText: `Silver Ridge GP ${resultRound}: Volt Union wins.`,
        reportText: "Volt Union called the rain correctly."
      }
    ],
    consumedCards: [{ teamId: "team_1", cardId: "rain_grip" }],
    report: {
      headline: `Silver Ridge GP ${resultRound}: Volt Union wins.`,
      blocks: [{ title: "Key moments", body: "Volt Union called the rain correctly." }]
    }
  };
}
