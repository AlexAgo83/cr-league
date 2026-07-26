import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, expect, type Browser, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import axe from "axe-core";
import { type CardId, type LeagueState, type RaceDecision, type RaceResult } from "../packages/shared/src/index.js";
import { createProfile } from "../apps/api/src/features/leagues/store.js";
import { frustrationScore, funScore, multiplayerDecisionFor, multiplayerNextBuyFor, playtestProfiles, type PlaytestProfile } from "./playtestBrain.js";

loadEnv({ path: new URL("../.env", import.meta.url) });

const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:4874";
const webBaseUrl = process.env.WEB_BASE_URL ?? "http://127.0.0.1:4873";
const rounds = numberArg("--rounds", 2);
const profile = playtestProfiles.find((candidate) => candidate.name === stringArg("--profile", "sprinter")) ?? playtestProfiles[0]!;
const reportPath = stringArg("--report", `reports/playtest/${new Date().toISOString().slice(0, 10)}-browser-playtest.md`);
const screenshotDir = stringArg("--screenshots", "reports/playtest/browser-failures");
const uxReportPath = stringArg("--ux-report", "");
const uxAssetsDir = stringArg("--ux-assets", "reports/ux/browser-playthrough");
const coldStartReportPath = stringArg("--cold-start-report", "");

type ManagedServer = {
  name: string;
  child: ChildProcess;
  logs: string[];
};

type RoundReport = {
  round: number;
  decision: RaceDecision;
  winner: string;
  playerPosition: number;
  fun: number;
  frustration: number;
  comprehension: number;
  bought?: CardId;
};

type UxCapture = {
  step: number;
  label: string;
  note: string;
  desktop: string;
  mobile: string;
  bodyOverflow: boolean;
  smallTapTargets: number;
  axeViolations: Array<{ id: string; impact?: string | null; nodes: number; help: string }>;
};

type FrictionTask = {
  name: string;
  actions: number;
  hesitations: string[];
};

type ComprehensionCheck = {
  round?: number;
  step: string;
  passed: boolean;
  note: string;
};

const servers: ManagedServer[] = [];
const consoleErrors: string[] = [];
const consoleWarnings: string[] = [];
const uxCaptures: UxCapture[] = [];
const frictionTasks = new Map<string, FrictionTask>();
const comprehensionChecks: ComprehensionCheck[] = [];
let browser: Browser | undefined;
let page: Page | undefined;

const approachLabels: Record<NonNullable<RaceDecision["approach"]>, string> = {
  aggressive: "Aggressive",
  balanced: "Balanced",
  prudent: "Prudent"
};

const preparationLabels: Record<NonNullable<RaceDecision["preparation"]>, string> = {
  reliability: "Reliability",
  speed: "Speed",
  weather: "Weather"
};

const pitLabels: Record<NonNullable<RaceDecision["pitStrategy"]>, string> = {
  heavy_pack: "Heavy pack",
  mini_pack: "Mini pack",
  standard: "Standard swap"
};

const cardLabels: Record<CardId, string> = {
  adjustable_wing: "Adjustable Wing",
  calculated_attack: "Calculated Attack",
  defensive_order: "Defensive Order",
  economy_mode: "Economy Mode",
  final_surge: "Final Surge",
  fleet_maintenance: "Fleet Maintenance",
  fleet_sponsorship: "Fleet Sponsorship",
  hard_tires: "Hard Tires",
  launch_boost: "Launch Boost",
  pit_relay: "Pit Relay",
  qualifying_focus: "Qualifying Lap",
  rain_grip: "Rain Grip",
  rain_mapping: "Rain Mapping",
  soft_tires: "Soft Tires",
  urban_draft: "Urban Draft"
};

if (coldStartReportPath) {
  await runColdStart();
  process.exit(0);
}

