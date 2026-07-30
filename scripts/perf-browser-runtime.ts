import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, type Page } from "@playwright/test";
import { DEMO_RACE_INPUT, simulateRace, type RaceInput, type RaceResult } from "../packages/shared/src/index.js";

const webBaseUrl = stringArg("--url", process.env.WEB_BASE_URL ?? "http://127.0.0.1:4873");
const cycles = numberArg("--cycles", 5);
const mode = stringArg("--mode", "grand-prix");
const windowSeconds = numberArg("--window", 2);
const cpuThrottle = numberArg("--cpu-throttle", 1);
const reportPath = stringArg("--report", "reports/perf/browser-runtime.md");
const jsonPath = stringArg("--json", reportPath.replace(/\.md$/, ".json"));
const noServer = process.argv.includes("--no-server");

const LIVERY_COLORS = ["#16c784", "#38bdf8", "#f97316", "#a855f7", "#ef4444", "#eab308"];
const playerTeamId = mode === "fps" ? "volt" : "team_1";
const player = { teamId: playerTeamId, claimCode: "CLAIM123" };
let round = 1;
let cadence = "manual";
let currentStatus = "briefing";
let hasDecision = false;
let credits = 0;
let points = 0;
let cards = ["rain_grip"];

// ponytail: the fps mode plays a real simulated race so the frame numbers come from a full
// 6-car field with a real trace, not the 2-car stub the leak modes use.
const fpsResult = mode === "fps" ? simulateRace({ ...(DEMO_RACE_INPUT as RaceInput), seed: "perf-fps" }) : null;

type Frames = { fps: number; avgMs: number; p95Ms: number; worstMs: number; jankPct: number };
type Sample = {
  label: string;
  frames?: Frames;
  heapMb: number;
  heapTotalMb: number;
  nodes: number;
  documents: number;
  listeners: number;
  longTasks: number;
  longTaskMs: number;
  resourceCount: number;
  transferMb: number;
  encodedMb: number;
};

let server: ChildProcess | undefined;

try {
  await ensureWebServer();

  const browser = await chromium.launch({ args: ["--js-flags=--expose-gc"] });
  const context = await browser.newContext({ baseURL: webBaseUrl, viewport: { width: 1440, height: 1000 } });
  // ponytail: string content, not a function — tsx/esbuild rewrites named functions with a __name
  // helper that does not exist in the page, and the injected script dies silently.
  await context.addInitScript({
    content: `
      var perf = { longTasks: [], frames: [] };
      window.__crPerf = perf;
      new PerformanceObserver(function (list) {
        for (var entry of list.getEntries()) perf.longTasks.push({ duration: entry.duration });
      }).observe({ entryTypes: ["longtask"] });
      var last = 0;
      var onFrame = function (now) {
        if (last) perf.frames.push(now - last);
        last = now;
        requestAnimationFrame(onFrame);
      };
      requestAnimationFrame(onFrame);
    `
  });

  const page = await context.newPage();
  await mockLeagueApi(page);
  const client = await context.newCDPSession(page);
  await client.send("Performance.enable");
  await client.send("HeapProfiler.enable");

  if (cpuThrottle > 1) await client.send("Emulation.setCPUThrottlingRate", { rate: cpuThrottle });

  const samples: Sample[] = [];
  const sample = async (label: string, frames?: Frames) => {
    await client.send("HeapProfiler.collectGarbage");
    await delay(100);
    const metrics = Object.fromEntries((await client.send("Performance.getMetrics")).metrics.map((metric) => [metric.name, metric.value]));
    const pageMetrics = await page.evaluate(() => {
      const longTasks = ((window as unknown as { __crPerf?: { longTasks: Array<{ duration: number }> } }).__crPerf?.longTasks ?? []);
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      return {
        longTasks: longTasks.length,
        longTaskMs: longTasks.reduce((sum, task) => sum + task.duration, 0),
        resourceCount: resources.length,
        transferBytes: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        encodedBytes: resources.reduce((sum, entry) => sum + (entry.encodedBodySize || 0), 0)
      };
    });
    samples.push({
      label,
      frames,
      heapMb: mb(metrics.JSHeapUsedSize ?? 0),
      heapTotalMb: mb(metrics.JSHeapTotalSize ?? 0),
      nodes: Math.round(metrics.Nodes ?? 0),
      documents: Math.round(metrics.Documents ?? 0),
      listeners: Math.round(metrics.JSEventListeners ?? 0),
      longTasks: pageMetrics.longTasks,
      longTaskMs: Math.round(pageMetrics.longTaskMs),
      resourceCount: pageMetrics.resourceCount,
      transferMb: mb(pageMetrics.transferBytes),
      encodedMb: mb(pageMetrics.encodedBytes)
    });
  };

  await page.goto("/");
  await createProfile(page);
  await createLeague(page);
  await sample("league-created");

  let profile: Array<{ name: string; selfMs: number; pct: number }> = [];
  if (mode === "fps") {
    await launchReplay(page);
    await sample("replay-open");
    await client.send("Profiler.enable");
    await client.send("Profiler.setSamplingInterval", { interval: 200 });
    await client.send("Profiler.start");
    for (let cycle = 1; cycle <= cycles; cycle += 1) {
      await measureFrames(page, windowSeconds);
      await sample(`play-${cycle}`, await drainFrames(page));
    }
    profile = summarizeProfile(await client.send("Profiler.stop"));
  } else if (mode === "replay") {
    await launchReplay(page);
    await sample("replay-open");
    for (let cycle = 1; cycle <= cycles; cycle += 1) {
      await stressReplay(page);
      await sample(`replay-${cycle}`);
    }
  } else {
    for (let cycle = 1; cycle <= cycles; cycle += 1) {
      await runGrandPrixCycle(page, cycle < cycles);
      await sample(`cycle-${cycle}`);
    }
  }

  const resources = await topResources(page);
  await browser.close();
  await writeReport(samples, resources, profile);
  console.log(`Runtime perf report written to ${reportPath}`);
  console.log(`Runtime perf data written to ${jsonPath}`);
} finally {
  if (server && !server.killed) server.kill("SIGTERM");
}

