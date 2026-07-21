# CHANGELOGS 0.3.26

Map, Plan, replay, garage, and beta admin polish.

Covers work shipped after `0.3.25`.

## Highlights

- Added a GP report tab in Plan, including empty-state guidance, race review access, and a compact report header.
- Reworked chrono and GP map panels with plan/config assets, cleaner mobile layouts, final classification actions, and replay report links.
- Polished replay presentation with improved race/chrono wording, player gap panels, car masks, motion-only wheel trails, and smaller non-focus map cars.
- Improved Plan chrono/history cells, empty chrono confirmation copy, highlighted next actions, and mobile two-column chrono stats.
- Added admin filters, pagination, and guarded test-data cleanup for beta support.

## Engineering

- Updated package versions to `0.3.26` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.26`.
- Added regression coverage for map rendering, replay/chrono routing, admin cleanup, and report layout behavior.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run logics:validate`
