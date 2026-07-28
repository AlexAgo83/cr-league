# Screenshot Capture Runbook

This runbook covers the marketing screenshots in `docs/assets/readme`, regenerated from a
deterministic solo save rather than cropped by hand.

```bash
npm run capture:screenshots
```

## Why It Needs No Backend

Solo mode is entirely local: the league lives in `localStorage` under
`cr-league-solo-save-v1`. The script injects a save, forces the locale to English, enters
Solo once, then moves between screens client-side. It starts the web dev server if it is not
already running, and needs neither the API nor Postgres.

## The Fixture

`scripts/screenshotFixture.ts` builds the save with the shared engine — qualifying,
directive, resolution — for four Grand Prix, so the standings, palmares and history are real
simulation output that stays schema-valid for free. A hand-written JSON blob would drift from
the schema on the next change.

The closing Grand Prix is tuned so the player wins it. The report and replay shots are the
ones people look at, and a last place there sells nothing. The plan was picked by sweeping
the 45 approach x preparation x card combinations for a first place.

The league is named `Riverside Invitational`; the teams are the solo defaults (Volt Union
plus five bots).

## Adding or Changing a Shot

Shots are declared in `SHOTS` in `scripts/capture-screenshots.ts`:

```ts
{ name: "market-plan", path: "/plan/approach", clip: ".plan-view", padding: 16 }
```

- `path` is any app route from `apps/web/src/app/routes.ts`.
- `clip` is a CSS selector. Crops are element-scoped rather than pixel boxes so they survive
  layout changes; widths therefore vary per screen, which is the intended framing.
- `padding` defaults to 16 device-independent pixels around the element.

Omit `clip` for a full-viewport shot.

## Flags

| Flag | Default | Notes |
| --- | --- | --- |
| `--out` | `docs/assets/readme` | Output directory. |
| `--scale` | `2` | Device scale factor. `1.5` roughly halves the file size. |
| `--no-server` | off | Attach to an already running web server instead of spawning one. |

## Gotchas

- Onboarding modals dim the whole page and are scoped per league
  (`cr-league-help-league-intro:solo-local`, not the bare key). The script pre-marks them as
  seen; a new topic needs adding to that list.
- Tab preferences in `localStorage` win over the URL, so `championship-record-tab`,
  `garage-panel` and `directive-step` are pinned to what the shots expect.
- The storage keys are duplicated in `scripts/screenshotFixture.ts` because the real modules
  pull in browser-only code. A drift shows up immediately as screenshots of the splash
  screen.
- This is not wired into CI on purpose: a screenshot moving by a pixel must not fail a pull
  request.
