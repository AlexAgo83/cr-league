## prod_068_performance_pass_front_and_api_product_brief - Performance Pass (Front and API) Product Brief
> Date: 2026-07-24
> Status: Proposed
> Related request: `req_116_performance_pass_front_and_api`
> Related backlog: `item_279_downscale_and_webp_the_car_sprite_assets`, `item_280_convert_crl_ui_pngs_to_webp`, `item_281_move_the_auth_scrypt_kdf_off_the_event_loop`, `item_282_lazy_load_circuit_route_data_per_selected_circuit`, `item_283_memoize_the_gameapp_shell_to_stop_unrelated_rebuilds`, `item_284_cut_getleaguestate_rebuilds_and_historical_over_fetch`, `item_285_batch_per_team_write_loops_in_resolve_rollover_and_bot_purchases`, `item_286_compute_simulaterace_before_the_write_transaction`
> Related task: `task_117_orchestrate_the_performance_pass`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Act on a measured performance audit of CR League's web and API. The wins are ranked and grounded: compress oversized image assets, defer non-critical front-end code, and remove wasted/blocking backend work on the mutation path — all without changing behavior, visuals, API responses, or race-integrity guarantees, and without new dependencies or schema changes.

# Goals
- Shrink image payload (cars + UI art) by roughly an order of magnitude via downscale + WebP.
- Keep non-critical code (all 25 circuit routes, admin/overlay trees) off the first-paint and off unrelated re-renders.
- Remove duplicated league-state reads, historical over-fetch, and per-team query loops from the backend mutation path.
- Move CPU-heavy simulation and the auth KDF off the locked transaction / event loop.

# Non-goals
- No change to rendered visuals, API response shape/bytes, transaction boundaries, row locks, or rule-error messages.
- No new runtime dependencies and no Prisma schema/index changes (indexes were audited as adequate).
- No rewrite of the per-frame replay animation loop, the simulation numerics, or the seeded PRNG.
- No change to the public import surface consumed by tests.

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
- Product back-reference: `req_116_performance_pass_front_and_api`
- Task back-reference: `task_117_orchestrate_the_performance_pass`
