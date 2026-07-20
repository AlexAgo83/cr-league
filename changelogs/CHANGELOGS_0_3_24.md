# CHANGELOGS 0.3.24

Setup background and trait-color polish.

Covers work shipped after `0.3.23`.

## Highlights

- Removed the decorative setup page background assets behind Profile and League setup screens.
- Unified stat colors across the map stat panel and Plan screen: Grip is green, Attack/Overtaking is orange, and Energy is yellow.
- Colored the active directive step summary by category so Approach, Tire prep, Pit strategy, and Card selections are easier to scan.

## Engineering

- Updated package versions to `0.3.24` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.24`.
- Kept the changes CSS-scoped; no gameplay, API, or database changes.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run logics:validate`
