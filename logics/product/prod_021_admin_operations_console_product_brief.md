## prod_021_admin_operations_console_product_brief - Admin Operations Console Product Brief
> Date: 2026-07-19
> Status: Proposed
> Related request: `req_050_add_a_secured_admin_operations_console`
> Related backlog: `item_126_add_secured_admin_api_operations`, `item_127_add_profile_menu_admin_console_ui`
> Related task: `task_051_orchestrate_secured_admin_operations_console`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
The admin operations console gives trusted operators a small, secured way to inspect users and leagues, reset recovery access, remove accounts, and enter league contexts without touching the database directly.

# Goals
- Make support and playtest operations possible from the application instead of direct SQL.
- Keep global admin access explicitly gated by server-side environment configuration.
- Protect recovery-code security by supporting reset-and-show-once rather than plaintext lookup.
- Give operators a concise read of profiles and leagues before adding heavier operational actions.
- Preserve the player-facing cockpit and profile flows for non-admin users.

# Non-goals
- Do not add a full RBAC or multi-admin user-management system.
- Do not store plaintext recovery codes or make existing recovery codes recoverable.
- Do not add bulk destructive actions.
- Do not add league mutation actions such as force-resolve, force-next-GP, reset league, or delete league in the first slice.
- Do not redesign the whole profile menu or cockpit navigation.
- Do not expose admin credentials through Vite build-time environment variables.

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
- Product back-reference: `req_050_add_a_secured_admin_operations_console`
- Task back-reference: `task_051_orchestrate_secured_admin_operations_console`
