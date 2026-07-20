## item_140_ci_lint_and_release_gate_hardening - CI, lint, and release-gate hardening
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90
> Confidence: 85
> Progress: 0
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

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

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