async function ensureWebServer() {
  if (await isUp(webBaseUrl)) return;
  if (noServer) throw new Error(`${webBaseUrl} is not reachable. Start the web app or remove --no-server.`);

  const shared = spawnSync("npm", ["run", "build", "-w", "@cr-league/shared", "--", "--force"], { stdio: "inherit" });
  if (shared.status !== 0) throw new Error("Shared build failed.");

  server = spawn("npm", ["run", "dev:web"], { stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" });
  server.stdout?.on("data", (chunk) => process.stdout.write(`[web] ${chunk}`));
  server.stderr?.on("data", (chunk) => process.stderr.write(`[web] ${chunk}`));
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await isUp(webBaseUrl)) return;
    await delay(500);
  }
  throw new Error(`Timed out waiting for ${webBaseUrl}.`);
}

async function isUp(url: string) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function mockLeagueApi(page: Page) {
  await page.route(/http:\/\/(?:localhost|127\.0\.0\.1):4874\/.*/, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (path === "/profiles") return route.fulfill({ json: { ok: true, message: "If a profile exists for this email, a fresh recovery code will be sent." } });
    if (path === "/profiles/recover") return route.fulfill({ json: { profile: { id: "profile_1", email: "pilot@example.test" }, recoveryCode: "ABCD1234", teams: [] } });
    if (path === "/leagues") return route.fulfill({ json: leagueState() });
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
    if (path === "/leagues/league_1/next-grand-prix") {
      round += 1;
      currentStatus = "briefing";
      hasDecision = false;
      return route.fulfill({ json: leagueState() });
    }

    return route.fulfill({ status: 404, json: { message: `Unhandled mock route ${path}` } });
  });
}

async function createProfile(page: Page) {
  const pressStart = page.getByRole("button", { name: "PRESS START" });
  if (await pressStart.isVisible({ timeout: 1000 }).catch(() => false)) await pressStart.click();
  const multiplayer = page.getByRole("button", { name: /Multiplayer/ });
  if (await multiplayer.isVisible({ timeout: 1000 }).catch(() => false)) await multiplayer.click();
  await page.getByRole("button", { name: /Create profile/ }).click();
  await page.getByLabel("Email").fill("pilot@example.test");
  await page.getByRole("button", { name: "Create profile" }).click();
  await page.getByLabel("Recovery code").fill("ABCD1234");
  await page.getByRole("button", { name: "Recover profile" }).click();
  await page.getByText("Profile recovered.").waitFor();
  await dismissOnboarding(page);
}

async function createLeague(page: Page) {
  await page.getByRole("button", { name: "Create league" }).click();
  await suppressOnboarding(page);
  await page.getByRole("button", { name: "Start league" }).click();
  await page.getByRole("button", { name: "Stand", exact: true }).waitFor();
  await dismissOnboarding(page);
}

async function runGrandPrixCycle(page: Page, startNext: boolean) {
  await launchReplay(page);
  await page.getByRole("button", { name: "Back to stand" }).click();
  await page.getByRole("button", { name: "Next GP" }).waitFor();
  if (!startNext) return;
  await startNextGrandPrix(page);
}

