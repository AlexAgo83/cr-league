# CHANGELOGS 0.4.4

Replay, garage, and race-flow polish release.

## Replay and Map

- Smoothed replay launch movement and kept cars on the grid during the start hold.
- Fixed replay clock authority so cars no longer jump forward and freeze during early replay playback.
- Shared the map stats collapsed state with replay maps and moved race gaps into the race-follow panel.
- Improved replay focus behavior, including car-click focus in replay focus mode.
- Tuned car drift visuals, tire contact marks, headlight halos, and rear brake lights.
- Fixed mobile replay info panel layout and map action highlight regressions.

## Garage

- Added credit-priced cosmetic car purchases with locked-state visuals in the garage.
- Added bot garage progression: bots now start on free cars, buy paid cars when they can afford them, and rotate available skins at season rollover.
- Kept cosmetic car unlocks scoped per team/league rather than global profile ownership.

## Race Flow and Reports

- Cleared consumed plan cards before the next Grand Prix to avoid stale selected-card UI.
- Added race-follow overtake notifications and corrected replay gap timing values.
- Cleaned race recap wording to make result causes and next-GP advice easier to read.
- Removed stale GP rewards panel exposure from the plan flow.

## Validation

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `logics-manager lint --require-status`
- `logics-manager audit --group-by-doc`
