# Runtime Performance Checks

Use this when the app feels heavier while it runs. It is manual on purpose and is not part of CI.

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

## Current Baseline

Local smoke on 2026-07-27 with 3 GP cycles:

- Heap growth: 1.8 MB.
- DOM node growth: 44.
- Listener growth: 25.
- No extra network transfer after initial load.

This is small but confirms the right signal exists for longer runs.

Replay smoke on 2026-07-27 with 3 replay-control cycles:

- Heap growth: 3.8 MB.
- DOM node growth: 209.
- Listener growth: 126.
- No extra network transfer after initial load.

That points first at replay UI retention: timers, SVG nodes, camera/animation state, or event handlers.
