# Release contract

CR League releases are promoted from immutable GitHub releases. Render auto deploy is disabled for both services, so production changes only after a release workflow dispatches the deploy hooks.

## Version and tag

1. Update `package.json`, `apps/api/package.json`, `apps/web/package.json`, and `packages/shared/package.json` to the same semver version.
2. Update the `@cr-league/shared` dependency in `apps/api/package.json` and `apps/web/package.json` to that same version. The pin is exact, so it does not follow the bump on its own.
3. Run `npm install` to refresh `package-lock.json`, then verify with `npm ci`, not `npm install`. `npm install` rewrites the lockfile to make itself pass; `npm ci` refuses a lockfile that disagrees with the manifests, which is what CI runs. A stale pin makes every CI lane fail at install, before a single test runs, with `404 '@cr-league/shared@<old>' is not in this registry`.
4. Add a short changelog entry under `changelogs/`.
5. Commit the version, lockfile and changelog update.
6. Create a tag named `v<package.json version>`, for example `v0.1.1`.
7. Wait for the `CI` workflow on that commit to succeed.
8. Publish a GitHub Release for that tag.

CI runs `npm run test:coverage`, not `npm test`. Instrumentation makes tests several times slower, so a test that is comfortable locally can pass the 5s per-test timeout on a runner. Reproduce timing failures with `npm run test:coverage`.

The release workflow rejects a tag that does not exactly match `v<package.json version>` at the release commit. The `/health` endpoint returns the same package version and commit SHA so the workflow can verify the API deployment.

## Required GitHub secrets

Configure these repository secrets before the first production release:

- `RENDER_API_DEPLOY_HOOK_URL`
- `RENDER_WEB_DEPLOY_HOOK_URL`

The CI workflow does not read production secrets. Render owns runtime secrets in the blueprint:

- `DATABASE_URL` is entered in Render and points to the existing `alex-db` PostgreSQL database with `?schema=cr_league`.
- `WEB_ORIGIN` is entered in Render.
- `VITE_API_BASE_URL` is entered in Render.

Runtime secrets beyond the release deploy hooks are documented in [runtime configuration](runtime-configuration.md).


## Release workflow

The `deploy-release.yml` workflow runs on published GitHub releases and can also be started manually with a `release_tag` input.

For each release it:

1. Resolves the release tag and commit SHA.
2. Verifies all workspace package versions match the tag.
3. Verifies that `CI` has already succeeded on the release commit; it does not occupy a runner while CI is still running.
4. Creates a GitHub Deployment for the API service.
5. Calls the Render API deploy hook.
6. Polls production `/health` for up to 10 minutes until the returned `version` equals the release tag without the leading `v` and `commit` equals the release SHA.
7. Calls the Render web deploy hook.
8. Marks the GitHub Deployment as `success` or `failure`.

## Rollback

Rollback is a new immutable release from the last known-good commit:

1. Create a new patch version from the known-good commit.
2. Add a changelog note explaining the rollback.
3. Tag and publish a new GitHub Release.

Do not retag or mutate an existing release. That breaks the version-to-health contract and makes production provenance ambiguous.
