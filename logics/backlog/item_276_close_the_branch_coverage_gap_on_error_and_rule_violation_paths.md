## item_276_close_the_branch_coverage_gap_on_error_and_rule_violation_paths - Close the branch-coverage gap on error and rule-violation paths
> From version: 0.4.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Test coverage
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Overall branch coverage is 61.92% while line coverage is 71.45%.
- The gap is concentrated in error and rule-violation branches of the leagues store and simulation that success-path tests never hit.
- Uncovered failure branches are exactly where regressions hide.

# Scope
- In:
  - Identify the highest-value uncovered branches from coverage-summary (leagues store rule violations, simulation edge branches).
  - Add targeted unit tests that exercise those failure and rule-violation branches with real assertions.
  - Re-run coverage to confirm the branch percentage rises meaningfully.
- Out:
  - Weakening assertions or skipping tests to inflate the number.
  - Changing production code beyond what a genuine bug found while testing requires.
  - Adding a coverage-threshold CI gate (out of scope for this pass).

# Acceptance criteria
- AC1: New tests cover previously-uncovered error and rule-violation branches with real assertions.
- AC2: Overall branch coverage rises meaningfully toward line coverage.
- AC3: The full suite passes with no skipped or weakened tests.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: New tests cover previously-uncovered error and rule-violation branches with real assertions.
- request-AC5 -> This backlog slice. Proof: AC2: Overall branch coverage rises meaningfully toward line coverage.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_067_repo_review_maintainability_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_115_repo_review_maintainability_follow_up`
- Primary task(s): `task_116_orchestrate_repo_review_maintainability_follow_up`

# AI Context
- Summary: Close the branch-coverage gap on error and rule-violation paths
- Keywords: scaffolded-backlog, close the branch-coverage gap on error and rule-violation paths, implementation-ready
- Use when: Implementing the scaffolded slice for Close the branch-coverage gap on error and rule-violation paths.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
