## item_320_apply_the_smallest_card_price_or_role_fix_only_for_confirmed_weak_cards - Apply the smallest card price or role fix only for confirmed weak cards
> From version: 0.5.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Economy tuning
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Some cards may be weak because price and role do not match their measured impact.
- Fixing too much at once would erase the healthy replayability signals and make cause/effect unreadable.
- The code already centralizes prices and card definitions, so any confirmed fix should be small.

# Scope
- In:
  - Adjust only existing CARD_PRICES, effect magnitudes, or card role copy for cards confirmed weak by the first item.
  - Add or update focused tests only where a changed effect or price needs a guard.
  - Re-run replayability and balance gates and record before/after evidence.
- Out:
  - Adding card mechanics, new cards, shop-system changes, or UI screens.
  - Changing anything if the first item does not confirm a stable weak-card problem.

# Acceptance criteria
- AC1: Any code change is limited to confirmed weak cards and the smallest existing constant/effect/copy surface.
- AC2: Replayability and balance evidence remain green after the change.
- AC3: If no cards are confirmed weak, this item closes as no-op with the diagnostic evidence recorded.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Any code change is limited to confirmed weak cards and the smallest existing constant/effect/copy surface.
- request-AC5 -> This backlog slice. Proof: AC2: Replayability and balance evidence remain green after the change.
- request-AC6 -> This backlog slice. Proof: AC3: If no cards are confirmed weak, this item closes as no-op with the diagnostic evidence recorded.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-27 tuning decision: apply price-only fix for confirmed weak cards. pit_relay and hard_tires move from 180 to 120 credits. No card effects, simulation formula, shop model, or UI surfaces changed.

# Links
- Product brief(s): `prod_079_card_price_and_role_baseline_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_127_card_price_and_role_baseline_follow_up_validate_weak_card_affordability_before_0_5_economy_expansion`
- Primary task(s): `task_128_orchestrate_card_price_and_role_baseline_follow_up`

# AI Context
- Summary: Apply the smallest card price or role fix only for confirmed weak cards
- Keywords: scaffolded-backlog, apply the smallest card price or role fix only for confirmed weak cards, implementation-ready
- Use when: Implementing the scaffolded slice for Apply the smallest card price or role fix only for confirmed weak cards.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-27 post-tuning validation: npm run typecheck OK; npm run lint OK; npm test OK with 352 passing / 7 skipped; npm run build OK; npm run playtest:replayability OK with no dominant cluster above 25%, 29.17% close finishes, 0% boring races; npm run balance:gate OK. pit_relay margin improved from -67.28 to -13.52 in the gate summary; hard_tires price is now 120 with gate margin -11.76.

# Notes
- Task `task_128_orchestrate_card_price_and_role_baseline_follow_up` was finished via `logics-manager flow finish task` on 2026-07-27.
