## prod_063_post_remediation_review_fixes_product_brief - Post-Remediation Review Fixes Product Brief
> Date: 2026-07-23
> Status: Proposed
> Related request: `req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth`
> Related backlog: `item_242_restore_cross_environment_determinism_in_weighted_selection`, `item_243_pin_positiondelta_wiring_and_align_trace_tiebreak_with_classification`, `item_244_close_the_account_enumeration_oracle_on_profile_creation`, `item_245_deepen_replay_validator_and_prng_determinism_tests`, `item_246_resolve_residual_invariant_and_units_assumptions`
> Related task: `task_101_orchestrate_post_remediation_review_fixes`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
A second review after the req_099 remediation landed confirmed the remediation was real and verified, but found defects the implementation introduced or left open: a self-defeating replay-determinism comparator (localeCompare), a vacuous positionDelta test plus a mid-race trace tiebreak inconsistent with the final classification, an account-enumeration oracle still present on profile creation, and shallow replay-validator/PRNG determinism tests. This request closes those gaps, prioritizing the determinism comparator, and is authored to be executed end-to-end by another AI agent.

# Goals
- Replay determinism holds across environments, not just across key insertion order.
- The positionDelta wiring is pinned by a test that fails if it is removed, and mid-race trace order matches the final classification.
- Profile creation stops leaking which emails are registered, or the team owns that decision explicitly.
- The replay validator and PRNG determinism have test coverage of their nontrivial branches and multi-seed stability.
- Residual invariant and units assumptions are resolved or documented.

# Non-goals
- Do not swap the PRNG algorithm or change the seeding model.
- Do not rework the claim-code/recovery model beyond the enumeration response.
- Do not refactor the modal system beyond verifying the single-open assumption.
- Do not re-tune card balance or broaden the store modularization.
- Do not add any new dependency.

# Scope and guardrails
- In: scaffolded request, product, backlog, orchestration task, validation, and handoff context.
- Out: unrelated workflow docs and implementation of generated tasks.

# Key product decisions
- Use structured input as the source of truth for generated docs.
- Keep generated write paths local and repo-bounded.

# Success signals
- Generated docs pass lint and audit without broad manual rewrites.
- Context-pack output can be handed to an implementation agent directly.

# References
- Product back-reference: `req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth`
- Task back-reference: `task_101_orchestrate_post_remediation_review_fixes`