try {
  await startServers();
  const seededProfile = await seedProfile();
  browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: webBaseUrl, viewport: { width: 1440, height: 1000 } });
  await context.addInitScript((session) => {
    if (!sessionStorage.getItem("cr-league-browser-playtest-ready")) {
      localStorage.clear();
      localStorage.setItem("cr-league-help-profile-code", "1");
      localStorage.setItem("cr-league-profile-session", JSON.stringify(session));
      localStorage.setItem("cr-league-profile-email", session.profile.email);
      sessionStorage.setItem("cr-league-browser-playtest-ready", "1");
    }
  }, seededProfile.session);
  if (uxReportPath) await context.addInitScript({ content: axe.source });
  page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
    if (message.type() === "warning") consoleWarnings.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  let state = await recoverAndCreateLeague(page);
  await observeComprehension(page, "league-created", "The Plan affordance is visible after league creation.", [() => page!.getByRole("button", { name: "Plan", exact: true })]);
  await captureUx(page, "league-created", `League ${state.league.name} is open on the race desk.`);
  const reports: RoundReport[] = [];

  for (let round = 1; round <= rounds; round += 1) {
    const decision = await choosePlan(page, state, profile, round);
    await observeComprehension(page, `round-${round}-plan`, "The chosen plan can be sent from the Plan view.", [() => page!.getByRole("button", { name: "Send plan" })], round);
    await captureUx(page, `round-${round}-plan`, `Selected ${decision.approach}/${decision.preparation}/${decision.pitStrategy ?? "standard"} with ${decision.cardId ?? "no card"}.`);
    state = await submitPlan(page, state, round);
    await observeComprehension(page, `round-${round}-ready`, "The next action after sending a plan is visible.", [() => page!.getByRole("button", { name: "Launch GP" })], round);
    await captureUx(page, `round-${round}-ready`, "Plan submitted; launch affordance is visible.");
    state = await launchGrandPrix(page, state, round);
    await observeComprehension(page, `round-${round}-replay`, "The replay result screen exposes race replay and return controls.", [() => page!.getByRole("heading", { name: "Race replay" }), () => page!.getByRole("button", { name: "Back to stand" })], round);
    await captureUx(page, `round-${round}-replay`, "Race replay is visible after launching the Grand Prix.");
    const result = state.currentGrandPrix.result as RaceResult;
    const playerTeamId = state.player?.teamId;
    const playerEntry = result.classification.find((entry) => entry.teamId === playerTeamId);
    if (!playerEntry || !playerTeamId) throw new Error(`Round ${round} did not include the browser player in classification.`);

    const roundReport: RoundReport = {
      round,
      decision,
      winner: result.classification[0]?.teamName ?? "Unknown",
      playerPosition: playerEntry.position,
      fun: funScore(playerEntry.position, result, playerTeamId),
      frustration: frustrationScore(playerEntry.position, result, playerTeamId),
      comprehension: comprehensionScore(round)
    };
    reports.push(roundReport);

    await page.getByRole("button", { name: "Back to stand" }).click();
    if (round < rounds) {
      const bought = await buyAfterRace(page, state, profile, round);
      if (bought.state) state = bought.state;
      roundReport.bought = bought.cardId;
      await observeComprehension(page, `round-${round}-garage`, "The Garage purchase flow reached a visible Garage or shop state.", [() => page!.getByText(/Card added to your garage|Shop|Garage/)]);
      await captureUx(page, `round-${round}-garage`, bought.cardId ? `Bought ${bought.cardId} from Garage.` : "Garage opened; no affordable recommended card bought.");
      state = await nextGrandPrix(page);
      await observeComprehension(page, `round-${round}-next-gp`, "The championship moved to the next GP.", [() => page!.getByRole("button", { name: "Plan", exact: true })]);
      await captureUx(page, `round-${round}-next-gp`, `Advanced to GP ${state.currentGrandPrix.round}.`);
    }
  }

  await page.getByRole("button", { name: "Championship", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Current GP" })).toBeVisible();
  await captureUx(page, "championship-return", "Returned to Championship after the browser playthrough.");
  await browser.close();
  browser = undefined;
  await writeReport({ reports, consoleErrors, failed: false });
  if (uxReportPath) await writeUxReport({ reports, failed: false });
  console.log(`Browser playtest: ${profile.name} x ${rounds} GP`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  const screenshot = page ? await captureFailure(page) : undefined;
  await writeReport({ reports: [], consoleErrors, failed: true, error, screenshot });
  if (uxReportPath) await writeUxReport({ reports: [], failed: true, error, screenshot });
  throw error;
} finally {
  await browser?.close();
  for (const server of servers.reverse()) server.child.kill("SIGTERM");
}

async function runColdStart() {
  const funnel: Array<{ goal: string; reached: boolean; note: string }> = [];
  let coldBrowser: Browser | undefined;
  let coldPage: Page | undefined;
  let failure: unknown;
  try {
    await startServers();
    const seededProfile = await seedProfile();
    coldBrowser = await chromium.launch();
    const context = await coldBrowser.newContext({ baseURL: webBaseUrl, viewport: { width: 390, height: 900 } });
    await context.addInitScript((session) => {
      localStorage.clear();
      localStorage.setItem("cr-league-help-profile-code", "1");
      localStorage.setItem("cr-league-profile-session", JSON.stringify(session));
      localStorage.setItem("cr-league-profile-email", session.profile.email);
    }, seededProfile.session);
    coldPage = await context.newPage();

    await coldStep(funnel, "enter app", "Visible PRESS START opened the setup flow.", async () => {
      await coldPage!.goto("/");
      await coldPage!.getByRole("button", { name: "PRESS START" }).click();
      await expect(coldPage!.getByRole("button", { name: /Create league/ })).toBeVisible();
    });
    await coldStep(funnel, "create league", "Visible Create league/Start league controls created a league.", async () => {
      await coldPage!.getByRole("button", { name: /Create league/ }).click();
      await coldPage!.getByRole("textbox", { name: "League" }).fill(`Naive UX ${Date.now()}`);
      await coldPage!.getByRole("textbox", { name: "Team" }).fill("Naive Team");
      await coldPage!.getByLabel("GP per season").fill("2");
      await coldPage!.getByRole("button", { name: "Start league" }).click();
      await dismissBlockingModals(coldPage!);
      await expect(coldPage!.getByRole("button", { name: "Plan", exact: true })).toBeVisible();
    });
    await coldStep(funnel, "reach first decision", "Visible Plan and Send plan controls were enough to lock the default plan.", async () => {
      await coldPage!.getByRole("button", { name: "Plan", exact: true }).click();
      await dismissBlockingModals(coldPage!);
      await coldPage!.getByRole("button", { name: "Send plan" }).click();
      await coldPage!.getByRole("dialog", { name: "Send race plan" }).getByRole("button", { name: "Send" }).click();
      await expect(coldPage!.getByRole("button", { name: "Launch GP" })).toBeVisible();
    });
    await coldStep(funnel, "run first race", "Visible Launch GP flow opened the replay and returned to the stand.", async () => {
      await coldPage!.getByRole("button", { name: "Launch GP" }).click();
      await coldPage!.getByRole("dialog", { name: "Launch Grand Prix?" }).getByRole("button", { name: "Launch GP" }).click();
      await expect(coldPage!.getByRole("button", { name: "Back to stand" })).toBeVisible();
      await coldPage!.getByRole("button", { name: "Back to stand" }).click();
    });
    await coldStep(funnel, "make first purchase", "Visible Garage/Shop/card/Buy card controls completed a first purchase.", async () => {
      await coldPage!.getByRole("button", { name: "Garage", exact: true }).click();
      await dismissBlockingModals(coldPage!);
      await coldPage!.getByRole("tab", { name: "Shop" }).click();
      await coldPage!.getByRole("button", { name: /^Card:/ }).first().click();
      await coldPage!.getByRole("dialog", { name: "Confirm card purchase" }).getByRole("button", { name: "Buy card" }).click();
      await expect(coldPage!.getByText("Card added to your garage.")).toBeVisible();
    });
  } catch (error) {
    failure = error;
    if (!funnel.length || funnel[funnel.length - 1]?.reached) {
      funnel.push({ goal: "stuck", reached: false, note: error instanceof Error ? error.message : String(error) });
    }
  } finally {
    await coldBrowser?.close();
    for (const server of servers.reverse()) server.child.kill("SIGTERM");
  }
  await writeColdStartReport(funnel, failure);
  if (failure) throw failure;
  console.log(`Cold-start UX funnel: ${coldStartReportPath}`);
}

async function coldStep(funnel: Array<{ goal: string; reached: boolean; note: string }>, goal: string, note: string, action: () => Promise<void>) {
  try {
    await action();
    funnel.push({ goal, reached: true, note });
  } catch (error) {
    funnel.push({ goal, reached: false, note: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

async function seedProfile() {
  const prisma = new PrismaClient();
  try {
    const email = `browser-playtest-${Date.now()}@example.test`;
    const created = await createProfile(prisma, { email });
    if (!created.recoveryCode) throw new Error("Profile seed did not return a recovery code.");
    return { session: { profile: created.profile, recoveryCode: created.recoveryCode, teams: [] } };
  } finally {
    await prisma.$disconnect();
  }
}

async function recoverAndCreateLeague(page: Page) {
  await page.goto("/");
  await trackedClick(page, "setup", "press-start", () => page.getByRole("button", { name: "PRESS START" }).click());
  await expect(page.getByRole("button", { name: /Create league/ })).toBeVisible();

  await trackedClick(page, "setup", "create-league-choice", () => page.getByRole("button", { name: /Create league/ }).click());
  await page.getByRole("textbox", { name: "League" }).fill(`Browser Playtest ${Date.now()}`);
  await page.getByRole("textbox", { name: "Team" }).fill("Browser Sprinter");
  await page.getByLabel("GP per season").fill(String(rounds));
  countAction("setup", "fill setup form");
  const state = await waitForLeagueResponse(page, "POST", "/leagues", () => trackedClick(page, "setup", "start-league", () => page.getByRole("button", { name: "Start league" }).click()));
  await page.evaluate((leagueId) => {
    for (const key of ["cr-league-help-league-intro", "cr-league-help-race", "cr-league-help-plan", "cr-league-help-garage"]) {
      localStorage.setItem(`${key}:${leagueId}`, "1");
    }
  }, state.league.id);
  await page.reload();
  await dismissBlockingModals(page);
  await expect(page.getByRole("button", { name: "Plan", exact: true })).toBeVisible();
  return state;
}

async function choosePlan(page: Page, state: LeagueState, profile: PlaytestProfile, round: number) {
  const teamId = state.player?.teamId;
  if (!teamId) throw new Error("League state did not include a browser player claim.");
  const decision = multiplayerDecisionFor({ profile, index: 0, round, teamId, teams: state.teams });
  await trackedClick(page, `round-${round}-plan`, "open-plan", () => page.getByRole("button", { name: "Plan", exact: true }).click());
  await dismissBlockingModals(page);
  await chooseDirective(page, `round-${round}-plan`, "Approach", approachLabels[decision.approach]);
  await chooseDirective(page, `round-${round}-plan`, "Tire prep", preparationLabels[decision.preparation]);
  await chooseDirective(page, `round-${round}-plan`, "Pit strategy", pitLabels[decision.pitStrategy ?? "standard"]);
  await chooseDirective(page, `round-${round}-plan`, "Card", decision.cardId ? cardLabels[decision.cardId] : "No card");
  await dismissBlockingModals(page);
  return decision;
}

async function chooseDirective(page: Page, task: string, field: string, value: string) {
  await trackedClick(page, task, `open ${field}`, () => page.getByRole("tab", { name: new RegExp(field) }).click());
  await trackedClick(page, task, `choose ${field}: ${value}`, () => page.getByRole("button", { name: `${field}: ${value}` }).click());
}

async function submitPlan(page: Page, state: LeagueState, round: number) {
  await trackedClick(page, `round-${round}-submit-plan`, "send-plan", () => page.getByRole("button", { name: "Send plan" }).click());
  await trackedClick(page, `round-${round}-submit-plan`, "confirm-send", () => page.getByRole("dialog", { name: "Send race plan" }).getByRole("button", { name: "Send" }).click());
  await expect(page.getByRole("button", { name: "Launch GP" })).toBeVisible();
  return fetchLeagueState(state);
}

async function launchGrandPrix(page: Page, state: LeagueState, round: number) {
  const next = await waitForLeagueResponse(page, "POST", `/leagues/${state.league.id}/resolve`, async () => {
    await trackedClick(page, `round-${round}-launch-gp`, "launch-gp", () => page.getByRole("button", { name: "Launch GP" }).click());
    await trackedClick(page, `round-${round}-launch-gp`, "confirm-launch", () => page.getByRole("dialog", { name: "Launch Grand Prix?" }).getByRole("button", { name: "Launch GP" }).click());
  });
  await expect(page.getByRole("heading", { name: "Race replay" })).toBeVisible();
  return next;
}

async function buyAfterRace(page: Page, state: LeagueState, profile: PlaytestProfile, round: number) {
  const team = state.teams.find((candidate) => candidate.id === state.player?.teamId);
  const cardId = team ? multiplayerNextBuyFor({ profile, index: 0, round, ownedCards: team.cards, credits: team.credits }) : undefined;
  if (!cardId) return {};
  await trackedClick(page, "garage-buy", "open-garage", () => page.getByRole("button", { name: "Garage", exact: true }).click());
  await trackedClick(page, "garage-buy", "open-shop", () => page.getByRole("tab", { name: "Shop" }).click());
  const card = page.getByRole("button", { name: `Card: ${cardLabels[cardId]}` });
  if (!(await card.isVisible()) || !(await card.isEnabled())) {
    addHesitation("garage-buy", `${cardLabels[cardId]} was not visible or enabled.`);
    return {};
  }
  const next = await waitForLeagueResponse(page, "POST", `/leagues/${state.league.id}/cards/buy`, async () => {
    await trackedClick(page, "garage-buy", `open ${cardLabels[cardId]}`, () => card.click());
    await trackedClick(page, "garage-buy", "confirm-buy", () => page.getByRole("dialog", { name: "Confirm card purchase" }).getByRole("button", { name: "Buy card" }).click());
  });
  return { state: next, cardId };
}

async function nextGrandPrix(page: Page) {
  await page.getByRole("button", { name: "Stand", exact: true }).click();
  return waitForAnyLeagueResponse(page, "POST", "/next-grand-prix", async () => {
    await trackedClick(page, "next-gp", "next-gp", () => page.getByRole("button", { name: "Next GP" }).click());
    await trackedClick(page, "next-gp", "confirm-next-gp", () => page.getByRole("dialog", { name: "Start the next race day?" }).getByRole("button", { name: "Next GP" }).click());
  });
}

async function observeComprehension(page: Page, step: string, note: string, locators: Array<() => ReturnType<Page["locator"]>>, round?: number) {
  const checks = await Promise.all(locators.map(async (locator) => locator().isVisible().catch(() => false)));
  comprehensionChecks.push({ round, step, passed: checks.every(Boolean), note });
}

function comprehensionScore(round: number) {
  const checks = comprehensionChecks.filter((check) => check.round === round);
  const misses = checks.filter((check) => !check.passed).length;
  const roundFriction = [...frictionTasks.values()]
    .filter((task) => task.name.includes(`round-${round}`))
    .reduce((sum, task) => sum + task.hesitations.length, 0);
  const roundActions = [...frictionTasks.values()]
    .filter((task) => task.name.includes(`round-${round}`))
    .reduce((sum, task) => sum + task.actions, 0);
  const actionPenalty = Math.ceil(Math.max(0, roundActions - 10) / 2);
  return Math.max(1, Math.min(10, 10 - misses * 2 - actionPenalty - roundFriction - consoleErrors.length));
}

async function captureUx(page: Page, label: string, note: string) {
  if (!uxReportPath) return;
  await mkdir(uxAssetsDir, { recursive: true });
  const step = uxCaptures.length + 1;
  const prefix = `${String(step).padStart(2, "0")}-${slug(label)}`;
  const desktop = `${uxAssetsDir}/${prefix}-desktop.png`;
  const mobile = `${uxAssetsDir}/${prefix}-mobile.png`;
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: desktop, fullPage: true });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.screenshot({ path: mobile, fullPage: true });
  const mobileScan = await scanMobile(page);
  const axeViolations = await runAxe(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  uxCaptures.push({ step, label, note, desktop, mobile, ...mobileScan, axeViolations });
}

async function scanMobile(page: Page) {
  return page.evaluate(() => {
    const bodyOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
    const smallTapTargets = [...document.querySelectorAll("button, a, input, select, textarea")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      })
      .length;
    return { bodyOverflow, smallTapTargets };
  });
}

async function runAxe(page: Page) {
  return page.evaluate(async () => {
    const result = await window.axe.run(document, { resultTypes: ["violations"] });
    return result.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length, help: violation.help }));
  });
}

async function trackedClick(page: Page, task: string, label: string, action: () => Promise<void>) {
  countAction(task, label);
  await action();
}

function countAction(task: string, label: string) {
  const row = frictionTasks.get(task) ?? { name: task, actions: 0, hesitations: [] };
  row.actions += 1;
  frictionTasks.set(task, row);
  void label;
}

function addHesitation(task: string, label: string) {
  const row = frictionTasks.get(task) ?? { name: task, actions: 0, hesitations: [] };
  row.hesitations.push(label);
  frictionTasks.set(task, row);
}

async function waitForLeagueResponse(page: Page, method: string, path: string, action: () => Promise<void>) {
  const response = page.waitForResponse((candidate) => candidate.request().method() === method && new URL(candidate.url()).pathname === path);
  await action();
  return (await (await response).json()) as LeagueState;
}

async function waitForAnyLeagueResponse(page: Page, method: string, pathSuffix: string, action: () => Promise<void>) {
  const response = page.waitForResponse((candidate) => candidate.request().method() === method && new URL(candidate.url()).pathname.endsWith(pathSuffix));
  await action();
  return (await (await response).json()) as LeagueState;
}

async function fetchLeagueState(previous: LeagueState) {
  const response = await fetch(`${apiBaseUrl}/leagues/${previous.league.id}`);
  if (!response.ok) throw new Error(`GET league state failed with ${response.status}: ${await response.text()}`);
  return { ...((await response.json()) as LeagueState), player: previous.player };
}

async function dismissBlockingModals(page: Page) {
  await page.getByRole("dialog").first().waitFor({ state: "visible", timeout: 2_000 }).catch(() => undefined);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const dialog = page.getByRole("dialog").first();
    if (!(await dialog.isVisible().catch(() => false))) return;
    const button =
      dialog.getByRole("button", { name: "Got it" }).or(dialog.getByRole("button", { name: "Enter the grid" })).or(dialog.getByRole("button", { name: "Next" })).or(dialog.getByRole("button", { name: "Close" })).first();
    if (!(await button.isVisible().catch(() => false))) return;
    await button.click();
  }
}

