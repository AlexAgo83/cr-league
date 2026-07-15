# Release contract

CR League releases are promoted from immutable GitHub releases. Render auto deploy is disabled for both services, so production changes only after a release workflow dispatches the deploy hooks.

## Version and tag

1. Update `package.json`, `apps/api/package.json`, `apps/web/package.json`, and `packages/shared/package.json` to the same semver version.
2. Add a short changelog entry under `changelogs/`.
3. Commit the version and changelog update.
4. Create a tag named `v<package.json version>`, for example `v0.1.1`.
5. Publish a GitHub Release for that tag.

The release workflow rejects a tag that does not exactly match `v<package.json version>` at the release commit. The `/health` endpoint returns the same package version and commit SHA so the workflow can verify the API deployment.

## Required GitHub secrets

Configure these repository secrets before the first production release:

- `RENDER_API_DEPLOY_HOOK_URL`
- `RENDER_WEB_DEPLOY_HOOK_URL`

The CI workflow does not read production secrets. Render owns runtime secrets in the blueprint:

- `DATABASE_URL` comes from the managed Render PostgreSQL database.
- `WEB_ORIGIN` is entered in Render.
- `VITE_API_BASE_URL` is entered in Render.

## Release workflow

The `deploy-release.yml` workflow runs on published GitHub releases and can also be started manually with a `release_tag` input.

For each release it:

1. Resolves the release tag and commit SHA.
2. Verifies all workspace package versions match the tag.
3. Waits for the `CI` workflow to succeed on the release commit.
4. Creates a GitHub Deployment for the API service.
5. Calls the Render API deploy hook.
6. Polls production `/health` until the returned `version` equals the release tag without the leading `v` and `commit` equals the release SHA.
7. Calls the Render web deploy hook.
8. Marks the GitHub Deployment as `success` or `failure`.

## Rollback

Rollback is a new immutable release from the last known-good commit:

1. Create a new patch version from the known-good commit.
2. Add a changelog note explaining the rollback.
3. Tag and publish a new GitHub Release.

Do not retag or mutate an existing release. That breaks the version-to-health contract and makes production provenance ambiguous.
