# Runtime Performance Checks

Use this when the app feels heavier while it runs. It is manual on purpose and is not part of CI.

## Rules Before Any Measurement

1. **Never judge FPS on the dev server.** `jsxDEV` and React DEV validation eat 25-30% of CPU there. The dev build reads ~10x heavier than the real one. Frame numbers only count against a production build.
2. **Throttle the CPU.** An M-series Mac hides everything. `--cpu-throttle 4` ~ a decent phone, `10` ~ a low-end Android, `20` ~ the floor where the replay collapses.
3. **The noise floor is about ±10% FPS between identical runs.** Never claim a win from one before/after pair. Run each side twice, and ignore the first window of each run (cold JIT + first paint).
4. **Judge a change on `Main ms/frame`, not on FPS.** FPS is capped by vsync (nothing shows below the cap) and swings ±20% between identical runs. Main-thread ms per frame is stable to a few percent and is what a slow device multiplies: 1.6 ms/frame here is ~16 ms/frame on a device 10x slower, which is the whole 60 fps budget.

## FPS And Frame Timing

```bash
# 1. production build served locally (the mock API lives on 127.0.0.1:4874)
VITE_API_BASE_URL=http://127.0.0.1:4874 npm run build -w @cr-league/web
npm run preview -w @cr-league/web -- --port 4899

# 2. play a real 6-car race with a real replay trace and sample frames
npx tsx scripts/perf-browser-runtime.ts --mode fps --cycles 4 --cpu-throttle 10 \
  --no-server --url http://localhost:4899 --report reports/perf/replay-fps.md
```

`npm run perf:fps` is the shorthand for the dev server (leak signal only — the FPS numbers there are meaningless, see rule 1).

The `fps` mode differs from the leak modes: it simulates a real race with `simulateRace` and feeds it to the mocked API, so the map animates a full field over a real trace instead of the two-car stub. It reports:

- `Main ms/frame` and its `Script` / `Layout` / `Style` split, from the CDP cumulative counters divided by the frames in the window. This is the number to compare across runs.
- `FPS`, `Avg ms`, `P95 ms`, `Worst ms`, `Jank %` (share of frames over 32 ms) per window.
- `Top Self Time`: the CDP sampling profile aggregated by function, which is the shortlist of what to optimise. `(program)` is raster/compositor work, not JS — when it dominates, the fix is paint complexity (filters, masks, blend modes), not faster JavaScript.

Useful flags: `--window 3` (seconds per sample window), `--cycles`, `--cpu-throttle`.

Note for anything injected into the page (`addInitScript`, `page.evaluate`): pass it as a **string**, not a function. tsx/esbuild rewrites named functions with a `__name` helper that does not exist in the browser, and the injected code dies silently.

## Browser Runtime Smoke

```bash
npm run perf:browser -- --cycles 8
```

The script starts the web app if needed, mocks the API, plays repeated private-league GP cycles, forces browser GC between samples, and writes:

- `reports/perf/browser-runtime.md`
- `reports/perf/browser-runtime.json`

Useful options:

```bash
npm run perf:browser -- --cycles 12 --report reports/perf/replay-leak.md
npm run perf:browser:attached -- --url http://127.0.0.1:4873 --cycles 8
npm run perf:replay -- --cycles 20
```

Read the sample table first:

- `Heap MB`: retained JS heap after forced GC.
- `Nodes`: retained DOM nodes.
- `Listeners`: browser event listeners.
- `Long task ms`: accumulated main-thread stalls.
- `Transfer MB`: network transfer since page load.

For leak hunting, compare the first and last cycle. A steady rise in heap plus nodes/listeners usually points to retained UI state or uncleared listeners. A heap-only rise often points to cached route/replay/simulation data.

`perf:replay` uses the same instrumentation but stays on the replay screen and repeatedly toggles replay controls. Use it when growth looks tied to timers, animations, SVG cars, replay camera, or event handlers.

## Compare Two Runs

```bash
npm run perf:compare -- reports/perf/before.json reports/perf/after.json
```

Optional report file:

```bash
npm run perf:compare -- reports/perf/before.json reports/perf/after.json --report reports/perf/compare.md
```

