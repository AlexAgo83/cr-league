# CR League 0.3.9
Release date: 2026-07-19

## Added
- Added URL-backed navigation for cockpit screens, Plan directive tabs, Garage tabs, and persistent sub-screens.
- Added a comeback credit bonus and made Garage inventory choices more actionable.

## Changed
- Updated package versions to `0.3.9` across root, web, API, and shared workspaces.
- Split the web app shell into focused onboarding, setup, admin console, and race-flow modules.
- Made the displayed web app version follow `packages/shared/package.json` instead of a hardcoded constant.

## Fixed
- Added a secured admin operations console gated by profile email.
- Added cartography-backed circuit generation and improved circuit catalog maps.
- Added Monaco city circuits and refreshed city circuit naming.
- Randomized season circuit calendars so new seasons vary their championship route.
- Added a simulated playtest runner and recorded 0.4 playtest evidence.
- Polished circuit tiles, current-round badges, championship record panels, and directive choice readability.
- Kept internal workspace dependency versions aligned with `0.3.9`.
- Split large API and web test files into smoke, admin/profile, fixtures, and helper modules.
- Split circuit route data modules and added circuit generator scripts.
- Added admin CORS preflight coverage and e2e coverage for result shortcuts.
