import { expect, type Page, test } from "@playwright/test";
import { APP_VERSION } from "../../packages/shared/src/index.js";
import { circuitForRound } from "../../apps/web/src/app/circuits.js";
import { t } from "../../apps/web/src/i18n/index.js";

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
  await expect(page.getByRole("main", { name: "CR League home" })).toBeVisible();
  await expect(page.locator(".home-splash-background")).toHaveCSS("object-fit", "contain");
  await expect(page.locator(".home-press-start")).toBeVisible();
  expect(
    await page.evaluate(() => ({
      noHorizontalScroll: document.documentElement.scrollWidth <= window.innerWidth + 1,
      splashBackground: getComputedStyle(document.querySelector(".home-splash")!).backgroundColor,
      backgroundFitsHeight: document.querySelector(".home-splash-background")?.getBoundingClientRect().height === window.innerHeight,
      crAnimated: getComputedStyle(document.querySelector(".home-splash-title-cr")!).animationName !== "none",
      leagueAnimated: getComputedStyle(document.querySelector(".home-splash-title-league")!).animationName !== "none"
    }))
  ).toEqual({ noHorizontalScroll: true, splashBackground: "rgb(0, 0, 0)", backgroundFitsHeight: true, crAnimated: true, leagueAnimated: true });
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.locator(".home-splash-background")).toHaveCSS("object-fit", "cover");
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await expect.poll(async () =>
    page.evaluate(() => {
      const header = document.querySelector(".home-splash .setup-topbar")?.getBoundingClientRect();
      const actions = document.querySelector(".home-splash .setup-topbar-actions")?.getBoundingClientRect();
      return Boolean(header && actions && header.left >= 0 && header.right <= window.innerWidth && actions.right <= window.innerWidth);
    })
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("home-splash-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createProfile(page);

  await createLeague(page);
  await expect(page.getByRole("button", { name: "Stand", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Plan", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Championship", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Garage", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Result" })).toHaveCount(0);
  await page.getByRole("button", { name: "Garage", exact: true }).click();
  await dismissOnboarding(page);
  await expect(page.getByText("ABC123")).toBeVisible();
  await page.getByRole("button", { name: "Championship", exact: true }).click();
  await expect(page.getByText("Round 1").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current GP" })).toBeVisible();
  await expect(page.getByText("0/2")).toBeVisible();
  await expect(page.locator(".championship-grid")).toBeVisible();
  await expect(page.locator(".championship-view")).toHaveCSS("max-width", "860px");
  await expect
    .poll(async () => page.locator(".dashboard-summary").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(3);
  await page.getByRole("tab", { name: "Standings" }).click();
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
  expect(menuButtons).toEqual(["Manage league", "League controls", "Copy profile code", "EN", "FR", "Reset UI preferences", "Sign out", `v${APP_VERSION}`]);
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
    await page.getByRole("button", { name: "Stand", exact: true }).click();
    await dismissOnboarding(page);
    await page.getByRole("button", { name: "Send plan" }).click();
    await page.getByRole("dialog", { name: "Send race plan" }).getByRole("button", { name: "Send plan" }).click();
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
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(page.locator(".replay-close-button .replay-close-label")).toBeHidden();
    await expect(page.locator(".replay-close-button .replay-close-mark")).toBeVisible();
    await page.getByRole("button", { name: "Back to stand" }).click();
    await page.setViewportSize({ width: 1440, height: 1000 });
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
      await page.getByRole("button", { name: "Stand", exact: true }).click();
      await page.getByRole("button", { name: "Next GP" }).click();
      await page.getByRole("dialog", { name: "Start the next race day?" }).getByRole("button", { name: "Next GP" }).click();
      await expect(page.getByRole("heading", { name: "1. Read the circuit" })).toBeVisible();
      await dismissOnboarding(page);
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
  await dismissOnboarding(page);
  await page.getByRole("tab", { name: "My team" }).click();
  await page.getByLabel("Primary").fill("#c51697");
  await page.getByLabel("Secondary").fill("#633af8");
  await page.getByRole("button", { name: "Save colors" }).click();
  await expect(page.getByText("Car colors updated.")).toBeVisible();
  await page.getByRole("button", { name: "Stand", exact: true }).click();

  const driveMap = page.locator(".drive-map-panel");
  await expect(driveMap).toHaveClass(/circuit-map/);
  await expect(driveMap).toHaveClass(/circuit-map-unframed/);
  await expect(driveMap).toHaveCSS("padding", "0px");
  await expect(driveMap).toHaveCSS("border-top-width", "0px");
  const currentCircuit = circuitForRound(1, "league_1", 1);
  await expect(page.locator(".drive-map-panel .map-status")).toContainText(currentCircuit.city);
  await expect(page.locator(".drive-map-panel .map-status .country-badge img")).toHaveAttribute("src", new RegExp(`/assets/flags/${currentCircuit.country.toLowerCase()}\\.svg$`));
  await expect(page.locator(".drive-map-panel .map-status")).toContainText(`${currentCircuit.laps} laps`);
  await expect(page.locator(".drive-map-panel .map-traits-panel")).toContainText("Grip");
  await expect(page.locator(".drive-map-panel .map-traits-panel")).toContainText(String(currentCircuit.traits.grip));
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

  await dismissOnboarding(page);
  await page.getByRole("button", { name: "Edit plan" }).click();
  await expect(page.getByRole("heading", { name: "Tune the race plan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approach: Balanced" })).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.locator(".directive-panel").first()).toBeVisible();
  await expect.poll(async () => page.locator(".directive-panel").first().evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await hideReadmeNoise(page);
  await page.screenshot({ path: testInfo.outputPath("drive-layout-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });

  await dismissOnboarding(page);
  await page.getByRole("button", { name: "Stand", exact: true }).click();
  await dismissOnboarding(page);
  await page.getByRole("button", { name: "Send plan" }).click();
  await page.getByRole("dialog", { name: "Send race plan" }).getByRole("button", { name: "Send plan" }).click();
  await page.getByRole("button", { name: "Launch GP" }).click();
  await page.setViewportSize({ width: 360, height: 720 });
  await expect(page.getByRole("dialog", { name: "Launch Grand Prix?" })).toBeVisible();
  const launchModalMobile = await page.evaluate(() => {
    const modal = document.querySelector(".launch-gp-modal");
    const row = document.querySelector(".launch-gp-modal .starting-grid-list li");
    const rect = modal?.getBoundingClientRect();
    return {
      bodyLocked: getComputedStyle(document.body).position === "fixed" && getComputedStyle(document.body).overflow === "hidden",
      modalWithinViewport: Boolean(rect && rect.left >= 0 && rect.right <= window.innerWidth && rect.top >= 0 && rect.bottom <= window.innerHeight),
      noHorizontalOverflow: Boolean(modal && modal.scrollWidth <= modal.clientWidth + 1),
      singleColumnGrid: row ? getComputedStyle(row).gridTemplateColumns.split(" ").length === 1 : false
    };
  });
  expect(launchModalMobile).toEqual({
    bodyLocked: true,
    modalWithinViewport: true,
    noHorizontalOverflow: true,
    singleColumnGrid: true
  });
  await page.screenshot({ path: testInfo.outputPath("launch-gp-modal-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
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
  const replayCircuit = circuitForRound(1, "league_1", 1);
  await expect(mapPanel.locator(".map-status")).toContainText(replayCircuit.city);
  await expect(mapPanel.locator(".map-status .country-badge img")).toHaveAttribute("src", new RegExp(`/assets/flags/${replayCircuit.country.toLowerCase()}\\.svg$`));
  await expect(mapPanel.locator(".map-status")).toContainText(`/${replayCircuit.laps}`);
  await expect(mapPanel.locator(".map-weather-readout")).toContainText("Dry");
  await expect(mapPanel.locator(".map-status")).toContainText("Dry");
  await expect(mapPanel.locator(".map-traits-panel")).toContainText(String(replayCircuit.traits.grip));
  await expect(mapPanel.locator(".map-traits-panel")).toContainText(String(replayCircuit.traits.energy));
  await expect(mapPanel.locator(".map-car.player").first()).toHaveAttribute("style", /--car-primary: #[0-9a-f]{6}; --car-secondary: #[0-9a-f]{6}/i);
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
  await mapPanel.locator(".replay-marker:not(.director)").click();
  await expect(mapPanel.locator(".replay-moment-notification")).toContainText("Rain Grip");
  await expect(mapPanel.locator(".map-traits-panel .map-trait-grip")).toContainText("Grip");
  await expect(mapPanel.locator(".map-traits-panel .map-trait-grip")).toContainText("+2");
  await expect(mapPanel.locator(".map-traits-panel")).toContainText("Attack");
  await expect(copyPanel.getByRole("button", { name: "Pause" })).toHaveCount(0);

  const desktop = await page.evaluate(() => {
    const mapPanel = document.querySelector(".replay-map-panel")?.getBoundingClientRect();
    const copyPanel = document.querySelector(".replay-copy-panel")?.getBoundingClientRect();
    return {
      noMomentsPanel: !document.querySelector(".replay-moments-panel"),
      mapSameWidthAsCopy: Boolean(mapPanel && copyPanel && Math.abs(mapPanel.width - copyPanel.width) < 2)
    };
  });
  expect(desktop).toEqual({ noMomentsPanel: true, mapSameWidthAsCopy: true });
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

test("keeps first-click commands animated and result shortcuts wired", async ({ page }) => {
  cards = [];
  await mockLeagueApi(page);
  await page.goto("/");
  await createProfile(page);
  await expect(page.locator(".saved-leagues-empty")).toContainText("No saved leagues yet.");
  await expect(page.locator(".saved-leagues-empty img, .saved-leagues-empty image")).toHaveCount(0);

  await createLeague(page);
  await page.getByRole("button", { name: "Garage", exact: true }).click();
  await dismissOnboarding(page);
  await expect(page.locator(".garage-empty-inventory")).toContainText("No cards in inventory.");
  await expect(page.locator(".garage-empty-inventory img, .garage-empty-inventory image")).toHaveCount(0);

  await page.getByRole("button", { name: "Stand", exact: true }).click();
  await dismissOnboarding(page);
  await expectAnimatedHighlight(page.getByRole("button", { name: "New chrono" }));
  await expect(page.getByRole("button", { name: "Edit plan" })).not.toHaveClass(/highlight-command/);
  await expect(page.getByRole("button", { name: "Send plan" })).not.toHaveClass(/highlight-command/);
  await page.getByRole("button", { name: "Edit plan" }).click();
  await expect(page.getByRole("heading", { name: "Tune the race plan" })).toBeVisible();
  await page.getByRole("button", { name: "Stand", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit plan" })).not.toHaveClass(/highlight-command/);
  await expect(page.getByRole("button", { name: "Send plan" })).not.toHaveClass(/highlight-command/);
  await page.getByRole("button", { name: "Send plan" }).click();
  await page.getByRole("dialog", { name: "Send race plan" }).getByRole("button", { name: "Send plan" }).click();
  await expectAnimatedHighlight(page.getByRole("button", { name: "Launch GP" }));
  await page.getByRole("button", { name: "Launch GP" }).click();
  await page.getByRole("dialog", { name: "Launch Grand Prix?" }).getByRole("button", { name: "Launch GP" }).click();

  await expect(page.getByRole("heading", { name: "Race replay" })).toBeVisible();
  await page.locator(".replay-report-button").click();
  await expect(page.getByRole("heading", { name: expectedCircuitTitle(1) })).toBeVisible();
  await page.locator(".report-replay-button").click();
  await expect(page.getByRole("heading", { name: "Race replay" })).toBeVisible();
  await expect(page.locator(".replay-close-button .replay-close-label")).toBeVisible();
  await expect(page.locator(".replay-close-button .replay-close-mark")).toBeHidden();
  await page.getByRole("button", { name: "Back to stand" }).click();
  await expectAnimatedHighlight(page.getByRole("button", { name: "Report" }));
  await page.getByRole("button", { name: "Report" }).click();
  await expect(page.getByRole("heading", { name: expectedCircuitTitle(1) })).toBeVisible();
  await page.getByRole("button", { name: "Back to circuit" }).click();
  await expect(page.getByRole("button", { name: "Report" })).not.toHaveClass(/highlight-command/);
  await expectAnimatedHighlight(page.getByRole("button", { name: "Next GP" }));
});

test("keeps mobile document pages usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await mockLeagueApi(page);
  await page.goto("/");
  await createProfile(page);
  await createLeague(page);

  await openDocumentPage(page, 2, ".championship-overview");
  await expect
    .poll(async () => page.locator(".dashboard-summary").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(1);
  await openDocumentPage(page, 3, ".garage-grid .panel");
  await expect(page.locator(".garage-grid")).toHaveCSS("max-width", "860px");
  await expect(page.locator(".garage-grid > .panel")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Inventory" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Shop" }).click();
  await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Shop" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "My team" }).click();
  await expect(page.getByRole("heading", { name: "My team" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "My team" })).toHaveAttribute("aria-selected", "true");
});

function expectedCircuitTitle(resultRound: number) {
  const circuit = circuitForRound(resultRound, "league_1", 1);
  return `${circuit.city} ${t(circuit.layoutKey, "en")}`;
}

async function openDocumentPage(page: Page, navIndex: number, panelSelector: string) {
  await page.locator(".game-nav button").nth(navIndex).click();
  await dismissOnboarding(page);
  await expect(page.locator(panelSelector).first()).toBeVisible();
}

async function expectAnimatedHighlight(locator: ReturnType<Page["getByRole"]>) {
  await expect(locator).toHaveClass(/highlight-command/);
  await expect(locator).toHaveCSS("animation-name", "highlight-command-pulse");
}

async function createProfile(page: Page) {
  await enterSplash(page);
  await page.getByRole("button", { name: /Create profile/ }).click();
  await page.getByLabel("Email").fill("pilot@example.test");
  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByText("Profile created. Save this recovery code: ABCD1234")).toBeVisible();
  await dismissOnboarding(page);
  await expect(page.getByRole("button", { name: "Profile menu" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".profile-menu-panel")).toHaveCount(0);
  await expect(page.getByText("No saved leagues yet.")).toBeVisible();
  await expect(page.getByLabel("Language")).toHaveCount(0);
}

async function enterSplash(page: Page) {
  const pressStart = page.getByRole("button", { name: "PRESS START" });
  if (await pressStart.isVisible({ timeout: 500 }).catch(() => false)) await pressStart.click();
}

async function createLeague(page: Page) {
  await page.getByRole("button", { name: "Create league" }).click();
  await suppressOnboarding(page);
  await page.getByRole("button", { name: "Start league" }).click();
  await expect(page.locator(".game-nav button")).toHaveCount(4);
  await dismissOnboarding(page);
}

async function dismissOnboarding(page: Page) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const overlay = page.locator(".modal-overlay").last();
    if (!(await overlay.isVisible({ timeout: 3000 }).catch(() => false))) break;

    const leagueIntro = overlay.getByRole("dialog", { name: "Welcome to the grid" });
    if (await leagueIntro.isVisible({ timeout: 3000 }).catch(() => false)) {
      const startRacing = leagueIntro.getByRole("button", { name: "Enter the grid" });
      for (let step = 0; step < 4 && !(await startRacing.isVisible({ timeout: 250 }).catch(() => false)); step += 1) {
        await leagueIntro.getByRole("button", { name: "Next" }).click();
      }
      await startRacing.click();
      await expect(leagueIntro).toBeHidden();
      continue;
    }

    const gotIt = overlay.getByRole("button", { name: "Got it" });
    if (await gotIt.isVisible({ timeout: 500 }).catch(() => false)) {
      await gotIt.click();
      continue;
    }

    break;
  }
  await expect(page.locator(".modal-overlay")).toHaveCount(0);
}

async function suppressOnboarding(page: Page) {
  await page.evaluate(() => {
    for (const key of ["cr-league-help-league-intro", "cr-league-help-race", "cr-league-help-plan", "cr-league-help-garage"]) {
      localStorage.setItem(key, "1");
      localStorage.setItem(`${key}:league_1`, "1");
    }
  });
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