async function startServers() {
  if (!(await isUp(`${apiBaseUrl}/health`))) {
    servers.push(spawnServer("api", "npm", ["run", "dev:api"]));
  }
  if (!(await isUp(webBaseUrl))) {
    servers.push(spawnServer("web", "npm", ["run", "dev", "-w", "@cr-league/web", "--", "--host", "127.0.0.1", "--port", new URL(webBaseUrl).port || "4873"]));
  }
  await waitFor(`${apiBaseUrl}/health`, "api");
  await waitFor(webBaseUrl, "web");
}

function spawnServer(name: string, command: string, args: string[]): ManagedServer {
  const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" });
  const logs: string[] = [];
  const remember = (chunk: Buffer) => {
    logs.push(...chunk.toString("utf8").split("\n").filter(Boolean));
    logs.splice(0, Math.max(0, logs.length - 40));
  };
  child.stdout.on("data", remember);
  child.stderr.on("data", remember);
  return { name, child, logs };
}

async function waitFor(url: string, name: string) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (await isUp(url)) return;
    await delay(500);
  }
  const server = servers.find((candidate) => candidate.name === name);
  throw new Error(`${name} server did not start.\n${server?.logs.join("\n") ?? ""}`);
}

async function isUp(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 750);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

async function captureFailure(page: Page) {
  await mkdir(screenshotDir, { recursive: true });
  const path = `${screenshotDir}/${Date.now()}-failure.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function writeReport(input: { reports: RoundReport[]; consoleErrors: string[]; failed: boolean; error?: unknown; screenshot?: string }) {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(
    reportPath,
    [
      "# Browser AI Playtest",
      "",
      `- Date: ${new Date().toISOString()}`,
      `- Profile: ${profile.name}`,
      `- Rounds requested: ${rounds}`,
      `- Backend: ${apiBaseUrl}`,
      `- Web: ${webBaseUrl}`,
      `- Result: ${input.failed ? "FAIL" : "PASS"}`,
      input.screenshot ? `- Failure screenshot: ${input.screenshot}` : undefined,
      input.error ? `- Error: ${input.error instanceof Error ? input.error.message : String(input.error)}` : undefined,
      "",
      "## Rounds",
      input.reports.length
        ? table(
            ["GP", "Approach", "Preparation", "Pit", "Card", "Winner", "Player pos", "Fun", "Frustration", "Comprehension", "Bought"],
            input.reports.map((row) => [
              row.round,
              row.decision.approach,
              row.decision.preparation,
              row.decision.pitStrategy ?? "standard",
              row.decision.cardId ?? "none",
              row.winner,
              `P${row.playerPosition}`,
              row.fun,
              row.frustration,
              row.comprehension,
              row.bought ?? "-"
            ])
          )
        : "- No completed round.",
      "",
      "## UI Failures",
      input.consoleErrors.length ? input.consoleErrors.map((error) => `- ${error}`).join("\n") : "- none",
      "",
      "## Comprehension Checks",
      comprehensionChecks.length ? table(["Step", "Round", "Passed", "Note"], comprehensionChecks.map((row) => [row.step, row.round ?? "-", row.passed ? "yes" : "no", row.note])) : "- none",
      "",
      "## Notes",
      "- Profile seeding uses the store to obtain a recovery code; recovery, league creation, plan submission, GP launch, replay opening, card buy, and next-GP actions are browser UI actions.",
      "- The runner observes API responses triggered by UI actions only to build the report."
    ]
      .filter((line): line is string => line !== undefined)
      .join("\n") + "\n",
    "utf8"
  );
}

async function writeUxReport(input: { reports: RoundReport[]; failed: boolean; error?: unknown; screenshot?: string }) {
  await mkdir(dirname(uxReportPath), { recursive: true });
  const frictionRows = [...frictionTasks.values()];
  const totalAxe = uxCaptures.reduce((sum, capture) => sum + capture.axeViolations.length, 0);
  await writeFile(
    uxReportPath,
    [
      "# UX Evaluation Harness",
      "",
      `- Date: ${new Date().toISOString()}`,
      `- Profile: ${profile.name}`,
      `- Rounds: ${rounds}`,
      `- Result: ${input.failed ? "FAIL" : "PASS"}`,
      input.screenshot ? `- Failure screenshot: ${input.screenshot}` : undefined,
      input.error ? `- Error: ${input.error instanceof Error ? input.error.message : String(input.error)}` : undefined,
      "",
      "## Visual Playthrough",
      ...uxCaptures.flatMap((capture) => [
        "",
        `### ${capture.step}. ${capture.label}`,
        capture.note,
        `- Desktop: ${capture.desktop}`,
        `- Mobile: ${capture.mobile}`,
        `- Mobile body overflow: ${capture.bodyOverflow ? "yes" : "no"}`,
        `- Mobile small tap targets: ${capture.smallTapTargets}`,
        `- Axe violations: ${capture.axeViolations.length}`
      ]),
      "",
      "## Friction",
      frictionRows.length ? table(["Task", "Actions", "Hesitations"], frictionRows.map((row) => [row.name, row.actions, row.hesitations.join("; ") || "-"])) : "- none",
      "",
      "## Console",
      consoleErrors.length || consoleWarnings.length ? [...consoleErrors.map((entry) => `- ERROR: ${entry}`), ...consoleWarnings.map((entry) => `- WARN: ${entry}`)].join("\n") : "- none",
      "",
      "## Accessibility",
      `- Total axe violation groups: ${totalAxe}`,
      ...uxCaptures.flatMap((capture) =>
        capture.axeViolations.map((violation) => `- ${capture.label}: ${violation.id} (${violation.impact ?? "unknown"}, ${violation.nodes} nodes) - ${violation.help}`)
      ),
      "",
      "## Outcomes",
      input.reports.length
        ? table(["GP", "Position", "Fun", "Frustration", "Comprehension"], input.reports.map((row) => [row.round, `P${row.playerPosition}`, row.fun, row.frustration, row.comprehension]))
        : "- No completed round."
      ,
      "",
      "## Comprehension Checks",
      comprehensionChecks.length ? table(["Step", "Round", "Passed", "Note"], comprehensionChecks.map((row) => [row.step, row.round ?? "-", row.passed ? "yes" : "no", row.note])) : "- none"
    ]
      .filter((line): line is string => line !== undefined)
      .join("\n") + "\n",
    "utf8"
  );
}

