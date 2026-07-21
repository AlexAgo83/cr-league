## item_179_reprice_and_re_role_dead_and_duplicate_cards_with_balance_kit_validation - Reprice and re-role dead and duplicate cards with balance-kit validation
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Economy and card depth
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Playtest shows adjustable_wing, pit_relay, and fleet_maintenance are never bought and rain_mapping is dominated by rain_grip.
- A cheap card cluster dominates purchases while expensive cards are dead, so card choice is shallow.
- Some cards re-sell stat effects the free approach/preparation knobs already grant, weakening the reason to buy.

# Scope
- In:
  - Adjust prices and/or effects of the confirmed dead/duplicate cards using balance-kit and playtest measurement.
  - Differentiate or consolidate the redundant weather cards (rain_grip vs rain_mapping).
  - Ensure each paid card offers something the free directive knobs do not.
  - Update deterministic tests to reflect intended magnitude changes and record updated balance/playtest evidence.
- Out:
  - Adding new cards or card families.
  - Changing the stat model or core simulation formula.
  - Any recommendation or best-card ranking in UI or copy.

# Acceptance criteria
- AC1: A post-change AI playtest shows no card at zero purchases and no single dominant card across points, win rate, and credit margin.
- AC2: The four confirmed outliers are repriced or re-roled with a distinct evidenced reason to pick each.
- AC3: Each paid card is differentiated from the free approach/preparation knobs.
- AC4: Determinism holds and updated tests pass; balance and playtest evidence is recorded.
- AC5: Typecheck, test, build, lint, and logics:validate pass; no recommendation copy is introduced.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A post-change AI playtest shows no card at zero purchases and no single dominant card across points, win rate, and credit margin.
- request-AC2 -> This backlog slice. Proof: AC2: The four confirmed outliers are repriced or re-roled with a distinct evidenced reason to pick each.
- request-AC3 -> This backlog slice. Proof: AC3: Each paid card is differentiated from the free approach/preparation knobs.
- request-AC4 -> This backlog slice. Proof: AC4: Determinism holds and updated tests pass; balance and playtest evidence is recorded.
- request-AC5 -> This backlog slice. Proof: AC5: Typecheck, test, build, lint, and logics:validate pass; no recommendation copy is introduced.
- request-AC6 -> This backlog slice. Proof: AC5: Typecheck, test, build, lint, and logics:validate pass; no recommendation copy is introduced.
- request-AC7 -> This backlog slice. Proof: AC5: Typecheck, test, build, lint, and logics:validate pass; no recommendation copy is introduced.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_045_card_economy_rebalance_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_081_rebalance_card_economy_to_remove_dead_cards_and_redundant_duplicates`
- Primary task(s): `task_082_orchestrate_card_economy_rebalance`

# AI Context
- Summary: Reprice and re-role dead and duplicate cards with balance-kit validation
- Keywords: scaffolded-backlog, reprice and re-role dead and duplicate cards with balance-kit validation, implementation-ready
- Use when: Implementing the scaffolded slice for Reprice and re-role dead and duplicate cards with balance-kit validation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_082_orchestrate_card_economy_rebalance`

# Notes
- Task `task_082_orchestrate_card_economy_rebalance` was finished via `logics-manager flow finish task` on 2026-07-21.
