# CR League 0.8.2
Release date: 2026-07-29

## Changed
- The arcade race now takes the whole map screen like a campaign race, through the same rules rather than a second set: 390x844 on a phone instead of 366x328, with the running order tucked under the replay controls.
- The profile button shows a menu glyph instead of falling back to "CR" when there is no team to take initials from.
- Campaign save slots are lighter on a phone: a 58px car instead of the desktop 92px, and rows that size to their content, which takes the list from 617px to 363px.

## Fixed
- Fixed the entry, solo and stand screens sitting against the left edge between 1040px and 600px. A media rule widened the setup grid to a single full-width track, and the capped panel aligned to its start; all eight setup grids are single-column, so the rule only ever hit the layout it broke.
- Fixed those same screens running under the fixed topbar on a short screen. At 740x360 the panel top sat at -2, above the viewport and unreachable, because plain centring overflows both ends.
- Fixed the save slot info lines wrapping on a 360px screen: the delete button's width was reserved on the whole copy column although the button only overlays the top-right corner.
- Fixed the circuit preview's close button rendering ink-on-ink over the dark map, a specificity tie that the later-loading paper rule won.
- Fixed the circuit preview controls sitting in a row across the top of a narrow map; they stack down the corner on a phone.
- Fixed the splash language switcher hanging on the left edge on a phone: the topbar grid is shaped for brand plus actions, and the splash has no brand.
- Fixed a new changelog staying invisible until the dev server was restarted, since the changelogs directory sits outside the Vite root and was not watched. Production was never affected.

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run test:e2e -- --project=chromium`
- `npm run logics:validate`
- `npm ci`, the install that failed on every CI lane for 0.8.1
