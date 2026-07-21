## prod_046_opponent_configuration_comparison_product_brief - Opponent Configuration Comparison Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_082_show_opponents_configurations_for_comparison_after_lock_and_after_the_race`
> Related backlog: `item_180_add_api_gated_opponent_config_reveal_and_a_comparison_view`
> Related task: `task_083_orchestrate_opponent_config_comparison`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Close the most-requested gap by letting players compare opponents' setups and results objectively, revealed only after commit and after the race, so comparison drives learning without eroding pre-race uncertainty or becoming a recommendation.

# Goals
- Let players see what setups produced what results across the field.
- Preserve pre-race uncertainty by gating the reveal to post-lock and post-race.
- Keep the comparison objective and free of recommendations.
- Enforce reveal rules at the API trust boundary.

# Non-goals
- Do not reveal opponent plans before the player's plan is locked.
- Do not recommend, rank as best, or suggest counter-setups.
- Do not change the simulation, rewards, or card economy.
- Do not add a UI or data dependency.

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
- Product back-reference: `req_082_show_opponents_configurations_for_comparison_after_lock_and_after_the_race`
- Task back-reference: `task_083_orchestrate_opponent_config_comparison`
