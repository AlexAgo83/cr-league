## prod_050_gameplay_and_economy_integrity_product_brief - Gameplay and Economy Integrity Product Brief
> Date: 2026-07-22
> Status: Proposed
> Related request: `req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation`
> Related backlog: `item_190_monotonic_payout_and_no_unplayed_card_consumption`, `item_191_deterministic_resolution_and_self_rival_rejection`, `item_192_limiter_pruning_profileid_index_and_bot_card_write_hygiene`
> Related task: `task_087_orchestrate_gameplay_and_economy_integrity_fixes`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
A follow-on audit after review pass 6 surfaced correctness issues in the game's economy and resolution rather than its structure: a non-monotonic credit payout that rewards finishing near-last, silent consumption of a card a non-submitting player never chose, race resolution that trusts client-supplied traits and thus loses seed-determinism, a decision validator that allows self-targeted rival cards, plus limiter and index hygiene. This request makes payouts monotonic, stops unplayed-card loss, restores deterministic resolution, and tightens decision validation.

# Goals
- Placing better always pays at least as well as placing worse.
- No player loses a card they did not choose to play.
- A given seed and circuit always resolve to the same race, independent of the request body.
- Rival-card effects can never target the player's own team.
- The recovery limiter and hot lookup paths are free of leaks and missing indexes.

# Non-goals
- Do not retune individual card or approach stat deltas; this is integrity, not balance.
- Do not remove the comeback cushion; keep helping the tail of the field, just monotonically.
- Do not implement the JSON-column locking of the human buy/decision/join paths here (owned by req_085).
- Do not add distributed rate limiting or new dependencies.
- Do not change the admin replay/render tooling beyond decoupling it from the scored simulation input.

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
- Product back-reference: `req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation`
- Task back-reference: `task_087_orchestrate_gameplay_and_economy_integrity_fixes`
