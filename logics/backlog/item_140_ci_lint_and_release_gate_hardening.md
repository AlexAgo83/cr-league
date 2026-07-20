## item_140_ci_lint_and_release_gate_hardening - CI, lint, and release-gate hardening
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 99
> Confidence: 95
> Progress: 100
> Complexity: Low
> Theme: Engineering infrastructure
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- No automated dependency scanning exists despite a SECURITY.md; unit-test coverage is invisible; the React app is linted without react-hooks or jsx-a11y rules; a stuck Render deploy ends the release workflow with a warning instead of a failure; Node 20 is pinned in CI and Render but not in package.json; reports/ is gitignored yet holds a force-committed file.

# Scope
- In:
  - Add a Dependabot config for npm and github-actions ecosystems plus an npm audit gate (high severity and above) in the CI quality lane.
  - Enable vitest coverage collection and surface the summary in CI output.
  - While in vitest.config.ts, scope jsdom to web tests (environmentMatchGlobs) with node as the default environment for api/shared suites.
  - Add eslint-plugin-react-hooks (recommended) and eslint-plugin-jsx-a11y (recommended) scoped to the web app, fixing or explicitly justifying every violation they surface.
  - Make the deploy-release health-poll exit non-zero when the deployed version/commit never matches, marking the GitHub deployment as failed.
  - Declare engines.node >= 20 in the root package.json.
  - Resolve the reports/ policy: un-ignore reports/playtest/ explicitly or relocate the committed evidence under docs/ and keep reports/ fully ignored.
- Out:
  - CodeQL or SAST beyond dependency scanning.
  - Coverage thresholds that block CI on day one (surface first, gate later).
  - Restructuring the CI workflow topology.

# Acceptance criteria
- AC1: Dependabot and the npm audit gate are active and CI fails on new high-severity advisories.
- AC2: Coverage output appears in CI for the unit lanes.
- AC3: Lint enforces react-hooks and jsx-a11y rules and the codebase passes.
- AC4: A health-version mismatch fails the release workflow and the GitHub deployment status.
- AC5: engines is declared and the reports/ gitignore policy has no tracked exception.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: Dependabot and the npm audit gate are active and CI fails on new high-severity advisories.
- request-AC9 -> This backlog slice. Proof: AC2: Coverage output appears in CI for the unit lanes.
- request-AC3 -> This backlog slice. Evidence needed: restartLeague executes atomically inside runWrite so an injected mid-sequence failure leaves the previous league state intact, with a test proving no league can end up without a current Grand Prix.
- request-AC4 -> This backlog slice. Evidence needed: The admin token comparison is constant-time and localhost CORS origins are absent from the production origin set, verified by tests or config assertions.
- request-AC5 -> This backlog slice. Evidence needed: App.tsx drops below ~700 lines by extracting domain hooks (league, profile, admin, plan form) and view containers, the rejoin effect has correct dependencies or an explicit mount guard, the rejoin logic exists once, the seven command-clicked booleans collapse into one structure, and all existing web tests still pass.
- request-AC6 -> This backlog slice. Evidence needed: ReplayView.tsx is split into a useReplayClock hook and separate scrubber/tower/stage files with no behavior change pinned by the existing replay tests.
- request-AC7 -> This backlog slice. Evidence needed: A CI lane runs integration tests against a real Postgres service covering concurrent qualifying submissions, the resolve transition claim, and the credit-guarded card purchase; the unit lane no longer advertises an unused DATABASE_URL.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-20 partial implementation: added Node >=20 engines, Dependabot for npm and GitHub Actions, npm audit --audit-level=high in CI quality, removed the misleading global DATABASE_URL from CI, and made deploy-release fail on health version/commit mismatch. Deferred in this item: coverage reporting, react-hooks/jsx-a11y lint plugins, and reports/ gitignore policy.
- 2026-07-20 completion wave: react-hooks rules and jsx-a11y recommended lint are enabled, the surfaced a11y issues were fixed locally, Vitest coverage uses V8 text/json-summary and CI unit lanes collect coverage, and reports/ ignore policy now distinguishes the committed playtest report from generated/local artifacts. item_140 is implementation-complete pending req_058 closeout validation.
- 2026-07-20 release dependency triage: Dependabot's compatible GitHub Actions v7 bumps and `@fontsource/barlow-condensed` 5.3.0 were integrated into the release branch. ESLint 10 / `@eslint/js` 10, `@vitejs/plugin-react` 6, and Prisma 7 are intentionally deferred because they fail install or generation without broader ecosystem migrations.
- 2026-07-20 release gate follow-up: the v0.3.22 Render API deploy reached correct `/health` shortly after the 3-minute polling window. The release workflow now allows 10 minutes before failing the versioned health gate.
- 2026-07-20 release gate follow-up 2: GitHub Actions kept receiving HTTP-success non-JSON health bodies while external `/health` returned the correct JSON. The workflow now follows redirects, asks for JSON explicitly, and logs a short non-JSON body prefix for diagnosis.
- 2026-07-20 release gate follow-up 3: the body was valid health JSON but the `jq` parse check false-negative'd in the runner. The release gate now matches the version and commit substrings directly against the health response.

# Links
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`
- Primary task(s): `task_059_orchestrate_repo_review_remediation_pass_5`

# AI Context
- Summary: CI, lint, and release-gate hardening
- Keywords: scaffolded-backlog, ci, lint, and release-gate hardening, implementation-ready
- Use when: Implementing the scaffolded slice for CI, lint, and release-gate hardening.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-20 closeout proof: Dependabot and npm audit gate are configured; Vitest coverage uses V8 output and CI unit lanes collect coverage; eslint enforces react-hooks and jsx-a11y with current lint clean; release health mismatch exits non-zero; package.json declares Node >=20; reports ignore policy is explicit. Verification in this pass: rtk npm run typecheck and rtk npm run lint passed.
- 2026-07-20 release dependency proof: GitHub Actions v7 and `@fontsource/barlow-condensed` 5.3.0 were applied. Deferred Dependabot majors were checked against CI logs/dry-runs: ESLint 10 conflicts with the current jsx-a11y peer range, `@vitejs/plugin-react` 6 requires Vite 8, and Prisma 7 rejects the current datasource `url` schema configuration.
- 2026-07-20 release gate proof: production `/health` returned `0.3.22` and `3eec53da21418de36d332ab479dca6a0f6e1a192`; deploy-release.yml now polls the API health gate for 60 attempts at 10-second intervals.
- 2026-07-20 release gate proof 2: deploy-release.yml health fetches now use `curl --location` with `Accept: application/json` and emit a bounded body prefix when JSON parsing fails.
- 2026-07-20 release gate proof 3: deploy-release.yml no longer depends on `jq` for health parsing; it accepts the release only when the health body contains the exact release version and commit fields.

# Tasks
- `task_059_orchestrate_repo_review_remediation_pass_5`

# Notes
- Task `task_059_orchestrate_repo_review_remediation_pass_5` was finished via `logics-manager flow finish task` on 2026-07-20.
