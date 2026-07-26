## item_301_consolidate_diverged_simulation_util_helpers_into_shared_reconciled_under_test - Consolidate diverged simulation/util helpers into shared, reconciled under test
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 58%
> Complexity: Medium
> Theme: Architecture remediation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- lapForSegment has 3 different implementations (simulateRace.ts:794, chronoRaceEngine.ts:507, replayTrace.ts:173) and lapForProgress has 2 different roundings — off-by-one between engines.
- Speed-profile factor math (speedFactorAt/progressInSpan/expandedSpan) exists in replayMath.ts:428, qualifying.ts:207 and chronoRaceEngine.ts with min-or-max vs min-only divergence.
- strongestForecast, classificationScore, bestQualifyingRuns, safeHex and a sprawl of 5 clamps are duplicated, some divergent.

# Scope
- In:
  - Pick one implementation per helper, export from shared, and update all consumers.
  - For each genuinely divergent helper decide the correct behavior deliberately, document why, and add a test pinning it.
  - Collapse the clamp sprawl into one shared clamp(value,min,max,{round?}).
- Out:
  - Retuning the engine beyond choosing the single agreed behavior.
  - The replay-order derivation (next item).

# Acceptance criteria
- AC1: Each listed helper exists once in shared and is consumed everywhere.
- AC2: Each formerly-divergent helper is reconciled to one documented behavior with a test.
- AC3: Simulation determinism tests still pass.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Each listed helper exists once in shared and is consumed everywhere.
- request-AC6 -> This backlog slice. Proof: AC2: Each formerly-divergent helper is reconciled to one documented behavior with a test.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_074_cross_package_source_of_truth_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps`
- Primary task(s): `task_123_orchestrate_the_source_of_truth_remediation`

# AI Context
- Summary: Consolidate diverged simulation/util helpers into shared, reconciled under test
- Keywords: scaffolded-backlog, consolidate diverged simulation/util helpers into shared, reconciled under test, implementation-ready
- Use when: Implementing the scaffolded slice for Consolidate diverged simulation/util helpers into shared, reconciled under test.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
