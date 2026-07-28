# CR League 0.8.0
Release date: 2026-07-29

## Added
- Added per-circuit team statistics: wins, races and best finish are derived from Grand Prix history, and the best qualifying time is stored per team on a new `teams.circuitRecords` column. Stats show as a quiet line in the circuit calendar and as a detail panel on the circuit preview map.
- Added a landscape splash background served to wide screens through an art-directed `<picture>`, with the portrait key art kept for phones.
- Added a social card and PWA install screenshots, wired to Open Graph and Twitter meta tags and to the `screenshots` key of the web manifest.
- Added dedicated hero art for each race outcome and a shared visual for destructive confirmations.
- Added `npm run capture:screenshots`, which regenerates the marketing screenshots from a deterministic solo save without an API or a database.
- Added `npm run playtest:solo`, the first playtest that exercises the Solo loop end to end through the shared engine.
- Added a close button to the four-step league intro carousel and a back control on the Solo/Multiplayer and profile choice screens.

## Changed
- Components now read the translator from context instead of receiving it as a prop, removing it from 41 files.
- The Solo/Multiplayer, profile and league choice steps drop the paper surface for a dark panel, gain icons, and lay out in two columns on wide screens.
- Board icons ship as 128px WebP instead of 256px PNG, and the finish flag matches its render size.
- The setup screens now display the animated circuit background that was previously rendered and hidden by CSS.
- The saved league card pulls the eye with an accent glow that stops on hover and under `prefers-reduced-motion`.
- Restricted `engines` to Node 20, moved `@types/nodemailer` to devDependencies, and pinned the web `connect-src` policy to the API origin.

## Fixed
- Fixed championship standings showing teams in creation order in Solo: the table now ranks by points instead of trusting the array order, which only the API guaranteed. Ties keep the incoming order, matching `seasonStandings` in the shared domain.
- Fixed a dead end where entering the multiplayer setup left no way back to the Solo/Multiplayer choice.
- Fixed the empty garage inventory being clipped by a stale rule that stretched its icon to a full-width 16/9 block.
- Fixed the boot-time saved league restore raising a technical error modal when the API is unreachable; stale claims are still cleared.
- Fixed the race report showing celebration art regardless of the finishing position.
- Fixed the French race report duplicating "Stand de course" as both kicker and title.
- Removed the winner comparison card from the race report, along with its now-unused helper and translation keys.
- Removed nine unreferenced image assets and the dead car sprite field that kept one of them alive.
- Repaired the browser playtest harness, which had been silently failing since the Solo entry screen shipped, and a strict-mode locator that reported a passing check as failed.

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run balance:gate`
- `npm run test:e2e -- --project=chromium`
- `POSTGRES_INTEGRATION=1 npx vitest run apps/api/src/app.postgres.test.ts`
- `npm run logics:validate`
