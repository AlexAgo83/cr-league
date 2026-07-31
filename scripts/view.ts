// Screenshot named screens of the running app. The nine flows worth reaching are named here so
// nobody has to rediscover which button opens the chrono replay.
//
//   npm run view                          -- every screen, desktop
//   npm run view -- stand duel            -- just these
//   npm run view -- --viewport phone      -- narrow
//   npm run view -- duel --headed         -- watch it happen
//
// See docs/app-view-runbook.md. For anything beyond a screenshot, import ./viewKit.ts directly.
import { setTimeout as delay } from "node:timers/promises";
import { openApp, VIEWPORTS, type ViewportName, type ViewSession, type ViewState } from "./viewKit.js";

type Screen = {
  state: ViewState;
  /** Everything after the app has opened: navigate, click, wait. */
  reach?: (session: ViewSession) => Promise<void>;
};

const SCREENS: Record<string, Screen> = {
  home: { state: "fresh" },
  stand: { state: "campaign", reach: (view) => view.goto("/drive") },
  plan: { state: "campaign", reach: (view) => view.goto("/plan/approach") },
  chrono: { state: "campaign", reach: (view) => view.goto("/plan/chrono") },
  championship: { state: "campaign", reach: (view) => view.goto("/championship/standings") },
  calendar: { state: "campaign", reach: (view) => view.goto("/championship/calendar") },
  garage: { state: "campaign", reach: (view) => view.goto("/garage/shop") },
  circuit: {
    state: "campaign",
    reach: async (view) => {
      await view.goto("/championship/calendar");
      await view.page.locator(".circuit-calendar-button").first().click();
      await view.page.locator(".circuit-detail-screen .map-car").first().waitFor({ state: "visible", timeout: 15_000 });
      await delay(2000);
    }
  },
  "chrono-replay": {
    state: "campaign",
    reach: async (view) => {
      await view.goto("/plan/chrono");
      await view.click(/Revoir chrono|Review chrono/i);
      await delay(4000);
    }
  },
  arcade: {
    state: "fresh",
    reach: async (view) => {
      await view.click(/APPUYER START|PRESS START/i);
      await view.click(/Solo/i);
      await view.click(/Arcade/i);
    }
  },
  duel: {
    state: "fresh",
    reach: async (view) => {
      await SCREENS.arcade!.reach!(view);
      await view.click(/abattre|One to Beat/i);
      await view.click(/PRENDRE LE D|Line up/i);
      await delay(1200);
    }
  },
  wheel: {
    state: "fresh",
    reach: async (view) => {
      await SCREENS.arcade!.reach!(view);
      await view.click(/Roue du destin|Destiny Wheel/i);
    }
  }
};

const args = process.argv.slice(2);
// Flags that take a value, so their value is not mistaken for a screen name.
const VALUED_FLAGS = ["--viewport", "--out"];
const flag = (name: string, fallback: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? (args[index + 1] ?? fallback) : fallback;
};
const positional = args.filter((arg, index) => !arg.startsWith("--") && !VALUED_FLAGS.includes(args[index - 1] ?? ""));

const viewport = flag("--viewport", "desktop") as ViewportName;
const out = flag("--out", "reports/view");
const headed = args.includes("--headed");

if (!(viewport in VIEWPORTS)) throw new Error(`Unknown viewport "${viewport}". One of: ${Object.keys(VIEWPORTS).join(", ")}.`);
const unknown = positional.filter((name) => !(name in SCREENS));
if (unknown.length) throw new Error(`Unknown screen(s): ${unknown.join(", ")}. One of: ${Object.keys(SCREENS).join(", ")}.`);
const wanted = positional.length ? positional : Object.keys(SCREENS);

// One browser per state rather than per screen: opening a campaign save costs a few seconds.
for (const state of ["campaign", "fresh"] as const) {
  const screens = wanted.filter((name) => SCREENS[name]!.state === state);
  if (!screens.length) continue;
  for (const name of screens) {
    const view = await openApp({ state, viewport, out, headed });
    try {
      await SCREENS[name]!.reach?.(view);
      console.log(await view.shot(`${name}-${viewport}.png`));
    } finally {
      await view.close();
    }
  }
}
