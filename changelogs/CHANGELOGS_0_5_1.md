# CHANGELOGS 0.5.1

Patch release for the 0.5 gameplay-depth phase.

## Highlights

- Expanded the city-circuit corpus after `v0.5.0`, including Bastia plus additional European, African, and Oceanian rounds.
- Added and verified world-region coverage for the new countries and tightened late-circuit gameplay categories.
- Fixed local dev host defaults so browser assets, service worker cache cleanup, and API calls consistently use the IPv4 localhost path.
- Fixed the Playwright private-league mock to cover both `localhost` and `127.0.0.1`, restoring the CI E2E lane after the dev host hardening.

## Circuit Catalogue

- Added new rounds across Africa and Oceania: Auckland, Wellington, Melbourne, Brisbane, Perth, Cairo, Nairobi, Kigali, Dakar, Tunis, Casablanca, Accra, Addis Ababa, Lagos, and Maputo.
- Added extra European city circuits including Bastia.
- Added country flags and region mappings for the newly introduced countries.
- Regenerated circuit water-review evidence and rechecked new layouts visually.

## Release

- Bumped root, workspace, and lockfile versions to `0.5.1`.
- Prepared the `v0.5.1` release after local validation and CI verification.

## Validation

- `npm audit --omit=dev --audit-level=high`
- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:coverage`
- `npm run build`
- `npm run test:e2e -- --project=chromium`
- `npm run balance:gate`
- `npm run logics:validate`
- `npm run audit:circuits`
- `logics-manager release validate 0.5.1`