async function launchReplay(page: Page) {
  await page.getByRole("button", { name: "Stand", exact: true }).click();
  await dismissOnboarding(page);
  await page.getByRole("button", { name: "Send plan" }).click();
  await page.getByRole("dialog", { name: "Send race plan" }).getByRole("button", { name: "Send" }).click();
  await page.getByRole("button", { name: "Launch GP" }).click();
  await page.getByRole("dialog", { name: "Launch Grand Prix?" }).getByRole("button", { name: "Launch GP" }).click();
  await page.getByRole("heading", { name: "Race replay" }).waitFor();
  await delay(600);
}

async function startNextGrandPrix(page: Page) {
  await page.getByRole("button", { name: "Next GP" }).click();
  await page.getByRole("dialog", { name: "Start the next race day?" }).getByRole("button", { name: "Next GP" }).click();
  await page.getByRole("heading", { name: "1. Read the circuit" }).waitFor();
  await dismissOnboarding(page);
}

async function stressReplay(page: Page) {
  const controls = page.locator(".replay-map-controls");
  const focus = controls.getByRole("button", { name: "Focus driver" });
  if (await focus.isVisible({ timeout: 500 }).catch(() => false)) await focus.click();

  const speed = controls.getByRole("button", { name: /Speed/ });
  if (await speed.isVisible({ timeout: 500 }).catch(() => false)) {
    await speed.click();
    const option = page.locator(".replay-speed-options").getByRole("button").last();
    if (await option.isVisible({ timeout: 500 }).catch(() => false)) await option.click();
  }

  const pause = controls.getByRole("button", { name: /Pause|Play/ });
  if (await pause.isVisible({ timeout: 500 }).catch(() => false)) await pause.click();
  const restart = controls.getByRole("button", { name: "Restart" });
  if (await restart.isVisible({ timeout: 500 }).catch(() => false)) await restart.click();
  await delay(400);
}

async function measureFrames(page: Page, seconds: number) {
  await drainFrames(page);
  await delay(seconds * 1000);
}

async function drainFrames(page: Page): Promise<Frames> {
  const deltas = await page.evaluate(() => {
    const perf = (window as unknown as { __crPerf?: { frames: number[] } }).__crPerf;
    const frames = perf?.frames ?? [];
    if (perf) perf.frames = [];
    return frames;
  });
  if (!deltas.length) return { fps: 0, avgMs: 0, p95Ms: 0, worstMs: 0, jankPct: 0 };
  const sorted = [...deltas].sort((left, right) => left - right);
  const avg = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  return {
    fps: roundNumber(1000 / avg),
    avgMs: roundNumber(avg),
    p95Ms: roundNumber(sorted[Math.floor(sorted.length * 0.95)] ?? 0),
    worstMs: roundNumber(sorted.at(-1) ?? 0),
    jankPct: roundNumber((deltas.filter((value) => value > 32).length / deltas.length) * 100)
  };
}

// Self time per function from the CDP sampling profile: the shortlist of what to optimise first.
function summarizeProfile(profile: { profile: { nodes: Array<{ id: number; callFrame: { functionName: string; url: string; lineNumber: number } }>; samples?: number[]; timeDeltas?: number[] } }) {
  const byId = new Map(profile.profile.nodes.map((node) => [node.id, node.callFrame]));
  const selfMs = new Map<string, number>();
  const samples = profile.profile.samples ?? [];
  const deltas = profile.profile.timeDeltas ?? [];
  samples.forEach((id, index) => {
    const frame = byId.get(id);
    if (!frame) return;
    const file = frame.url.split("/").pop() ?? "";
    const name = `${frame.functionName || "(anonymous)"} @ ${file}:${frame.lineNumber + 1}`;
    selfMs.set(name, (selfMs.get(name) ?? 0) + (deltas[index] ?? 0) / 1000);
  });
  const total = [...selfMs.values()].reduce((sum, value) => sum + value, 0) || 1;
  return [...selfMs.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 25)
    .map(([name, ms]) => ({ name, selfMs: roundNumber(ms), pct: roundNumber((ms / total) * 100) }));
}

async function dismissOnboarding(page: Page) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const overlay = page.locator(".modal-overlay").last();
    if (!(await overlay.isVisible({ timeout: 800 }).catch(() => false))) break;
    const startRacing = overlay.getByRole("button", { name: "Enter the grid" });
    if (await startRacing.isVisible({ timeout: 300 }).catch(() => false)) {
      await startRacing.click();
      continue;
    }
    const next = overlay.getByRole("button", { name: "Next" });
    if (await next.isVisible({ timeout: 300 }).catch(() => false)) {
      await next.click();
      continue;
    }
    const gotIt = overlay.getByRole("button", { name: "Got it" });
    if (await gotIt.isVisible({ timeout: 300 }).catch(() => false)) await gotIt.click();
    else break;
  }
}

