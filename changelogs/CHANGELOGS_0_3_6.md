# CHANGELOGS 0.3.6

Visual identity and mobile polish release for CR League.

## Highlights

- Applied the chalk-paper visual direction to the profile and pit wall setup screens.
- Refined mobile topbar behavior so it sticks flush to the top edge with only a bottom divider.
- Reordered profile menu controls and added the app version under the logout action.
- Made Garage open on the Shop tab by default.
- Replaced SVG race-map cars with raster car sprites, tinted by team livery.
- Added a pit wall background asset for setup screens.
- Kept mobile document pages on the app background instead of matching panel paper.

## Engineering

- Updated package versions to `0.3.6` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.6`.
- Added a release contract for Logics release gates.
- Updated e2e coverage for the current Garage default and mobile document backgrounds.

## Validation

- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run lint`
- `npm run test:e2e -- --project=chromium`
- `npm run logics:validate`
