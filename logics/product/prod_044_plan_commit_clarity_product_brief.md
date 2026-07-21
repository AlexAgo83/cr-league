## prod_044_plan_commit_clarity_product_brief - Plan Commit Clarity Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_080_warn_card_consumption_before_commit_and_add_an_inline_launch_action_on_the_directive_tab`
> Related backlog: `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`
> Related task: `task_081_orchestrate_plan_commit_clarity`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Reduce first-session confusion at the moment of committing a race plan: make card consumption explicit before it happens and let the player launch from the directive tab without hunting for the action.

# Goals
- Make the cost of playing a card (its consumption) visible before commit.
- Let the player launch or send from the directive tab in one place.
- Reuse the existing primaryCommand so behavior stays consistent.
- Ship the smallest safe change with no model impact.

# Non-goals
- Do not change card consumption rules, banking, or resale.
- Do not change the simulation, rewards, or any API contract.
- Do not add a second competing launch button or fork launch logic.
- Do not redesign the plan navigation or subtab structure.

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
- Product back-reference: `req_080_warn_card_consumption_before_commit_and_add_an_inline_launch_action_on_the_directive_tab`
- Task back-reference: `task_081_orchestrate_plan_commit_clarity`
