# CHANGELOGS 0.3.7

Setup and release-readiness polish release for CR League.

Covers the changes shipped after `0.3.6`.

## Highlights

- Centered toast notifications at the bottom of setup and cockpit screens on desktop and mobile.
- Reduced oversized setup choice cards on both Profile and League entry screens.
- Restyled the saved-league selector so saved leagues read as cockpit cells instead of inactive grey blocks.
- Rewrote the Race Desk intro copy to make the private championship fantasy clearer.

## Engineering

- Updated package versions to `0.3.7` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.7`.
- Updated e2e setup flow coverage to acknowledge the recovery-code onboarding modal before league creation.
- Updated README, roadmap, and UI zone notes for the setup polish release.

## Validation

- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test`
- `npm run test:e2e -- --project=chromium`
- `npm run logics:validate`