async function suppressOnboarding(page: Page) {
  await page.evaluate(() => {
    for (const key of ["cr-league-help-league-intro", "cr-league-help-race", "cr-league-help-plan", "cr-league-help-garage"]) {
      localStorage.setItem(key, "1");
      localStorage.setItem(`${key}:league_1`, "1");
    }
  });
}

function leagueState(result: ReturnType<typeof resultForRound> | null = null) {
  return {
    league: { id: "league_1", name: "Office League", code: "ABC123", status: "active", cadence, maxPlayers: 2, fillWithBots: true, qualifyingAttemptLimit: 3, maxGrandPrixPerSeason: 10, preparationDeadlineAt: null },
    currentGrandPrix: { id: `gp_${round}`, name: "Silver Ridge GP", season: 1, round, status: currentStatus, primaryTrait: "fast", secondaryTrait: "weather_sensitive", forecast: { dry: 60, light_rain: 30, heavy_rain: 10 }, qualifyingRuns: [], result },
    grandPrixHistory: Array.from({ length: round }, (_, index) => {
      const historyRound = round - index;
      return { id: `gp_${historyRound}`, name: "Silver Ridge GP", season: 1, round: historyRound, status: historyRound === round ? currentStatus : "resolved", result: historyRound === round ? result : resultForRound(historyRound) };
    }),
    teams: fpsResult
      ? fpsResult.classification.map((entry, index) => ({
          id: entry.teamId,
          name: entry.teamName,
          kind: entry.teamId === playerTeamId ? "human" : "bot",
          points: entry.teamId === playerTeamId ? points : 0,
          credits: entry.teamId === playerTeamId ? credits : 0,
          cards: entry.teamId === playerTeamId ? cards : [],
          livery: { primary: LIVERY_COLORS[index % LIVERY_COLORS.length]!, secondary: "#38bdf8" },
          ready: entry.teamId === playerTeamId ? hasDecision : false
        }))
      : [
          { id: "team_1", name: "Volt Union", kind: "human", points, credits, cards, livery: { primary: "#16c784", secondary: "#38bdf8" }, ready: hasDecision },
          { id: "team_2", name: "Mika Blitz", kind: "bot", points: 0, credits: 0, cards: [], livery: { primary: "#38bdf8", secondary: "#16c784" }, ready: false }
        ],
    cardShop: [{ cardId: "rain_grip", price: 100 }, { cardId: "launch_boost", price: 100 }],
    actionState: {
      submittedTeamIds: hasDecision ? [playerTeamId] : [],
      missingTeamIds: currentStatus === "resolved" ? [] : hasDecision ? ["team_2"] : [playerTeamId, "team_2"],
      canResolve: currentStatus !== "resolved" && hasDecision,
      canStartNextGrandPrix: currentStatus === "resolved",
      nextAction: currentStatus === "resolved" ? "start_next_grand_prix" : hasDecision ? "resolve_grand_prix" : "wait_for_directives"
    },
    player,
    decisions: hasDecision ? [{ teamId: playerTeamId, approach: "balanced", preparation: "weather", cardId: "rain_grip", rivalTeamId: null }] : []
  };
}

function resultForRound(resultRound: number): RaceResult | Record<string, unknown> {
  if (fpsResult) return { ...fpsResult, seed: `${fpsResult.seed}-${resultRound}` };
  return {
    grandPrixName: "Silver Ridge GP",
    seed: `silver-ridge-${resultRound}`,
    resolvedWeather: { start: "dry", early: "dry", mid: "light_rain", late: "light_rain", finish: "light_rain" },
    classification: [
      { position: 1, teamId: "team_1", teamName: "Volt Union", points: 25, credits: 150, positionChange: 1, status: "finished", resultTags: ["weather_gamble"] },
      { position: 2, teamId: "team_2", teamName: "Mika Blitz", points: 18, credits: 100, positionChange: -1, status: "finished", resultTags: [] }
    ],
    events: [
      { id: `evt_${resultRound}`, order: 0, segment: "mid", lap: 5, type: "weather_gamble_paid", teamId: "team_1", cardId: "rain_grip", severity: "major", positionDelta: 2, tags: ["card", "weather"], replayText: `Silver Ridge GP ${resultRound}: Volt Union wins.`, reportText: "Volt Union called the rain correctly." }
    ],
    consumedCards: [{ teamId: "team_1", cardId: "rain_grip" }],
    report: { headline: `Silver Ridge GP ${resultRound}: Volt Union wins.`, blocks: [{ title: "Key moments", body: "Volt Union called the rain correctly." }] }
  };
}

