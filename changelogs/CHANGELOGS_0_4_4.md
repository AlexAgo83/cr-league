# CR League 0.4.4
Release date: 2026-07-24

## Added
- Added credit-priced cosmetic car purchases with locked-state visuals in the garage.
- Added bot garage progression: bots now start on free cars, buy paid cars when they can afford them, and rotate available skins at season rollover.
- Kept cosmetic car unlocks scoped per team/league rather than global profile ownership.
- Cleared consumed plan cards before the next Grand Prix to avoid stale selected-card UI.
- Cleaned race recap wording to make result causes and next-GP advice easier to read.

## Changed
- Smoothed replay launch movement and kept cars on the grid during the start hold.
- Shared the map stats collapsed state with replay maps and moved race gaps into the race-follow panel.
- Improved replay focus behavior, including car-click focus in replay focus mode.
- Tuned car drift visuals, tire contact marks, headlight halos, and rear brake lights.
- Removed stale GP rewards panel exposure from the plan flow.

## Fixed
- Fixed replay clock authority so cars no longer jump forward and freeze during early replay playback.
- Fixed mobile replay info panel layout and map action highlight regressions.
- Added race-follow overtake notifications and corrected replay gap timing values.
