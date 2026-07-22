# AI App Test Runbook

This runbook is for an AI agent validating CR League after code changes.

## Baseline Checks

Run these before claiming the app is healthy:

```bash
npm run typecheck
npm test
npm run build
```

For replay or simulation changes, add:

```bash
npm run test:e2e
npm run balance:sim -- --runs 300 --limit 10 --json reports/balance/latest.json
npm run playtest:ai -- --agents 50 --seasons 3 --rounds 6 --report docs/audits/playtest-ai.md --json docs/audits/playtest-ai.json
```

For circuit route changes, add:

```bash
npm run audit:circuits
npm run review:circuits:water
```

## Local Runtime

Start both services:

```bash
npm run dev
```

Open:

```text
http://localhost:4873/
```

API health:

```bash
curl http://127.0.0.1:4874/health
```

If the API fails with a missing Prisma column, run migrations:

```bash
npm run db:migrate
```

## API Smoke Flow

With the API running:

```bash
npm run smoke:league
```

This creates a league, rejoins it, updates settings, joins another team, submits a plan, resolves a GP, verifies guarded errors, and advances to the next GP.

For heavier API workflow pressure without browser checks:

```bash
npm run playtest:simulate -- --players 20 --rounds 3
```

## Visual QA Checklist

Use desktop and mobile widths. Capture screenshots when changing UI layout, replay, modals, maps, assets, cards, or responsive behavior.

Minimum routes:

- Profile creation and rejoin.
- League creation, join, rejoin, settings, restart, and next GP.
- Plan screen: Circuits tab by default, chrono attempts, plan validation, card selection, API loading feedback.
- Replay chrono and replay race: speed starts at `x1`, cars stay on the track, race director is visible, toasts appear in French and English, ranking layout is not hidden on mobile.
- Report: GP summary is compact and aligned.
- Championship: standings, palmares, GP history, replay old GP.
- Garage: header image, livery, inventory, shop, card details modal.
- Circuits: map bounds, title and close controls, start line and pit marker.

Visible regressions to reject:

- Text overlapping controls or cards.
- Replay cars teleporting, starting off-grid, or accelerating to catch an impossible position.
- Chrono replay car speed obviously different from race replay on the same circuit.
- Missing asset placeholders/loaders.
- Card images cropped differently between Plan, Inventory, and Shop.
- Mobile replay controls covering ranking or director content.

## Replay Trace Checks

If a race result JSON is available:

```bash
npm run replay:validate -- race-result.json
```

For replay changes, inspect the generated trace, not only the animation. The replay should render what the trace says; do not hide trace problems with client interpolation.

Check:

- `replayTrace[0]` starts on the grid.
- final `times` match the classification order.
- car `trackProgress` increases smoothly except valid pit-stop holds.
- pit-stop phases appear in the trace before the replay tries to show a stop.
- order changes appear in `replayFacts.orderChanges`.
