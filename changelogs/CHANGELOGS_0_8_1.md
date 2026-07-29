# CR League 0.8.1
Release date: 2026-07-29

## Added
- Added three solo save slots with their own light index, so a new run no longer overwrites an existing season. Each slot shows its team, season and round, Grand Prix raced, points and last played date, and the slot played most recently glows like a saved league.
- Added an Arcade sub-mode beside the renamed Solo Campaign, opening a catalogue of short games.
- Added the Destiny Wheel, the first arcade game: enter up to sixteen names, race them through the existing simulation, and read the finishing order as the draw. Participants persist locally; the result does not.
- Added the same progress line to the multiplayer saved-league card: season and round, Grand Prix raced, points and last played date.
- Added the team's own car, tinted with its livery, to the save slots and the saved-league card, through a `TeamCar` component extracted from the garage.
- Added `solo-campaign`, `arcade` and `destiny-wheel` board icons and an arcade catalogue hero.

## Changed
- Solo no longer goes straight to a game: it opens on Campaign or Arcade. A first-time player still reaches a race in one click, since the slot picker is skipped when nothing is saved.
- Solo saves keep replay traces only for the two most recent resolved races. A measured four Grand Prix save weighed 557 KB, of which 344 KB were traces of races already run; three full slots now stay under 2.5 MB.
- `BoardIconName` is derived from a `BOARD_ICON_NAMES` array, so the icon existence test can no longer miss a newly declared icon.
- The replay accepts two optional opt-outs, `showPerformancePanel` and `towerTitleKey`, both defaulting to the existing behaviour.

## Fixed
- Fixed pressing start re-entering the last played league, which made the entry screen unreachable for a returning player. Starting the app no longer calls the API at all.
- Fixed the profile menu offering "Manage league" inside a solo game, where there is no league to manage.
- Fixed existing solo saves showing a generic icon after the car was added: a slot index written by an earlier build was trusted forever instead of being refreshed from the save.
- Fixed the save slot cells being unequal widths, their delete button rendering ink-on-ink and unreadable, and empty cells hanging their content from the top of a full-height cell.
- Fixed the dark choice panels leaving `--color-cockpit` at its paper value, which painted light input text on a light background.

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run test:e2e -- --project=chromium`
- `npm run logics:validate`
