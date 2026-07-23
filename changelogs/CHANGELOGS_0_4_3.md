# CHANGELOGS 0.4.3

Chrono race balance hardening and release gate fixes.

## Balance

- Made the balance simulation runner use the real circuit parameters when calling the race engine: track length, laps, pit-lane position, and circuit speed profile now match race execution.
- Added a CI balance gate that checks circuit spread and pit-strategy spread before a release can go green.
- Rebalanced pit strategy impact so heavy, standard, and mini pit packs stay closer without removing their distinct tradeoffs.
- Rechecked `circuit_canal_loop` with real circuit inputs; the observed outlier was from the measurement runner, not from a catalog-specific track definition.

## Fixes

- Fixed the high-severity `find-my-way` audit finding through the lockfile update.
- Shortened the CI balance gate to a release-smoke configuration so it validates the contract without making the Quality lane too slow.

## Validation

- `npm audit --audit-level=high`
- `npm run balance:gate`
- `npm run typecheck`
- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`
- `npm run logics:validate`
