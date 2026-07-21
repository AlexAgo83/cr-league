## prod_045_card_economy_rebalance_product_brief - Card Economy Rebalance Product Brief
> Date: 2026-07-21
> Status: Proposed
> Related request: `req_081_rebalance_card_economy_to_remove_dead_cards_and_redundant_duplicates`
> Related backlog: `item_179_reprice_and_re_role_dead_and_duplicate_cards_with_balance_kit_validation`
> Related task: `task_082_orchestrate_card_economy_rebalance`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Turn the 15-card catalogue into a set of real choices: kill dead cards, differentiate duplicates, and make paid cards worth more than free tuning, all validated by the balance kit and AI playtest rather than intuition.

# Goals
- Every card has an evidenced reason to be bought or played.
- No dominant cheap card and no dead expensive card.
- Paid cards are distinct from the free directive knobs.
- Changes are driven and proven by balance and playtest evidence.

# Non-goals
- Do not add new cards or a new card family in this request.
- Do not change the stat model or the core simulation formula (separate stat-differentiation request).
- Do not recommend cards or expose a best-card ranking.
- Do not break determinism or ship magnitude changes without updating the tests intentionally.

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
- Product back-reference: `req_081_rebalance_card_economy_to_remove_dead_cards_and_redundant_duplicates`
- Task back-reference: `task_082_orchestrate_card_economy_rebalance`
