# CHANGELOGS 0.3.8

Race learning and first-session economy polish for CR League.

Covers work started after `0.3.7`.

## Highlights

- Added a post-race payoff recap with finish, position movement, points, credits, and consumed cards.
- Added a dynamic chrono report in Plan with best time, current grid slot, latest gap, remaining attempts, session history, and setup guidance.
- Made chrono session history navigable by reopening a selected qualifying replay from Plan.
- Moved the chrono report into its own Plan sub-screen so it does not crowd the main plan tuning view.
- Added weather ambience on circuit maps and replay maps.
- Added live event labels next to the affected car during replay moments.
- Started new human teams with credits and no starter card, so the first card becomes an intentional garage choice.
- Reframed the three preparation choices as tire prep in the race plan UI.

## Engineering

- Updated API league creation, joining, and restart flows for the starter-credit economy.
- Updated API and web tests around explicit card buying, chrono reports, and tire-prep copy.
- Kept the implementation on existing `QualifyingRun`, `RaceResult`, card shop, and replay data instead of adding new persistence.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test -- App`
- `npm test -- apps/api/src/app.test.ts`
