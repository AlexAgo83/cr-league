## prod_034_web_view_code_splitting_product_brief - Web View Code Splitting Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_070_split_large_web_views_from_the_initial_bundle`
> Related backlog: `item_168_lazy_load_secondary_web_views`
> Related task: `task_071_orchestrate_web_view_code_splitting`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Reduce CR League's initial web payload by lazy-loading secondary application views while keeping the first screen fast, stable, and visually consistent.

# Goals
- Move heavy non-initial views out of the initial JavaScript bundle.
- Keep the existing state-driven app architecture intact.
- Provide a simple lazy-loading pattern that future views can reuse.
- Measure the build output before and after the change.

# Non-goals
- Do not add a router library or replace the app shell.
- Do not redesign navigation, loading screens, reports, replay, garage, or championship UI.
- Do not split every small component; target only views that materially affect the bundle.
- Do not change API contracts, persistence, gameplay, or i18n copy unless a fallback label already exists.

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
- Product back-reference: `req_070_split_large_web_views_from_the_initial_bundle`
- Task back-reference: `task_071_orchestrate_web_view_code_splitting`
