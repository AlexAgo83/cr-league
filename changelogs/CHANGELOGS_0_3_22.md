# CR League 0.3.22
Release date: 2026-07-20

## Added
- Added direct race-result verdicts so reports explain why a plan worked or failed and what to try next.
- Clarified first-GP actions with one recommended CTA and cleaner plan/chrono vocabulary.
- Added email-backed profile recovery with neutral self-service re-issue copy.
- Tightened mobile modal/replay controls, including compact launch-GP dialogs and responsive replay close text.
- Added the branded home splash with `PRESS START`, animated transparent CR/League title assets, deep-link bypass, black desktop fill, and compact EN/FR language controls.

## Changed
- Updated the roadmap to mark shipped chains as shipped and keep only the next three active corpora as ready to dev.
- Refreshed splash title PNGs from violet-matte sources with alpha transparency and compressed palette output.
- Integrated compatible Dependabot maintenance for GitHub Actions v7 and `@fontsource/barlow-condensed` 5.3.0.

## Fixed
- Improved replay suspense by hiding payoff until replay completion or an explicit skip.
- Fixed displayed GP lap labels so reports and replay markers respect the circuit lap count.
- Added and closed Logics chains through post-splash polish, then scaffolded ready-to-dev corpora for plan risk/readability, non-winning success feedback, and beta support hardening.
- Deferred incompatible major Dependabot bumps that require separate migrations: ESLint 10 with `eslint-plugin-jsx-a11y`, Vite React plugin 6 with Vite 8, and Prisma 7 datasource/client configuration.
- Kept release package versions aligned across root, API, web, shared, and `package-lock.json`.
