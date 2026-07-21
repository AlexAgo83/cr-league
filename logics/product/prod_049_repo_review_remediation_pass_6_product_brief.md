## prod_049_repo_review_remediation_pass_6_product_brief - Repo Review Remediation Pass 6 Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup`
> Related backlog: `item_185_lock_the_json_column_read_modify_write_paths`, `item_186_restore_simulation_finishing_order_and_interval_fidelity`, `item_187_guard_destructive_delete_and_league_admin_authority`, `item_188_derive_plan_badges_from_a_single_shared_stat_delta_descriptor`, `item_189_over_engineering_cleanup_sweep`
> Related task: `task_086_orchestrate_repo_review_remediation_pass_6`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
A sixth remediation pass driven by the v0.3.26 full-repo review: close the JSON-column read-modify-write races on the card, decision, and join paths using the transaction/row-lock machinery established in passes 3-5; restore simulation finishing-order fidelity so results and displayed gaps reflect the score model; guard the two remaining destructive/authority operations; stop the card directive badges from drifting from balance; and delete the over-engineering the review catalogued.

# Goals
- Concurrent card, decision, and join requests can never lose data or violate an invariant.
- Race results and the finishing-interval display reflect the simulation's score model, not clamp saturation or clamped-progress artifacts.
- An irreversible admin delete and league-admin authority cannot happen by accident.
- Player-facing plan badges always match the balance the simulation actually applies.
- The codebase sheds the duplicated, dead, and fabricated code the review found.

# Non-goals
- Do not build ownership-transfer UX or full session auth; a missing owner simply rejects.
- Do not migrate qualifyingRuns or cards to dedicated tables or convert Prisma string columns to enums.
- Do not rebalance card or approach values; the badge work exposes existing deltas, it does not retune them.
- Do not add new rate-limiting or caching infrastructure.
- Do not restyle any screen beyond the confirm prompt required by the delete guard.

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
- Product back-reference: `req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup`
- Task back-reference: `task_086_orchestrate_repo_review_remediation_pass_6`
