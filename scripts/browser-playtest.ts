import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, expect, type Browser, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
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
  bought?: CardId;
};

const servers: ManagedServer[] = [];
const consoleErrors: string[] = [];
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
  page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  let state = await recoverAndCreateLeague(page);
  const reports: RoundReport[] = [];

  for (let round = 1; round <= rounds; round += 1) {
    const decision = await choosePlan(page, state, profile, round);
    state = await submitPlan(page, state);
    state = await launchGrandPrix(page, state);
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
      frustration: frustrationScore(playerEntry.position, result, playerTeamId)
    };
    reports.push(roundReport);

    await page.getByRole("button", { name: "Back to stand" }).click();
    if (round < rounds) {
      const bought = await buyAfterRace(page, state, profile, round);
      if (bought.state) state = bought.state;
      roundReport.bought = bought.cardId;
      state = await nextGrandPrix(page);
    }
  }

  await page.getByRole("button", { name: "Championship", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Current GP" })).toBeVisible();
  await browser.close();
  browser = undefined;
  await writeReport({ reports, consoleErrors, failed: false });
  console.log(`Browser playtest: ${profile.name} x ${rounds} GP`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  const screenshot = page ? await captureFailure(page) : undefined;
  await writeReport({ reports: [], consoleErrors, failed: true, error, screenshot });
  throw error;
} finally {
  await browser?.close();
  for (const server of servers.reverse()) server.child.kill("SIGTERM");
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
  await page.getByRole("button", { name: "PRESS START" }).click();
  await expect(page.getByRole("button", { name: /Create league/ })).toBeVisible();

  await page.getByRole("button", { name: /Create league/ }).click();
  await page.getByRole("textbox", { name: "League" }).fill(`Browser Playtest ${Date.now()}`);
  await page.getByRole("textbox", { name: "Team" }).fill("Browser Sprinter");
  await page.getByLabel("GP per season").fill(String(rounds));
  const state = await waitForLeagueResponse(page, "POST", "/leagues", () => page.getByRole("button", { name: "Start league" }).click());
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
  await page.getByRole("button", { name: "Plan", exact: true }).click();
  await dismissBlockingModals(page);
  await chooseDirective(page, "Approach", approachLabels[decision.approach]);
  await chooseDirective(page, "Tire prep", preparationLabels[decision.preparation]);
  await chooseDirective(page, "Pit strategy", pitLabels[decision.pitStrategy ?? "standard"]);
  await chooseDirective(page, "Card", decision.cardId ? cardLabels[decision.cardId] : "No card");
  await dismissBlockingModals(page);
  return decision;
}

async function chooseDirective(page: Page, field: string, value: string) {
  await page.getByRole("tab", { name: new RegExp(field) }).click();
  await page.getByRole("button", { name: `${field}: ${value}` }).click();
}

async function submitPlan(page: Page, state: LeagueState) {
  await page.getByRole("button", { name: "Send plan" }).click();
  await page.getByRole("dialog", { name: "Send race plan" }).getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("button", { name: "Launch GP" })).toBeVisible();
  return fetchLeagueState(state);
}

async function launchGrandPrix(page: Page, state: LeagueState) {
  const next = await waitForLeagueResponse(page, "POST", `/leagues/${state.league.id}/resolve`, async () => {
    await page.getByRole("button", { name: "Launch GP" }).click();
    await page.getByRole("dialog", { name: "Launch Grand Prix?" }).getByRole("button", { name: "Launch GP" }).click();
  });
  await expect(page.getByRole("heading", { name: "Race replay" })).toBeVisible();
  return next;
}

async function buyAfterRace(page: Page, state: LeagueState, profile: PlaytestProfile, round: number) {
  const team = state.teams.find((candidate) => candidate.id === state.player?.teamId);
  const cardId = team ? multiplayerNextBuyFor({ profile, index: 0, round, ownedCards: team.cards, credits: team.credits }) : undefined;
  if (!cardId) return {};
  await page.getByRole("button", { name: "Garage", exact: true }).click();
  await page.getByRole("tab", { name: "Shop" }).click();
  const card = page.getByRole("button", { name: `Card: ${cardLabels[cardId]}` });
  if (!(await card.isVisible()) || !(await card.isEnabled())) return {};
  const next = await waitForLeagueResponse(page, "POST", `/leagues/${state.league.id}/cards/buy`, async () => {
    await card.click();
    await page.getByRole("dialog", { name: "Confirm card purchase" }).getByRole("button", { name: "Buy card" }).click();
  });
  return { state: next, cardId };
}

async function nextGrandPrix(page: Page) {
  await page.getByRole("button", { name: "Stand", exact: true }).click();
  return waitForAnyLeagueResponse(page, "POST", "/next-grand-prix", async () => {
    await page.getByRole("button", { name: "Next GP" }).click();
    await page.getByRole("dialog", { name: "Start the next race day?" }).getByRole("button", { name: "Next GP" }).click();
  });
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
            ["GP", "Approach", "Preparation", "Pit", "Card", "Winner", "Player pos", "Fun", "Frustration", "Bought"],
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
              row.bought ?? "-"
            ])
          )
        : "- No completed round.",
      "",
      "## UI Failures",
      input.consoleErrors.length ? input.consoleErrors.map((error) => `- ${error}`).join("\n") : "- none",
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
