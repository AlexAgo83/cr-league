## prod_038_circuit_route_loading_audit_product_brief - Circuit Route Loading Audit Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_074_audit_circuit_data_impact_before_optimizing_route_loading`
> Related backlog: `item_172_measure_and_decide_on_circuit_route_lazy_loading`
> Related task: `task_075_orchestrate_circuit_route_loading_audit`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Measure and, only if justified, reduce the initial bundle cost of detailed circuit geometry while preserving map, replay, and simulation coherence.

# Goals
- Make a measured decision about circuit route lazy loading.
- Avoid speculative complexity if route modules are not a meaningful payload source.
- Keep circuit identities and display routes aligned.
- Leave a clear threshold for future circuit additions.

# Non-goals
- Do not redraw or redesign circuits.
- Do not change race simulation, lap counts, or replay behavior unless a loading boundary requires a small adapter.
- Do not introduce a data fetching endpoint for static circuit routes.
- Do not add a bundle analyzer dependency unless simple Vite output is insufficient.

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
- Product back-reference: `req_074_audit_circuit_data_impact_before_optimizing_route_loading`
- Task back-reference: `task_075_orchestrate_circuit_route_loading_audit`
