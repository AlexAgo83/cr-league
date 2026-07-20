## prod_027_lap_scale_coherence_product_brief - Lap-Scale Coherence Product Brief
> Date: 2026-07-20
> Status: Proposed
> Related request: `req_063_lap_scale_coherence_displayed_lap_numbers_must_match_the_circuit_s_lap_count`
> Related backlog: `item_152_map_simulation_laps_to_circuit_laps_at_the_display_boundary`
> Related task: `task_064_orchestrate_lap_scale_coherence_fix`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Defect chain from the 2026-07-20 AI playtest: the simulation's internal lap scale leaks raw into every event-derived surface, so a 3-lap Grand Prix reports moments from laps 5, 8, and 10. Fix by translating simulation laps to circuit laps at one boundary, lock it with a short-circuit invariant test, and keep simulation outcomes untouched.

# Goals
- No displayed lap number ever exceeds the circuit's announced lap count.
- One documented mapping owns the translation; future event features inherit it.
- Race outcomes, balance, and existing replay traces are unchanged.

# Non-goals
- Do not rebalance the simulation or change how many internal laps it computes (fallback only if boundary rescaling proves incoherent).
- Do not change the segment/phase structure or the trace format.
- Do not touch payoff gating, key-moment selection, or recap prose (req_062, req_060).

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
- Product back-reference: `req_063_lap_scale_coherence_displayed_lap_numbers_must_match_the_circuit_s_lap_count`
- Task back-reference: `task_064_orchestrate_lap_scale_coherence_fix`
