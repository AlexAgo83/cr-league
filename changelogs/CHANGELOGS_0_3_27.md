# CHANGELOGS 0.3.27

Plan readability, five-stat briefing, garage skins, and race-info polish.

Covers work shipped after `0.3.26`.

## Highlights

- Migrated Plan and map briefing surfaces from the old three-trait read to the five engine stats: Pace, Control, Reliability, Weather, and Aggression.
- Reworked the Plan briefing into a contextual GP read covering circuit, forecast, current plan, and next action.
- Improved empty chrono guidance so first-time users understand grid impact and setup comparison before locking.
- Polished race-info modals with Weather, Stats, and Legends subscreens.
- Updated garage and race car rendering to use selected skins, livery effects, tighter asset framing, and explicit skin selection.

## Engineering

- Updated package versions to `0.3.27` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.27`.
- Updated transitive dependency lock data to clear the high-severity `fast-uri` audit finding.

## Validation

- `npm ci`
- `npm audit --audit-level=high`
- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run logics:validate`
- `npm test -- --coverage packages/shared`
- `npm test -- --coverage apps/api`
- `npm test -- --coverage apps/web`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:55432/cr_league?schema=cr_league POSTGRES_INTEGRATION=1 npm run db:deploy`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:55432/cr_league?schema=cr_league POSTGRES_INTEGRATION=1 npm test -- apps/api/src/app.postgres.test.ts`
- `npm run test:e2e -- --project=chromium --trace=retain-on-failure`
- `npm run build`