The compare command only reads existing JSON reports. It gives a coarse `better`, `stable`, or `worse` verdict from heap, DOM node, and listener growth.

## Bundle Snapshot

```bash
npm run perf:bundle
```

This reads `apps/web/dist`, builds first if needed, and writes:

- `reports/perf/bundle.md`
- `reports/perf/bundle.json`

Use it to see the total shipped weight, largest files, and JS/CSS/image/font split.

## API Simulation Smoke

```bash
npm run perf:api -- --cycles 100
```

This runs the shared race simulation directly, serializes each result, forces GC before and after, and writes:

- `reports/perf/api-runtime.md`
- `reports/perf/api-runtime.json`

Use it to track simulation duration, result JSON size, and retained Node memory without involving the database.

## Current Baseline

Measured 2026-07-30 on a production build (`vite preview`), 6-car race with a real replay trace,
median of 14 two-second windows across two passes (first window of each pass dropped).

Main-thread cost per frame, the number to track:

| Throttle | Main ms/frame | Script | Layout | Style |
| --- | --- | --- | --- | --- |
| 1x | 1.56 | 0.43 | 0.22 | 0.12 |
| 10x | 18.2 | 6.6 | 3.0 | 1.4 |

The 10x column is the 1x column times the throttle, which is the point: on a device 10x slower the
replay spends its entire frame budget on the main thread. Roughly 1.8 ms of that is the replay
republishing state 10 times a second (`REPLAY_STATE_UPDATE_SECONDS`); publishing at 2.5 Hz instead
measured 1.42 ms/frame (-14%), at the cost of a chunkier live tower. The rest is spread thin enough
that no single call site stands out.

Frames, `--mode fps`:

| CPU throttle | Median FPS | Jank (frames > 32 ms) | Worst frame |
| --- | --- | --- | --- |
| 1x | 120 (vsync) | 0% | 58 ms (replay open) |
| 4x | 120 (vsync) | 0% | 143 ms (replay open) |
| 10x | 54 | 5-6% | ~350 ms (replay open) |
| 20x | 16 | 100% | 817 ms |

In the sampling profile, `(program)` (raster, compositing, throttle stalls) is 60% of self time at 10x
and the garbage collector 6.6%; no app function passes 5%. There is no hotspot to delete — the cost is
spread across the whole frame, so only structural changes (publishing less often, drawing less) move it.

Memory, production build, no leak found:

- 8 GP cycles: heap +1.1 MB, DOM nodes +41, listeners -5.
- 8 replay-control cycles: heap +2.6 MB, nodes flat at 605 after the first open, listeners oscillating 539-580.
- The 2026-07-27 "replay leak" reading was the one-time cost of opening the replay, not growth per cycle.

Bundle:

- Total `apps/web/dist`: 7.82 MB across 367 files (images 5.83 MB, JS 1.28 MB, fonts 0.48 MB).
- Real first load: ~1.4 MB over ~90 requests.
- Largest: `circuit-routes` chunk 455 KB raw / 98 KB gz (loaded on the home screen because the attract
  map draws a route, after first paint), then `crl/report-victory.webp` 210 KB.
- Run `rm -rf apps/web/dist` before a bundle snapshot: `perf:bundle` measures the folder as it finds
  it, and stale files from an earlier build inflate every number.

API simulation, 200 cycles:

- Average resolve 1.88 ms, P95 2.5 ms, max 7.35 ms.
- Average result JSON 112 KB, of which `replayTrace` is 90 KB. League state keeps traces for the two
  most recent races only (`TRACE_HISTORY_LIMIT` in `leagueState.ts`), so a 10-race season answers with
  400 KB instead of 1.12 MB.

## Interpreting A Run

| Signal | Reading |
| --- | --- |
| `(program)` dominates self time | Paint/raster bound: SVG filters, masks, blend modes, layer size. |
| `(garbage collector)` above ~5% | Per-frame allocation in the animation path. |
| One app function above ~3% | Real JS hotspot, worth a targeted fix. |
| Worst frame only in the first window | Cold start, not a steady-state problem. |
| Nodes/listeners rising every cycle | Retention. Nodes flat after the first open is normal. |
