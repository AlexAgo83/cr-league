## item_061_build_the_release_triggered_render_deploy_workflow - Build the release-triggered Render deploy workflow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Deploy automation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Without a gated deploy workflow, deploying means clicking in the Render dashboard, with no guarantee CI passed on what ships and no proof the new build actually took.

# Scope
- In:
  - Create .github/workflows/deploy-release.yml triggered on release published plus workflow_dispatch (tag input for the fallback), permissions contents: read + deployments: write.
  - Step 1 — contract check: fail unless the release tag equals v<root package.json version> at the release SHA (logics-manager pattern).
  - Step 2 — CI gate: poll the CI workflow run conclusion for the release SHA via gh run list until success, with a 30-minute deadline (electrical-plan-editor pattern); never re-run tests.
  - Step 3 — trigger deploys: curl --fail-with-body -X POST the two Render deploy hook secrets, API first, then web.
  - Step 4 — verify: poll the production /health up to 30x10s until its version equals the tag (strip the v), creating a GitHub Deployment and marking it in_progress then success/failure (cp-wc-26 pattern verbatim); fail the workflow on timeout or version mismatch.
  - Document the production /health URL as a workflow env var at the top of the file, not hardcoded mid-script.
- Out:
  - Web-side post-deploy verification beyond the hook POST succeeding (static site has no health endpoint).
  - Notifications (Teams/Slack) — can be added later following the electrical-plan-editor teams-release-notification pattern.
  - Configuring the repository secrets (operator action, listed in the contract doc).

# Acceptance criteria
- AC1: Publishing a release whose CI failed (or has not finished within the deadline) never POSTs a deploy hook.
- AC2: A tag/package.json version mismatch fails the workflow before any gate.
- AC3: The workflow ends success only when production /health reports the released version; the GitHub Deployment reflects the same outcome.
- AC4: workflow_dispatch with a tag input reproduces the full flow for an existing release.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Publishing a release whose CI failed (or has not finished within the deadline) never POSTs a deploy hook.
- request-AC7 -> This backlog slice. Proof: AC2: A tag/package.json version mismatch fails the workflow before any gate.
- request-AC9 -> This backlog slice. Proof: AC3: The workflow ends success only when production /health reports the released version; the GitHub Deployment reflects the same outcome.
- request-AC10 -> This backlog slice. Proof: AC4: workflow_dispatch with a tag input reproduces the full flow for an existing release.
- request-AC5 -> This backlog slice. Evidence needed: GET /health on the API returns the application version read from package.json, and the value matches the root package.json version in a unit test.
- request-AC8 -> This backlog slice. Evidence needed: A release contract document (docs/) states the flow — bump version in root and workspace package.json together, add changelogs/CHANGELOGS_X_Y_Z.md, tag vX.Y.Z, publish the GitHub Release — and lists the two repository secrets to configure (the Render deploy hook URLs).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_007_ci_and_release_pipeline_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_036_github_ci_render_blueprint_and_release_contract`
- Primary task(s): `task_037_orchestrate_ci_render_blueprint_and_release_contract`

# AI Context
- Summary: Build the release-triggered Render deploy workflow
- Keywords: scaffolded-backlog, build the release-triggered render deploy workflow, implementation-ready
- Use when: Implementing the scaffolded slice for Build the release-triggered Render deploy workflow.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_037_orchestrate_ci_render_blueprint_and_release_contract`

# Notes
- Task `task_037_orchestrate_ci_render_blueprint_and_release_contract` was finished via `logics-manager flow finish task` on 2026-07-15.
