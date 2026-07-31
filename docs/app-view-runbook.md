# Looking at the app

How to open CR League in a real browser to check something — a layout, a measurement, an animation,
a failure mode. The point is to answer questions by measuring rather than by reading the code and
hoping.

Two tools:

- `npm run view` — screenshot named screens. Reach for this first.
- `scripts/viewKit.ts` — the library behind it, for anything a screenshot cannot answer.

Both start the web dev server themselves if it is not already up, and leave it running if it was.
No API or database needed: the campaign screens come from a deterministic solo save built in
`scripts/screenshotFixture.ts`.

## Screenshots

```bash
npm run view                              # every screen, desktop, into reports/view/
npm run view -- stand duel                # just these two
npm run view -- --viewport phone          # 390x844 (also: laptop, desktop)
npm run view -- duel --headed             # watch the browser do it
npm run view -- stand --out /tmp/shots    # somewhere else
```

Screens: `home`, `stand`, `plan`, `chrono`, `championship`, `calendar`, `garage`, `circuit`,
`chrono-replay`, `arcade`, `duel`, `wheel`.

Each names the flow that reaches it, so nobody has to rediscover which button opens the chrono
replay. Adding one is a few lines in `SCREENS` in `scripts/view.ts`.

`reports/` is gitignored. Marketing and social assets are a different job — that is
`npm run capture:screenshots`, which writes committed files.

## Measuring, watching, breaking

For everything else, import the kit and write a ten-line script. Put it in `scripts/` (it needs the
repo's `tsx` and tsconfig to resolve `./screenshotFixture.js` and the shared engine), name it
`_scratch-*.ts` so a stray one is obvious, and delete it when the question is answered.

```ts
import { openApp } from "./viewKit.js";

const view = await openApp({ state: "campaign", viewport: "phone" });
await view.goto("/drive");

// Measure instead of eyeballing: do these two line up?
console.log(await view.box(".duel-tanks"), await view.box(".duel-calls"));

// Sample a value over time — a camera transform, an emote that pops for a second, an FPS reading.
console.log(await view.watch(`document.querySelector(".circuit-camera")?.getAttribute("transform")`, { forMs: 8000 }));

await view.shot("check.png");
await view.close();
```

The session gives you `page` (raw Playwright), `goto`, `click`, `shot`, `probe`, `box`, `watch` and
`close`.

### Fault injection

`block` fails matching requests, which is how the empty-Stand bug was found: block the route chunk
and count what is still on screen.

```ts
const view = await openApp({ block: [/circuitRoutes\/data/i] });
console.log(await view.probe(`Array.from(document.querySelectorAll("button")).filter((b) => b.getBoundingClientRect().height > 0).length`));
```

Match `circuitRoutes/data`, not `circuitRoutes` — in dev the module itself lives at
`circuitRoutes/index.ts`, and blocking it takes the whole app down instead of the data.

## Four traps, all of them met the hard way

**`page.evaluate(fn)` throws `__name is not defined`.** `tsx` compiles with esbuild's `keepNames`,
which wraps functions in a `__name` call the page does not have. Pass expressions as **strings**.
`probe`, `box` and `watch` already do.

**Never reload to change screen.** A reload drops the solo save back to the setup screen. `goto`
pushes state and fires `popstate`, which is how the app navigates.

**`page.goto` wipes localStorage.** `openApp` seeds storage in an init script, and that script runs
on *every* load — so navigating by URL resets anything the app saved. A first check of a
"don't show this again" box passed through the address bar and reported the box did nothing. Do
anything about persistence inside the app: `goto()`, `click()`, the game's own navigation.

**A campaign starts at `/drive`, not `/`.** `/` is the splash, which holds everything behind a
press-start. `fresh` sessions do start at `/`, since the splash is the thing being looked at.

## When a screenshot is not the answer

- **Is it the same width?** `box()` both and compare numbers. "Looks aligned" has been wrong before.
- **Does it still move?** `watch()` the attribute. A camera that pumps between two zooms looks fine
  in a still frame.
- **Does it survive?** `block()` what it depends on.
- **Would a test have caught it?** If the answer matters twice, it belongs in a test rather than in
  a script that gets deleted. `apps/web/src/features/arcade/DuelView.test.tsx` started as one of
  these scripts.
