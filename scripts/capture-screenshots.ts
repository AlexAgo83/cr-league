// Regenerates the marketing screenshots from a deterministic solo save.
// Solo mode is entirely local, so this needs the web dev server and nothing else:
// no API, no Postgres. The fixture is built with the shared engine, so the state is
// always schema-valid and identical between runs.
//
// Usage: npm run capture:screenshots [-- --out docs/assets/readme --scale 2]
import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, type Browser, type Page } from "@playwright/test";
import { buildSoloFixture, SOLO_LEAGUE_ID, SOLO_SAVE_KEY, LANGUAGE_KEY } from "./screenshotFixture.js";

const webBaseUrl = process.env.WEB_BASE_URL ?? "http://127.0.0.1:4873";
const outDir = stringArg("--out", "docs/assets/readme");
const scale = numberArg("--scale", 2);
const manageServer = !process.argv.includes("--no-server");

// Crops are element-scoped rather than pixel boxes so they survive layout changes.
// Widths therefore vary per screen, which is the intended framing.
type Shot = {
  name: string;
  path: string;
  clip?: string;
  padding?: number;
  viewport?: { width: number; height: number };
  out?: string;
};

const HIDE_ALWAYS = [".notification-stack", ".onboarding-help", ".pending-feedback"];
// Served assets, so these live in the web app rather than the docs folder.
const SOCIAL_DIR = "apps/web/public/assets/social";

const SHOTS: Shot[] = [
  { name: "market-plan", path: "/plan/approach", clip: ".plan-view" },
  { name: "market-garage", path: "/garage/shop", clip: ".garage-grid" },
  { name: "market-championship", path: "/championship/standings", clip: ".championship-view" },
  { name: "market-report", path: "/plan/report", clip: ".report-view" },
  { name: "market-replay", path: "/drive", clip: ".drive-grid" },
  // Social card and PWA install screenshots: fixed frames, so no element crop.
  { name: "og-card", path: "/drive", viewport: { width: 1200, height: 630 }, out: SOCIAL_DIR },
  { name: "install-wide", path: "/championship/standings", viewport: { width: 1280, height: 720 }, out: SOCIAL_DIR },
  { name: "install-narrow", path: "/plan/approach", viewport: { width: 390, height: 844 }, out: SOCIAL_DIR }
];

async function main() {
  const servers: ChildProcess[] = [];
  let browser: Browser | undefined;

  try {
    if (manageServer && !(await isUp(webBaseUrl))) {
      servers.push(spawnWeb());
      await waitFor(webBaseUrl);
    }

    const fixture = buildSoloFixture();
    for (const dir of new Set(SHOTS.map((shot) => shot.out ?? outDir))) await mkdir(dir, { recursive: true });

    browser = await chromium.launch();
    const context = await browser.newContext({
      baseURL: webBaseUrl,
      deviceScaleFactor: scale,
      viewport: { width: 1440, height: 1000 }
    });
    await context.addInitScript(
      ([saveKey, languageKey, save, leagueId]) => {
        localStorage.clear();
        localStorage.setItem(languageKey!, "en");
        localStorage.setItem(saveKey!, save!);
        // Onboarding modals dim the whole page, so mark them all as already seen. Most are
        // scoped to the league id, hence the suffixed variants.
        localStorage.setItem("cr-league-help-profile-code", "1");
        for (const key of ["league-intro", "race", "plan", "garage"]) {
          localStorage.setItem(`cr-league-help-${key}`, "1");
          localStorage.setItem(`cr-league-help-${key}:${leagueId}`, "1");
        }
        // Tab preferences win over the URL, so pin them to what the shots expect.
        localStorage.setItem("cr-league-championship-record-tab", "standings");
        localStorage.setItem("cr-league-garage-panel", "shop");
        localStorage.setItem("cr-league-directive-step", "approach");
      },
      [SOLO_SAVE_KEY, LANGUAGE_KEY, JSON.stringify(fixture), SOLO_LEAGUE_ID] as const
    );

    const page = await context.newPage();
    await enterSolo(page);
    for (const shot of SHOTS) {
      console.log(`captured ${await capture(page, shot)}`);
    }
  } finally {
    await browser?.close();
    for (const server of servers) server.kill("SIGTERM");
  }
}

// The solo save is only read when the player picks Solo, and a full reload would drop the
// league back to the setup screen. So enter once, then move between screens client-side.
async function enterSolo(page: Page) {
  await page.goto("/drive", { waitUntil: "networkidle" });
  const solo = page.getByRole("button", { name: "Solo" });
  if (await solo.count()) await solo.first().click();
  await page.locator(".game-shell").waitFor({ state: "visible", timeout: 15_000 });
}

async function capture(page: Page, shot: Shot) {
  if (shot.viewport) await reframe(page, shot);
  await page.evaluate((path) => {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, shot.path);
  await hide(page, HIDE_ALWAYS);
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(400); // let entry animations settle before the frame is grabbed

  const path = `${shot.out ?? outDir}/${shot.name}.png`;
  if (!shot.clip) {
    await page.screenshot({ path });
    return path;
  }

  const target = page.locator(shot.clip).first();
  await target.waitFor({ state: "visible", timeout: 15_000 });
  const box = await target.boundingBox();
  if (!box) throw new Error(`${shot.name}: "${shot.clip}" has no bounding box.`);

  // Playwright has no padding option on locator screenshots, so widen the clip by hand.
  const pad = shot.padding ?? 16;
  const viewport = page.viewportSize() ?? { width: 1440, height: 1000 };
  const scroll = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
  await page.screenshot({
    path,
    fullPage: true,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: Math.min(box.width + pad * 2, Math.max(viewport.width, scroll.width) - Math.max(0, box.x - pad)),
      height: Math.min(box.height + pad * 2, Math.max(viewport.height, scroll.height) - Math.max(0, box.y - pad))
    }
  });
  return path;
}

// The app picks its layout on mount, so a resized frame needs a reload and a fresh entry.
// deviceScaleFactor stays at --scale, hence the doubled pixel sizes in the manifest.
async function reframe(page: Page, shot: Shot) {
  await page.setViewportSize(shot.viewport!);
  await page.reload({ waitUntil: "networkidle" });
  await enterSolo(page);
}

async function hide(page: Page, selectors: string[]) {
  await page.evaluate((list) => {
    for (const selector of list) {
      for (const node of document.querySelectorAll<HTMLElement>(selector)) node.style.visibility = "hidden";
    }
  }, selectors);
}

function spawnWeb() {
  const port = new URL(webBaseUrl).port || "4873";
  return spawn("npm", ["run", "dev", "-w", "@cr-league/web", "--", "--host", "127.0.0.1", "--port", port], {
    stdio: ["ignore", "ignore", "inherit"],
    shell: process.platform === "win32"
  });
}

async function isUp(url: string) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1500) });
    return true;
  } catch {
    return false;
  }
}

async function waitFor(url: string) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await isUp(url)) return;
    await delay(500);
  }
  throw new Error(`Timed out waiting for ${url}.`);
}

function stringArg(flag: string, fallback: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

function numberArg(flag: string, fallback: number) {
  const value = Number(stringArg(flag, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

await main();
