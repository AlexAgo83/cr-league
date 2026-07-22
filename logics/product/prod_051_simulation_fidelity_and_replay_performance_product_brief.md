## prod_051_simulation_fidelity_and_replay_performance_product_brief - Simulation Fidelity and Replay Performance Product Brief
> Date: 2026-07-22
> Status: Proposed
> Related request: `req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness`
> Related backlog: `item_193_qualifying_responds_to_circuit_traits`, `item_194_bound_replay_render_cost_and_timer_growth`, `item_195_recap_accuracy_and_replay_overlay_polish`, `item_196_simulation_input_robustness_and_unbiased_circuit_shuffle`
> Related task: `task_088_orchestrate_simulation_fidelity_and_replay_performance_fixes`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
A third audit after review pass 6 and the gameplay-integrity pass found issues in how faithfully the game reads the track and how cheaply the replay renders: qualifying times do not respond to circuit traits at all, the circuit map re-runs an O(n^2) scene analysis on every replay frame, the recap mislabels heavy rain, and a public simulation route can be made to return NaN. This request makes qualifying track-sensitive, bounds replay render cost, corrects recap and overlay accuracy, and hardens simulation inputs.

# Goals
- The circuit's character visibly shapes qualifying, not just the race.
- Replay playback stays smooth because per-frame work is bounded.
- Recaps and replay overlays state the truth (right weather, right verdict, forward motion, translated labels).
- Public simulation inputs cannot produce NaN results, and season calendars are unbiased.

# Non-goals
- Do not retune trait or card magnitudes; this is fidelity and correctness, not balance.
- Do not change the replay animation model or the deterministic trace format.
- Do not touch the JSON-column locking or economy/resolve work owned by req_085 and req_086.
- Do not add new dependencies or a rendering library.

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
- Product back-reference: `req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness`
- Task back-reference: `task_088_orchestrate_simulation_fidelity_and_replay_performance_fixes`
