# CHANGELOGS 0.3.9

Navigation, admin operations, and circuit polish for CR League.

Covers work started after `0.3.8`.

## Highlights

- Added URL-backed navigation for cockpit screens, Plan directive tabs, Garage tabs, and persistent sub-screens.
- Added a secured admin operations console gated by profile email.
- Added cartography-backed circuit generation and improved circuit catalog maps.
- Added Monaco city circuits and refreshed city circuit naming.
- Randomized season circuit calendars so new seasons vary their championship route.
- Added a comeback credit bonus and made Garage inventory choices more actionable.
- Added a simulated playtest runner and recorded 0.4 playtest evidence.
- Polished circuit tiles, current-round badges, championship record panels, and directive choice readability.

## Engineering

- Updated package versions to `0.3.9` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.9`.
- Split the web app shell into focused onboarding, setup, admin console, and race-flow modules.
- Split large API and web test files into smoke, admin/profile, fixtures, and helper modules.
- Split circuit route data modules and added circuit generator scripts.
- Made the displayed web app version follow `packages/shared/package.json` instead of a hardcoded constant.
- Added admin CORS preflight coverage and e2e coverage for result shortcuts.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e -- --project=chromium`
- `npm run logics:validate`
