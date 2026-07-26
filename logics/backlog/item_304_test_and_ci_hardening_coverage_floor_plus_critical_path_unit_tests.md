## item_304_test_and_ci_hardening_coverage_floor_plus_critical_path_unit_tests - Test and CI hardening: coverage floor plus critical-path unit tests
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Test coverage
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- vitest.config.ts measures coverage but enforces no threshold, so coverage can silently regress.
- lifecycle season-rollover + the (leagueId,season,round) concurrency guard, resolution standings/credit increments, and the comeback credit bonus are covered only via HTTP round-trips.

# Scope
- In:
  - Add coverage.thresholds to vitest.config.ts and gate it in the CI unit lane.
  - Add unit tests for season rollover + the concurrency guard (no double-credit on concurrent resolve), resolution standings/credit application, and the comeback bonus math + cap.
- Out:
  - Broad UI component test suites.
  - Changing the CI structure beyond the coverage gate.

# Acceptance criteria
- AC1: A coverage threshold is enforced in CI.
- AC2: Unit tests cover season rollover/concurrency, resolution standings/credits, and the comeback bonus.
- AC3: The suite passes deterministically.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: A coverage threshold is enforced in CI.
- request-AC6 -> This backlog slice. Proof: AC2: Unit tests cover season rollover/concurrency, resolution standings/credits, and the comeback bonus.
- request-AC3 -> This backlog slice. Evidence needed: Replay order/classification/gap derivation has one shared definition (moved beside replayTrace or emitted by the sim), and a golden/determinism test pins a fixed-seed trace's interpolated positions; replayMath is no longer an untested client re-derivation of the trace format.
- request-AC4 -> This backlog slice. Evidence needed: lifecycle.ts is decomposed by responsibility and App.tsx orchestration is extracted into per-domain hooks, with the store's public surface and all API responses unchanged (pure refactor, tests green).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_074_cross_package_source_of_truth_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps`
- Primary task(s): `task_123_orchestrate_the_source_of_truth_remediation`

# AI Context
- Summary: Test and CI hardening: coverage floor plus critical-path unit tests
- Keywords: scaffolded-backlog, test and ci hardening: coverage floor plus critical-path unit tests, implementation-ready
- Use when: Implementing the scaffolded slice for Test and CI hardening: coverage floor plus critical-path unit tests.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_123_orchestrate_the_source_of_truth_remediation`

# Notes
- Task `task_123_orchestrate_the_source_of_truth_remediation` was finished via `logics-manager flow finish task` on 2026-07-26.
