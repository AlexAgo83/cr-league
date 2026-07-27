# CR League 0.3.8
Release date: 2026-07-18

## Added
- Made chrono session history navigable by reopening a selected qualifying replay from Plan.
- Added live event labels next to the affected car during replay moments.
- Started new human teams with credits and no starter card, so the first card becomes an intentional garage choice.
- Reframed the three preparation choices as tire prep in the race plan UI.
- Kept the mobile replay map full-screen by hiding the payoff recap during the focused replay view.
- Kept the implementation on existing `QualifyingRun`, `RaceResult`, card shop, and replay data instead of adding new persistence.

## Changed
- Added a post-race payoff recap with finish, position movement, points, credits, and consumed cards.
- Moved the chrono report into its own Plan sub-screen so it does not crowd the main plan tuning view.
- Updated package versions to `0.3.8` across root, web, API, and shared workspaces.
- Updated API league creation, joining, and restart flows for the starter-credit economy.

## Fixed
- Added a dynamic chrono report in Plan with best time, current grid slot, latest gap, remaining attempts, session history, and setup guidance.
- Added weather ambience on circuit maps and replay maps.
- Kept internal workspace dependency versions aligned with `0.3.8`.
- Updated API and web tests around explicit card buying, chrono reports, and tire-prep copy.
