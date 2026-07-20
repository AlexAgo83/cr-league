# Beta Support Runbook

This runbook covers hosted beta support tasks for CR League operators.

## Daily checks

- Open the production web app and verify it loads.
- Check the API health endpoint:

```sh
curl -fsS "$VITE_API_BASE_URL/health"
```

- Confirm the reported `version` and `commit` match the expected release.
- Check Render service events for the API and web services after each deploy.

## Admin console

Required Render API variables:

- `ADMIN_EMAILS`: comma-separated operator emails that can open the admin console from the profile menu.
- `ADMIN_TOKEN`: bearer token required by `/admin/*` API routes.

Support flow:

1. Sign in with a profile email listed in `ADMIN_EMAILS`.
2. Open Profile menu -> Admin.
3. Enter `ADMIN_TOKEN`.
4. Use filters to find users by email/id or leagues by name/code/id/status.
5. Inspect a league before making destructive changes.

Admin list endpoints are bounded to 100 rows per page:

```sh
curl -fsS -H "Authorization: Bearer $ADMIN_TOKEN" "$API_BASE_URL/admin/users?page=1&limit=100&q=example"
curl -fsS -H "Authorization: Bearer $ADMIN_TOKEN" "$API_BASE_URL/admin/leagues?page=1&limit=100&q=TEST"
```

## Test-data cleanup

Use cleanup only for explicit test data. The API rejects missing confirmation and data that is not clearly marked as test/demo/qa/staging.

Profile cleanup accepts emails ending in `.test`, emails starting with `test@`, or `+test@` aliases. League cleanup accepts league names containing `test`, `demo`, `qa`, or `staging`, or codes beginning with `TEST`.

API example:

```sh
curl -fsS -X POST "$API_BASE_URL/admin/test-data-cleanup" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmation":"DELETE TEST DATA","profileIds":["profile_id"],"leagueIds":["league_id"]}'
```

Expected response:

```json
{
  "ok": true,
  "deleted": {
    "profiles": 1,
    "leagues": 1,
    "teams": 1,
    "grandPrixes": 1,
    "decisions": 0
  }
}
```

## Backup

Before broad beta maintenance, export the CR League schema from the Render PostgreSQL database. Use the production `DATABASE_URL` from Render, never from a committed file.

```sh
mkdir -p backups
pg_dump "$DATABASE_URL" --schema=cr_league --format=custom --file="backups/cr-league-$(date +%Y%m%d-%H%M%S).dump"
```

Keep backups outside the repo. Do not commit dumps or database URLs.

## Restore drill

Restore only into a non-production database unless production recovery has been explicitly approved.

```sh
createdb cr_league_restore
pg_restore --clean --if-exists --dbname="$RESTORE_DATABASE_URL" "backups/cr-league-YYYYMMDD-HHMMSS.dump"
npm run db:deploy
```

After restore:

```sh
curl -fsS "$RESTORE_API_BASE_URL/health"
POSTGRES_INTEGRATION=1 DATABASE_URL="$RESTORE_DATABASE_URL" npm test -- apps/api/src/app.postgres.test.ts
```

## Incident triage

1. Capture timestamp, affected profile email, league code/id, browser, and action attempted.
2. Check API health and Render logs for matching errors.
3. Use the admin console to inspect the profile/league state.
4. If data cleanup is needed, prefer explicit selected cleanup over manual database edits.
5. If restore is needed, stop and take a fresh backup before changing production data.

