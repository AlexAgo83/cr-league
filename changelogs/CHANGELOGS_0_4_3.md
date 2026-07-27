# CR League 0.4.3
Release date: 2026-07-23

## Added
- None.

## Changed
- Rebalanced pit strategy impact so heavy, standard, and mini pit packs stay closer without removing their distinct tradeoffs.

## Fixed
- Made the balance simulation runner use the real circuit parameters when calling the race engine: track length, laps, pit-lane position, and circuit speed profile now match race execution.
- Added a CI balance gate that checks circuit spread and pit-strategy spread before a release can go green.
- Rechecked `circuit_canal_loop` with real circuit inputs; the observed outlier was from the measurement runner, not from a catalog-specific track definition.
- Fixed the high-severity `find-my-way` audit finding through the lockfile update.
- Shortened the CI balance gate to a release-smoke configuration so it validates the contract without making the Quality lane too slow.
