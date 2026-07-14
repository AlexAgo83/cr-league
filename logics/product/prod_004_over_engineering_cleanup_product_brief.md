## prod_004_over_engineering_cleanup_product_brief - Over-engineering Cleanup Product Brief
> Date: 2026-07-15
> Status: Proposed
> Related request: `req_033_over_engineering_cleanup_pass_1`
> Related backlog: `item_048_delete_dead_code_dead_i18n_keys_and_stray_files`, `item_049_consolidate_duplicated_helpers_and_degenerate_constants`, `item_050_slim_the_qualifying_result_to_what_the_client_renders`, `item_051_single_layer_validation_between_routes_and_store`
> Related task: `task_034_orchestrate_over_engineering_cleanup_pass_1`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
A deletion-first maintenance pass that removes dead code, dead translations, duplicated helpers, and speculative surface area identified by a repo-wide audit, so future feature work starts from a smaller, honest codebase.

# Goals
- Shrink the codebase by roughly 200 lines with zero behavior change.
- Make the shared package surface match what consumers actually use.
- Establish one validation layer per concern: shape at the route boundary, business rules in the store.
- Leave the i18n catalogs exactly matching the UI so future locale audits are trivial.

# Non-goals
- Do not redesign any UI surface or add abstractions (no Modal wrapper, no component extraction).
- Do not change gameplay, economy values, or simulation behavior.
- Do not touch the logics/ workflow corpus beyond this request chain.
- Do not add dependencies or tooling.

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
- Product back-reference: `req_033_over_engineering_cleanup_pass_1`
- Task back-reference: `task_034_orchestrate_over_engineering_cleanup_pass_1`
