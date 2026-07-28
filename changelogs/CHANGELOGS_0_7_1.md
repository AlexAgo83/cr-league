# CR League 0.7.1
Release date: 2026-07-28

## Fixed
- Removed an unused shared-engine test import that made the GitHub CI lint job fail on `v0.7.0`.

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npx vitest run packages/shared/src/domain/leagueEngine.test.ts apps/api/src/app.test.ts apps/api/src/app.postgres.test.ts apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/app/soloStorage.test.ts apps/web/src/i18n/index.test.ts --environment jsdom`