async function topResources(page: Page) {
  return page.evaluate(() =>
    (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
      .map((entry) => ({ name: entry.name.replace(location.origin, ""), type: entry.initiatorType, transferKb: Math.round((entry.transferSize || 0) / 1024), encodedKb: Math.round((entry.encodedBodySize || 0) / 1024) }))
      .sort((left, right) => right.encodedKb - left.encodedKb)
      .slice(0, 20)
  );
}

async function writeReport(samples: Sample[], resources: Awaited<ReturnType<typeof topResources>>, profile: Array<{ name: string; selfMs: number; pct: number }> = []) {
  await mkdir(dirname(reportPath), { recursive: true });
  const first = samples[0]!;
  const last = samples.at(-1)!;
  const growth = {
    heapMb: roundNumber(last.heapMb - first.heapMb),
    nodes: last.nodes - first.nodes,
    listeners: last.listeners - first.listeners,
    transferMb: roundNumber(last.transferMb - first.transferMb)
  };
  const frameSamples = samples.filter((entry) => entry.frames?.fps);
  const fpsValues = frameSamples.map((entry) => entry.frames!.fps);
  await writeFile(jsonPath, `${JSON.stringify({ webBaseUrl, mode, cycles, cpuThrottle, growth, samples, resources, profile }, null, 2)}\n`);
  await writeFile(
    reportPath,
    [
      "# Browser Runtime Perf",
      "",
      `- URL: ${webBaseUrl}`,
      `- Mode: ${mode}`,
      `- Cycles: ${cycles}`,
      `- CPU throttle: ${cpuThrottle}x`,
      ...(fpsValues.length
        ? [
            `- Median FPS: ${median(fpsValues)}`,
            `- Worst window FPS: ${Math.min(...fpsValues)}`,
            `- Worst frame: ${Math.max(...frameSamples.map((entry) => entry.frames!.worstMs))} ms`,
            `- Frames over 32 ms: ${median(frameSamples.map((entry) => entry.frames!.jankPct))}%`
          ]
        : []),
      `- Heap growth: ${growth.heapMb} MB`,
      `- DOM node growth: ${growth.nodes}`,
      `- Listener growth: ${growth.listeners}`,
      `- Network transfer after first sample: ${growth.transferMb} MB`,
      "",
      "## Samples",
      "",
      table(
        ["Step", "Heap MB", "Heap total MB", "Nodes", "Docs", "Listeners", "Long tasks", "Long task ms", "Requests", "Transfer MB", "Encoded MB"],
        samples.map((sample) => [sample.label, sample.heapMb, sample.heapTotalMb, sample.nodes, sample.documents, sample.listeners, sample.longTasks, sample.longTaskMs, sample.resourceCount, sample.transferMb, sample.encodedMb])
      ),
      "",
      ...(frameSamples.length
        ? [
            "## Frames",
            "",
            table(
              ["Window", "FPS", "Avg ms", "P95 ms", "Worst ms", "Jank %"],
              frameSamples.map((sample) => [sample.label, sample.frames!.fps, sample.frames!.avgMs, sample.frames!.p95Ms, sample.frames!.worstMs, sample.frames!.jankPct])
            ),
            ""
          ]
        : []),
      ...(profile.length
        ? [
            "## Top Self Time",
            "",
            table(["Function", "Self ms", "% CPU"], profile.map((entry) => [entry.name, entry.selfMs, entry.pct])),
            ""
          ]
        : []),
      "## Largest Resources",
      "",
      table(["Resource", "Type", "Transfer KB", "Encoded KB"], resources.map((resource) => [resource.name, resource.type, resource.transferKb, resource.encodedKb])),
      ""
    ].join("\n")
  );
}

function table(headers: string[], rows: Array<Array<string | number>>) {
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
}

function numberArg(name: string, fallback: number) {
  const index = process.argv.lastIndexOf(name);
  const value = index >= 0 ? Number(process.argv[index + 1]) : fallback;
  return Number.isFinite(value) ? value : fallback;
}

function stringArg(name: string, fallback: string) {
  const index = process.argv.lastIndexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1]! : fallback;
}

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function mb(bytes: number) {
  return roundNumber(bytes / 1024 / 1024);
}

function roundNumber(value: number) {
  return Math.round(value * 100) / 100;
}
