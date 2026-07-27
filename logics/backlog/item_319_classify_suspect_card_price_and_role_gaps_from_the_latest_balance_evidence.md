## item_319_classify_suspect_card_price_and_role_gaps_from_the_latest_balance_evidence - Classify suspect card price and role gaps from the latest balance evidence
> From version: 0.5.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Economy evidence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The roadmap can now move past the old hold, but opening a broad card rebalance would be speculative because replayability variety is healthy.
- The long balance audit shows specific suspect cards, but the evidence needs to be turned into a decision table before any code change.
- Without classification, the next 0.5 move risks tuning cards that are merely situational or sample-driven.

# Scope
- In:
  - Record the fresh replayability baseline and balance-gate result.
  - Group the long balance audit by card and classify suspect cards: confirmed weak, acceptable situational, or inconclusive.
  - Decide whether a tuning slice is justified or whether gameplay code should remain unchanged.
- Out:
  - Changing card prices or effects in this item.
  - Running an unbounded full simulation if the existing long audit and fresh gate already give enough signal.

# Acceptance criteria
- AC1: The report lists suspect cards with win rate, average points, buy/next-card rate, and credit margin.
- AC2: The report states whether tuning is justified now or deferred.
- AC3: If tuning is deferred, no gameplay code changes are made.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The report lists suspect cards with win rate, average points, buy/next-card rate, and credit margin.
- request-AC2 -> This backlog slice. Proof: AC2: The report states whether tuning is justified now or deferred.
- request-AC4 -> This backlog slice. Proof: AC3: If tuning is deferred, no gameplay code changes are made.
- request-AC6 -> This backlog slice. Proof: AC3: If tuning is deferred, no gameplay code changes are made.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_079_card_price_and_role_baseline_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_127_card_price_and_role_baseline_follow_up_validate_weak_card_affordability_before_0_5_economy_expansion`
- Primary task(s): `task_128_orchestrate_card_price_and_role_baseline_follow_up`

# AI Context
- Summary: Classify suspect card price and role gaps from the latest balance evidence
- Keywords: scaffolded-backlog, classify suspect card price and role gaps from the latest balance evidence, implementation-ready
- Use when: Implementing the scaffolded slice for Classify suspect card price and role gaps from the latest balance evidence.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-27 baseline recorded in docs/audits/card-price-role-baseline-2026-07-27.md. Fresh replayability: 12 seasons x 6 GP x 14 agents, 4 unique champions, 72 unique finishing orders, 97.22% comeback race rate, 30.56% close finishes, 0% boring races, no cluster above 25%. Balance gate passed; long audit grouped by card identified pit_relay and hard_tires as confirmed weak at 180 credits.

# Notes
- Task `task_128_orchestrate_card_price_and_role_baseline_follow_up` was finished via `logics-manager flow finish task` on 2026-07-27.
