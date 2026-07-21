## prod_040_league_state_freshness_on_return_product_brief - League State Freshness On Return Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_076_refresh_league_state_when_the_player_returns_to_the_tab`
> Related backlog: `item_174_refresh_active_league_on_tab_return`
> Related task: `task_077_orchestrate_league_state_freshness_on_return`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Keep asynchronous private-league tabs fresh by silently refetching league state when a player returns, avoiding stale opponent or GP information without introducing realtime infrastructure.

# Goals
- Make hosted beta sessions feel current after tab switching.
- Reuse existing rejoin/claim behavior instead of adding a new sync system.
- Avoid background polling and live transport complexity.
- Keep the UI stable during silent refreshes.

# Non-goals
- Do not add polling, SSE, websockets, push notifications, service workers, or background sync.
- Do not change league cadence, resolution rules, API contracts, or profile recovery.
- Do not refresh admin lists, changelogs, static assets, or unrelated setup screens.
- Do not show a notification for every successful silent refresh.

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
- Product back-reference: `req_076_refresh_league_state_when_the_player_returns_to_the_tab`
- Task back-reference: `task_077_orchestrate_league_state_freshness_on_return`
