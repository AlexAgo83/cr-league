## prod_062_review_findings_remediation_product_brief - Review-Findings Remediation Product Brief
> Date: 2026-07-23
> Status: Proposed
> Related request: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
> Related backlog: `item_235_restore_deterministic_weighted_selection_and_pin_it_with_a_test`, `item_236_resolve_the_dead_positiondelta_card_effect_accumulator`, `item_237_make_web_client_storage_access_crash_safe`, `item_238_close_email_header_injection_and_account_enumeration`, `item_239_rate_limit_unauthenticated_writes_and_bound_admin_reads`, `item_240_owner_team_resilience_and_replay_validator_negative_tests`, `item_241_over_engineering_cleanup_extract_replay_trace_delete_dead_exports_unify_modal_state`
> Related task: `task_100_orchestrate_review_findings_remediation`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
A full repo review of cr-league (release 0.4.1) found no critical fires but a ranked set of real issues: a replay-breaking determinism bug in weighted random selection, a dead card-effect accumulator that silently voids position-gain cards, unguarded client storage that can white-screen the app, two unauthenticated-surface security gaps (email header injection and account enumeration), missing rate limiting and unbounded admin reads, an owner-team removal that can permanently lock admin controls, a gap in replay-validation test coverage, and several over-engineering cleanups. This request remediates them in one pass, prioritizing the determinism and gameplay correctness issues first, and is authored to be executed end-to-end by another AI agent.

# Goals
- Deterministic replay is restored and protected by a regression test.
- Card position-gain effects are honest — either real in the standings or removed — with the decision recorded.
- The web client tolerates disabled or full browser storage without crashing.
- The unauthenticated API surface no longer leaks account existence, is not an email-header-injection vector, and cannot be trivially abused to exhaust the database.
- Admin controls stay reachable after owner-team removal, and the replay validator has negative test coverage.
- The simulation core, API utils, and App shell carry less accidental complexity.

# Non-goals
- Do not swap the PRNG algorithm or change the seeding model.
- Do not add session auth, CSRF, or replace the claim-code model.
- Do not introduce a distributed/Redis rate-limit store or any dependency beyond @fastify/rate-limit.
- Do not migrate JSON columns to relational tables or run destructive schema migrations.
- Do not unify the score-based classification with time-based replay movement in this pass (tracked as a follow-up).

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
- Product back-reference: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
- Task back-reference: `task_100_orchestrate_review_findings_remediation`
