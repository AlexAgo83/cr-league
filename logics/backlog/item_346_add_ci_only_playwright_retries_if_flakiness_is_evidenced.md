## item_346_add_ci_only_playwright_retries_if_flakiness_is_evidenced - Add CI-only Playwright retries if flakiness is evidenced
> From version: 0.6.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: CI hygiene
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- playwright.config.ts has no `retries` field configured (defaults to 0), and the CI e2e job runs a single attempt with no retry mechanism, so any transient flake fails the PR outright with no automatic recovery.

# Scope
- In:
  - Before making any change, check recent CI run history (e.g. via `gh run list`/`gh run view` on the e2e/CI workflow) for evidence of genuine intermittent test failures on the same commit across retried runs.
  - If real flakiness is found: add `retries: process.env.CI ? 2 : 0` (or similar, matching this repo's existing conventions) to playwright.config.ts, scoped to CI only — do not add retries to the local dev config or to vitest.
  - If no real flakiness is found in the available CI history: make no code change, and record in the closeout report that this slice was evaluated and skipped for lack of evidence, along with what was checked.
- Out:
  - Adding retries to vitest unit tests — unit-test flakiness should be fixed at the source, not retried.
  - Any retry mechanism beyond Playwright/CI.

# Acceptance criteria
- AC1: The implementer's closeout report states explicitly whether CI flakiness evidence was found and what was checked.
- AC2: If retries were added, they are scoped to CI only in playwright.config.ts and npm run test:e2e still passes locally with retries effectively disabled outside CI.
- AC3: If no evidence was found, no code change is made and the slice is recorded as evaluated-and-skipped.

# AC Traceability
- request-AC12 -> This backlog slice. Proof: AC1: The implementer's closeout report states explicitly whether CI flakiness evidence was found and what was checked.
- request-AC13 -> This backlog slice. Proof: AC2: If retries were added, they are scoped to CI only in playwright.config.ts and npm run test:e2e still passes locally with retries effectively disabled outside CI.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Add CI-only Playwright retries if flakiness is evidenced
- Keywords: scaffolded-backlog, add ci-only playwright retries if flakiness is evidenced, implementation-ready
- Use when: Implementing the scaffolded slice for Add CI-only Playwright retries if flakiness is evidenced.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
