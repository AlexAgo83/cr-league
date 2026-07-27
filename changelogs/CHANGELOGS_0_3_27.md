# CR League 0.3.27
Release date: 2026-07-22

## Added
- Migrated Plan and map briefing surfaces from the old three-trait read to the five engine stats: Pace, Control, Reliability, Weather, and Aggression.

## Changed
- Improved empty chrono guidance so first-time users understand grid impact and setup comparison before locking.
- Polished race-info modals with Weather, Stats, and Legends subscreens.
- Updated package versions to `0.3.27` across root, web, API, and shared workspaces.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:55432/cr_league?schema=cr_league POSTGRES_INTEGRATION=1 npm run db:deploy`

## Fixed
- Reworked the Plan briefing into a contextual GP read covering circuit, forecast, current plan, and next action.
- Updated garage and race car rendering to use selected skins, livery effects, tighter asset framing, and explicit skin selection.
- Kept internal workspace dependency versions aligned with `0.3.27`.
- Updated transitive dependency lock data to clear the high-severity `fast-uri` audit finding.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:55432/cr_league?schema=cr_league POSTGRES_INTEGRATION=1 npm test -- apps/api/src/app.postgres.test.ts`