async function writeColdStartReport(funnel: Array<{ goal: string; reached: boolean; note: string }>, failure: unknown) {
  await mkdir(dirname(coldStartReportPath), { recursive: true });
  const reached = funnel.filter((step) => step.reached).at(-1)?.goal ?? "none";
  const stuck = funnel.find((step) => !step.reached);
  await writeFile(
    coldStartReportPath,
    [
      "# Cold-Start UX Funnel",
      "",
      `- Date: ${new Date().toISOString()}`,
      `- Viewport: mobile 390x900`,
      `- Result: ${failure ? "FAIL" : "PASS"}`,
      `- Furthest step reached: ${reached}`,
      stuck ? `- Stuck at: ${stuck.goal}` : "- Stuck at: none",
      "",
      "## Funnel",
      table(["Goal", "Reached", "Visible-affordance note"], funnel.map((step) => [step.goal, step.reached ? "yes" : "no", step.note.replace(/\n/g, " ")])),
      "",
      "## Missing Or Ambiguous Copy",
      stuck ? `- ${stuck.goal}: ${stuck.note.replace(/\n/g, " ")}` : "- none observed in this run",
      "",
      "## Scope Note",
      "- The profile session is seeded because local recovery-code delivery is not visible in-browser. The funnel uses only visible controls after app entry."
    ].join("\n") + "\n",
    "utf8"
  );
}

function numberArg(name: string, fallback: number) {
  const value = Number(stringArg(name, String(fallback)));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function stringArg(name: string, fallback: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

function dirname(path: string) {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) || "." : ".";
}

function table(headers: string[], rows: Array<Array<string | number>>) {
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((items) => `| ${items.join(" | ")} |`)].join("\n");
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

declare global {
  interface Window {
    axe: typeof axe;
  }
}
