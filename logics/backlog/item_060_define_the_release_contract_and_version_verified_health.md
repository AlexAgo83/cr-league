## item_060_define_the_release_contract_and_version_verified_health - Define the release contract and version-verified health
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Release contract
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Nothing defines what a release IS for cr-league: no version discipline, no changelog gate, and /health cannot prove which build is running.
- The deploy verification gate (cp-wc-26 pattern) is impossible until /health reports a version.

# Scope
- In:
  - Expose the application version in GET /health, read once from the API package.json at startup, with a unit test asserting the field matches.
  - Keep root and workspace package.json versions in sync at the current version; add the check to the contract doc (and optionally a tiny npm script that diffs them).
  - Write docs/release-contract.md: version bump procedure, changelogs/CHANGELOGS_X_Y_Z.md requirement, tag vX.Y.Z convention, GitHub Release publication as the deploy trigger, required repository secrets (RENDER_API_DEPLOY_HOOK_URL, RENDER_WEB_DEPLOY_HOOK_URL), and the branch-protection check name (validate).
  - State the rollback procedure: re-publish the previous release (re-triggers hooks with the old tag) — verify this is truthful for Render deploy hooks and document accordingly.
- Out:
  - Automated version bumping or changelog generation.
  - Signing, provenance, or package publishing (nothing is published to a registry).

# Acceptance criteria
- AC1: GET /health returns { status, version } and the unit test pins version to the package.json value.
- AC2: docs/release-contract.md covers bump, changelog, tag, publish, secrets, and rollback, in under two pages.
- AC3: Root and workspace versions are identical after the change.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: GET /health returns { status, version } and the unit test pins version to the package.json value.
- request-AC8 -> This backlog slice. Proof: AC2: docs/release-contract.md covers bump, changelog, tag, publish, secrets, and rollback, in under two pages.
- request-AC10 -> This backlog slice. Proof: AC3: Root and workspace versions are identical after the change.
- request-AC4 -> This backlog slice. Evidence needed: The unit lane's total wall-clock is bounded by the slowest workspace, verified by three concurrent jobs in the Actions run; no lane waits on another lane's completion except the aggregator.
- request-AC6 -> This backlog slice. Evidence needed: deploy-release.yml triggers on release published (and workflow_dispatch fallback), verifies the tag equals v<package.json version>, polls the CI workflow conclusion for the release SHA until success (no test re-run), then POSTs RENDER_API_DEPLOY_HOOK_URL and RENDER_WEB_DEPLOY_HOOK_URL via curl --fail-with-body.
- request-AC7 -> This backlog slice. Evidence needed: After triggering the API hook, the workflow polls /health up to 30 times at 10-second intervals until the reported version equals the release tag, records a GitHub Deployment marked success or failure accordingly, and fails the run on timeout or mismatch.
- request-AC9 -> This backlog slice. Evidence needed: Workflows use least-privilege permissions (contents: read; deployments: write only where the Deployment is created) and reference no secrets in CI test jobs (dummy inline DATABASE_URL where Prisma generate needs one).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_007_ci_and_release_pipeline_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_036_github_ci_render_blueprint_and_release_contract`
- Primary task(s): `task_037_orchestrate_ci_render_blueprint_and_release_contract`

# AI Context
- Summary: Define the release contract and version-verified health
- Keywords: scaffolded-backlog, define the release contract and version-verified health, implementation-ready
- Use when: Implementing the scaffolded slice for Define the release contract and version-verified health.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_037_orchestrate_ci_render_blueprint_and_release_contract`

# Notes
- Task `task_037_orchestrate_ci_render_blueprint_and_release_contract` was finished via `logics-manager flow finish task` on 2026-07-15.
