## prod_055_leagues_store_modularization_product_brief - Leagues Store Modularization Product Brief
> Date: 2026-07-22
> Status: Proposed
> Related request: `req_091_modularize_the_oversized_leagues_store`
> Related backlog: `item_207_split_leagues_store_into_lifecycle_modules_behind_a_barrel`
> Related task: `task_092_orchestrate_leagues_store_modularization`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Reorganize CR League's oversized leagues store into cohesive lifecycle modules behind an unchanged barrel export, improving maintainability without touching behavior or the public API.

# Goals
- Reduce store.ts from a 1197-line catch-all to a thin barrel over focused modules.
- Give each lifecycle (profiles, leagues, cards, decisions, qualifying, resolution, reads) its own file.
- Centralize the shared transaction helpers so race-integrity logic lives in one place.
- Keep the change provably behavior-neutral via the existing test suite.

# Non-goals
- Do not change any function behavior, transaction boundary, lock, or rule-error message.
- Do not alter the public import surface consumed by routes.ts, admin/store.ts, or tests.
- Do not add dependencies or introduce a new architectural pattern beyond plain module files.
- Do not refactor the simulation engine, Prisma schema, or API routes.

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
- Product back-reference: `req_091_modularize_the_oversized_leagues_store`
- Task back-reference: `task_092_orchestrate_leagues_store_modularization`
