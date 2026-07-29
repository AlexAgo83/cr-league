# Screenshot Capture Runbook

This runbook covers the marketing screenshots in `docs/assets/readme`, regenerated from a
deterministic solo save rather than cropped by hand.

```bash
npm run capture:screenshots
```

## Why It Needs No Backend

Solo mode is entirely local: the league lives in `localStorage` under
`cr-league-solo-slot-v1-0` (solo save slot 1). The script injects a save, forces the locale to English, enters
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

## What It Produces

| Shot | Output | Used by |
| --- | --- | --- |
| `market-*` | `docs/assets/readme` | The README product tour. |
| `og-card` | `apps/web/public/assets/social` | `og:image` in `apps/web/index.html`. |
| `install-wide`, `install-narrow` | `apps/web/public/assets/social` | `screenshots` in `manifest.webmanifest`. |

The social assets are served, so they live in the web app rather than the docs folder.

## Adding or Changing a Shot

Shots are declared in `SHOTS` in `scripts/capture-screenshots.ts`:

```ts
{ name: "market-plan", path: "/plan/approach", clip: ".plan-view", padding: 16 }
```

- `path` is any app route from `apps/web/src/app/routes.ts`.
- `clip` is a CSS selector. Crops are element-scoped rather than pixel boxes so they survive
  layout changes; widths therefore vary per screen, which is the intended framing.
- `padding` defaults to 16 device-independent pixels around the element.
- `viewport` overrides the frame for that shot; the page reloads and re-enters Solo, because
  the app picks its layout on mount.
- `out` overrides the output directory.

Omit `clip` for a full-viewport shot, which is what the social and install shots use.

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
- A shot with its own `viewport` gets its own browser context, because `deviceScaleFactor` is
  fixed per context. The social shots pin `scale: 1` so `og-card.png` lands on the canonical
  1200x630 rather than a doubled frame. Changing those means updating
  `manifest.webmanifest` and the `og:image:width`/`height` meta tags to match.
- `render.yaml` serves `/assets/*` as `immutable`, so a regenerated `og-card.png` will not
  propagate to scrapers on its own. Bump the `?v=` query on the `og:image` meta tag.
