## item_242_restore_cross_environment_determinism_in_weighted_selection - Restore cross-environment determinism in weighted selection
> From version: 0.4.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Simulation determinism
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- prng.ts:21 sorts weight keys with left.localeCompare(right); localeCompare depends on Node's ICU/locale build, so two environments can order keys differently and diverge for the same seed.
- This reintroduces the cross-environment non-determinism that the sort (req_099 item 235) was added to eliminate, and the current single-seed test would not catch it.

# Scope
- In:
  - Replace the localeCompare comparator with a byte-stable comparator (left < right ? -1 : left > right ? 1 : 0).
  - Add/extend a determinism test proving reordered-but-equal forecasts resolve identically for the same seed.
- Out:
  - Replacing the PRNG algorithm.
  - Changing weight values or the weather model.

# Acceptance criteria
- AC1: Weight keys are ordered by a locale-independent comparator.
- AC2: A test proves reordered-but-equal forecasts resolve identically for the same seed.
- AC3: Existing simulation tests stay green.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Weight keys are ordered by a locale-independent comparator.
- request-AC6 -> This backlog slice. Proof: AC2: A test proves reordered-but-equal forecasts resolve identically for the same seed.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_063_post_remediation_review_fixes_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth`
- Primary task(s): `task_101_orchestrate_post_remediation_review_fixes`

# AI Context
- Summary: Restore cross-environment determinism in weighted selection
- Keywords: scaffolded-backlog, restore cross-environment determinism in weighted selection, implementation-ready
- Use when: Implementing the scaffolded slice for Restore cross-environment determinism in weighted selection.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
