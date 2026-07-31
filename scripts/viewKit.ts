// Opening the app in a browser to look at it, without rewriting the same 50 lines every time.
//
// Everything here was learned the hard way from throwaway scripts: entering a solo save, moving
// between screens without a reload, reading a box, watching a value change, and the `__name` trap
// that makes page.evaluate(fn) throw. See docs/app-view-runbook.md.
import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, type Page } from "@playwright/test";
import { buildSoloFixture, SOLO_LEAGUE_ID, SOLO_SAVE_KEY, LANGUAGE_KEY } from "./screenshotFixture.js";

export const WEB_BASE_URL = process.env.WEB_BASE_URL ?? "http://127.0.0.1:4873";

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1180, height: 760 },
  phone: { width: 390, height: 844 }
} as const;
export type ViewportName = keyof typeof VIEWPORTS;

/**
 * `campaign` seeds the deterministic solo save and opens it — the Stand, Plan, Championship and
 * Garage screens, and everything reachable from them. `fresh` is an empty browser: the splash, the
 * mode choice and the arcade games, which need no save.
 */
export type ViewState = "campaign" | "fresh";

export type OpenOptions = {
  state?: ViewState;
  viewport?: ViewportName;
  locale?: "fr" | "en";
  /** URL patterns to fail, for looking at the app when something does not load. */
  block?: RegExp[];
  /** Where screenshots land. Created on demand. */
  out?: string;
  headed?: boolean;
};

export type ViewSession = {
  page: Page;
  /** Screenshot the viewport, or one element if a selector is given. Returns the path written. */
  shot: (name: string, selector?: string) => Promise<string>;
  /** Evaluate an expression in the page. Pass a string, not a function — see `evaluateExpression`. */
  probe: <T = unknown>(expression: string) => Promise<T>;
  /** Rounded rect of a selector, or null when it is not on screen. */
  box: (selector: string) => Promise<{ left: number; top: number; right: number; bottom: number; width: number; height: number } | null>;
  /** Sample an expression over time; returns every distinct value seen, in order. */
  watch: <T = unknown>(expression: string, options?: { everyMs?: number; forMs?: number }) => Promise<T[]>;
  /** Change screen without a reload — a reload would drop the solo save back to the setup screen. */
  goto: (path: string) => Promise<void>;
  /** Click the first visible button whose accessible name matches. */
  click: (name: string | RegExp) => Promise<void>;
  close: () => Promise<void>;
};

/**
 * page.evaluate(fn) fails in this repo: tsx compiles with esbuild's keepNames, which wraps every
 * function in a `__name` call that does not exist in the page. Expressions are passed as strings
 * for that reason, and every helper below funnels through here.
 */
export async function evaluateExpression<T>(page: Page, expression: string): Promise<T> {
  return page.evaluate(`(() => (${expression}))()`) as Promise<T>;
}

export async function openApp(options: OpenOptions = {}): Promise<ViewSession> {
  const { state = "campaign", viewport = "desktop", locale = "fr", block = [], out = "reports/view", headed = false } = options;
  const servers = await ensureWeb();
  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext({ baseURL: WEB_BASE_URL, viewport: VIEWPORTS[viewport] });

  await context.addInitScript(
    initScript,
    [SOLO_SAVE_KEY, LANGUAGE_KEY, locale, state === "campaign" ? JSON.stringify(buildSoloFixture()) : "", SOLO_LEAGUE_ID] as const
  );
  for (const pattern of block) await context.route(pattern, (route) => route.abort());

  const page = await context.newPage();
  // Straight to /drive for a campaign: "/" is the splash, which holds everything behind a
  // press-start the seeded flow has no reason to sit through.
  await page.goto(state === "campaign" ? "/drive" : "/", { waitUntil: "networkidle" });
  if (state === "campaign") await enterCampaign(page, locale);

  const session: ViewSession = {
    page,
    shot: async (name, selector) => {
      const path = name.includes("/") ? name : `${out}/${name}`;
      await mkdir(dirname(path), { recursive: true });
      const target = selector ? page.locator(selector).first() : page;
      await target.screenshot({ path });
      return path;
    },
    probe: (expression) => evaluateExpression(page, expression),
    box: (selector) =>
      evaluateExpression(
        page,
        `(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) return null;
          const rect = node.getBoundingClientRect();
          return { left: Math.round(rect.left), top: Math.round(rect.top), right: Math.round(rect.right), bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height) }; })()`
      ),
    watch: async (expression, { everyMs = 200, forMs = 6000 } = {}) => {
      const seen: unknown[] = [];
      for (let elapsed = 0; elapsed < forMs; elapsed += everyMs) {
        const value = await evaluateExpression(page, expression);
        const encoded = JSON.stringify(value);
        if (encoded !== JSON.stringify(seen.at(-1))) seen.push(value);
        await delay(everyMs);
      }
      return seen as never[];
    },
    goto: async (path) => {
      await page.evaluate(`window.history.pushState(null, "", ${JSON.stringify(path)}); window.dispatchEvent(new PopStateEvent("popstate"));`);
      await delay(900);
    },
    click: async (name) => {
      await page.getByRole("button", { name }).first().click();
      await delay(700);
    },
    close: async () => {
      await browser.close();
      for (const server of servers) server.kill("SIGTERM");
    }
  };
  return session;
}

/** Walks the mode choice down to an opened solo save. The one flow every campaign screen sits behind. */
async function enterCampaign(page: Page, locale: "fr" | "en") {
  const steps = locale === "fr" ? [/Solo/i, /Campagne/i, /^Emplacement 1:/] : [/Solo/i, /Campaign/i, /^Slot 1:/];
  for (const step of steps) {
    const button = page.getByRole("button", { name: step });
    if (await button.count()) {
      await button.first().click();
      await delay(500);
    }
  }
  await page.locator(".game-shell").waitFor({ state: "visible", timeout: 15_000 });
}

const initScript = ([saveKey, languageKey, locale, save, leagueId]: readonly [string, string, string, string, string]) => {
  localStorage.clear();
  localStorage.setItem(languageKey, locale);
  if (save) localStorage.setItem(saveKey, save);
  // Onboarding modals dim the whole page. Most are scoped to the league id, hence the suffixes.
  localStorage.setItem("cr-league-help-profile-code", "1");
  for (const key of ["league-intro", "race", "plan", "garage"]) {
    localStorage.setItem(`cr-league-help-${key}`, "1");
    localStorage.setItem(`cr-league-help-${key}:${leagueId}`, "1");
  }
};

async function ensureWeb(): Promise<ChildProcess[]> {
  if (await isUp(WEB_BASE_URL)) return [];
  const port = new URL(WEB_BASE_URL).port || "4873";
  const server = spawn("npm", ["run", "dev", "-w", "@cr-league/web", "--", "--host", "127.0.0.1", "--port", port], {
    stdio: ["ignore", "ignore", "inherit"],
    shell: process.platform === "win32"
  });
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await isUp(WEB_BASE_URL)) return [server];
    await delay(500);
  }
  throw new Error(`Timed out waiting for ${WEB_BASE_URL}.`);
}

async function isUp(url: string) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1500) });
    return true;
  } catch {
    return false;
  }
}
