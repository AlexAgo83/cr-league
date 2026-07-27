# CHANGELOGS 0.5.2

Patch release for the 0.5 gameplay-depth and beta-readiness phase.

## Highlights

- Added manual runtime performance tooling for replay, browser runtime, API hot paths, bundle sizing, and perf comparisons.
- Reduced shipped image payload by converting the finish-flag asset to WebP and verified production dist hygiene.
- Upgraded the active build/test toolchain around Vite, Vitest/jsdom, TypeScript node types, and Playwright Chromium support.
- Hardened credential handling by replacing persisted recovery proof with session-scoped credentials.
- Lazy-loaded the admin console view and documented release/pre-release script gate groups.
- Tuned weak reliability cards by moving `pit_relay` and `hard_tires` to the 120-credit tier.
- Closed the AI alpha seasons evidence run and cleared the roadmap for the 0.6 beta-season lifecycle corpus.
- Fixed missing product Mermaid diagrams and settled completed product briefs.

## Release

- Bumped root, workspace, and lockfile versions to `0.5.2`.
- Prepared the `v0.5.2` release after local validation and CI verification.

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
- `logics-manager release validate 0.5.2`
