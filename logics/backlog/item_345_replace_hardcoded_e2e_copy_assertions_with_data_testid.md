## item_345_replace_hardcoded_e2e_copy_assertions_with_data_testid - Replace hardcoded E2E copy assertions with data-testid
> From version: 0.6.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Test resilience
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- tests/e2e/private-league.spec.ts hard-asserts exact UI copy dozens of times (button names, menu labels, toast text) for structural/navigational purposes. This already broke once this session: a 'League controls' -> 'Race direction' button rename broke an E2E assertion that had nothing to do with testing that specific copy string, purely because the locator matched on translated text.

# Scope
- In:
  - Add data-testid attributes to structural/navigational elements in the web app that the E2E suite currently locates by exact text (profile menu buttons, nav tabs, modal triggers) — scope this to the elements tests/e2e/private-league.spec.ts actually locates today, not a speculative blanket pass over the whole UI.
  - Update the corresponding Playwright locators in tests/e2e/private-league.spec.ts to use the new data-testid attributes instead of getByRole/getByText matching on translated copy, wherever the test is checking that the element exists/works structurally rather than checking the copy itself.
  - Keep text-based assertions only where the test is specifically verifying that a translation/copy string renders correctly (e.g. a test whose actual purpose is confirming localized text appears) — do not blanket-replace every text assertion.
- Out:
  - Adding data-testid to elements not currently referenced by the E2E suite.
  - Rewriting the E2E suite's test scenarios or coverage beyond swapping locator strategy.
  - Changing any translation/copy string itself.

# Acceptance criteria
- AC1: Structural/navigational Playwright locators in tests/e2e/private-league.spec.ts use data-testid rather than translated copy, except where the test is specifically about copy correctness.
- AC2: npm run test:e2e passes.
- AC3: A subsequent rename of one of the newly-data-testid'd elements' copy would not break the corresponding test (spot-checked by the implementer, e.g. by temporarily renaming a label locally and confirming the relevant test still passes).

# AC Traceability
- request-AC11 -> This backlog slice. Proof: AC1: Structural/navigational Playwright locators in tests/e2e/private-league.spec.ts use data-testid rather than translated copy, except where the test is specifically about copy correctness.
- request-AC13 -> This backlog slice. Proof: AC2: npm run test:e2e passes.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Replace hardcoded E2E copy assertions with data-testid
- Keywords: scaffolded-backlog, replace hardcoded e2e copy assertions with data-testid, implementation-ready
- Use when: Implementing the scaffolded slice for Replace hardcoded E2E copy assertions with data-testid.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
