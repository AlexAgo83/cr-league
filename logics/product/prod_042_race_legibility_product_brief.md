## prod_042_race_legibility_product_brief - Race Legibility Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_078_expose_card_trigger_conditions_and_relative_strength_in_plan_and_garage`
> Related backlog: `item_176_add_a_shared_card_descriptor_condition_strength_band_and_surface_it_in_card_ui`
> Related task: `task_079_orchestrate_card_effect_legibility`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Make the race readable before making it deeper: expose the objective rules behind cards (and later weather) so a player can predict the direction and rough strength of a choice before committing, without the game ever recommending a choice.

# Goals
- Let a player understand what a card does and when it fires before locking a plan.
- Replace vague direction-only badges with objective condition plus a calibrated relative strength band.
- Keep a single shared source of truth so displayed rules never drift from the simulation.
- Preserve uncertainty and the no-recommendation design pillar.

# Non-goals
- Do not display raw numeric magnitudes or let the optimum be directly computed from the UI.
- Do not recommend cards, settings, or strategies.
- Do not change card magnitudes, prices, economy, or simulation behavior (that is 0.5 economy/card-depth work).
- Do not add a UI framework, state, or data dependency.

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
- Product back-reference: `req_078_expose_card_trigger_conditions_and_relative_strength_in_plan_and_garage`
- Task back-reference: `task_079_orchestrate_card_effect_legibility`
