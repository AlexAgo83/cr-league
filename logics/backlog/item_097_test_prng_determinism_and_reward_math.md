## item_097_test_prng_determinism_and_reward_math - Test PRNG determinism and reward math
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Test coverage
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The deterministic PRNG that every simulation output depends on has no unit tests.
- The credit/points reward branches in classify (fleet sponsorship bonus, economy-mode top-4 bonus) are never asserted, so balance regressions would ship silently.

# Scope
- In:
  - Add prng tests: same seed yields the same sequence, different seeds diverge, and pickWeighted handles zero and all-zero weights via its fallback path.
  - Add reward tests asserting exact credits and points for a sponsorship participant and for economy-mode finishers at position 4 versus position 5.
  - Keep both as plain vitest files next to the code under test.
- Out:
  - Testing weather resolution, narrative events, or flavor text.
  - Property-based testing frameworks or coverage tooling.

# Acceptance criteria
- AC1: PRNG tests fail if determinism or the weighted-pick fallback breaks.
- AC2: Reward tests pin the exact credit and points values for the sponsorship and economy-mode branches.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: PRNG tests fail if determinism or the weighted-pick fallback breaks.
- request-AC7 -> This backlog slice. Proof: AC2: Reward tests pin the exact credit and points values for the sponsorship and economy-mode branches.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_015_repo_review_remediation_pass_3_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility`
- Primary task(s): `task_045_orchestrate_repo_review_remediation_pass_3`

# AI Context
- Summary: Test PRNG determinism and reward math
- Keywords: scaffolded-backlog, test prng determinism and reward math, implementation-ready
- Use when: Implementing the scaffolded slice for Test PRNG determinism and reward math.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
