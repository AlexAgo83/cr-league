## prod_074_cross_package_source_of_truth_remediation_product_brief - Cross-Package Source-of-Truth Remediation Product Brief
> Date: 2026-07-26
> Status: Proposed
> Related request: `req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps`
> Related backlog: `item_300_single_source_of_truth_for_the_leaguestate_raceresult_response_contract`, `item_301_consolidate_diverged_simulation_util_helpers_into_shared_reconciled_under_test`, `item_302_one_shared_definition_of_replay_order_classification_gaps_with_a_golden_test`, `item_303_decompose_the_god_modules_lifecycle_ts_and_app_tsx`, `item_304_test_and_ci_hardening_coverage_floor_plus_critical_path_unit_tests`, `item_305_server_authoritative_standings_circuit_parity_guard_and_dead_code_data_hygiene`
> Related task: `task_123_orchestrate_the_source_of_truth_remediation`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
A four-lens review found cr-league's architecture and server-authoritative trust model to be strong, with every real weakness being cross-package duplication that has already drifted: a hand-copied client/server contract, same-named simulation helpers with divergent behavior, and a client that re-derives replay ordering and season standings the server already knows — the last two untested. This remediation gives each of those a single source of truth in shared, reconciles the divergences under test, decomposes the two god modules, and closes the highest-risk test gaps, without altering the intentional opponent-reveal meta-game or the (separately handled) secret rotation.

# Goals
- One source of truth for the client/server contract and for shared simulation helpers.
- Move replay and standings derivation to a shared/server truth instead of untested client re-derivation.
- Decompose the god modules and close the highest-risk test gaps with an enforced coverage floor.
- Preserve the strong layering, the server-authoritative model, and the intentional opponent-reveal meta-game.

# Non-goals
- Do not change the opponent-decision reveal — it is intentional game design (reading rivals to tune your setup).
- Do not rotate secrets here (owner handles the SMTP credential separately).
- Do not add gameplay, retune the engine beyond reconciling a diverged helper, or redesign the UI.
- Do not fold in the +20-circuits work (req_118).

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
- Product back-reference: `req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps`
- Task back-reference: `task_123_orchestrate_the_source_of_truth_remediation`
