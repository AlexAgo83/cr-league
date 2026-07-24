## item_271_add_purchasable_garage_cars - Add purchasable garage cars
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Add persistent cosmetic car ownership to the garage.
Keep cars 1-7 free, price cars 8-10 at 1,000 credits, F1 cars 11-13 at 2,000, and rally cars 14-16 at 3,000.
Show locked cars as faded with a lock on both preview images.

# Scope
- In:
  - Shared cosmetic car catalogue and prices.
  - Persistent team ownership, guarded purchase, and locked selection validation.
  - Garage locked, affordable, purchased, and selected states.
  - Grandfathering migration for the former implicit default.
- Out:
  - Car performance bonuses, resale, bot purchases, or economy rebalancing.

# Acceptance criteria
- AC1: Shared prices match the four requested car groups.
- AC2: Paid ownership persists per team and purchase atomically debits credits, unlocks, and equips the car.
- AC3: The API rejects direct selection of a locked paid car.
- AC4: Locked previews are faded and display a lock over both top and side images.
- AC5: Existing implicit `car-008` users are grandfathered; new teams default to free `car-001`.
- AC6: Focused tests, full tests, typecheck, lint, build, migration, and Logics validation pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Shared prices match the four requested car groups.
- request-AC2 -> This backlog slice. Proof: AC2: Paid ownership persists per team and purchase atomically debits credits, unlocks, and equips the car.
- request-AC3 -> This backlog slice. Proof: AC3: The API rejects direct selection of a locked paid car.
- request-AC4 -> This backlog slice. Proof: AC4: Locked previews are faded and display a lock over both top and side images.
- request-AC5 -> This backlog slice. Proof: AC5: Existing implicit `car-008` users are grandfathered; new teams default to free `car-001`.
- request-AC6 -> This backlog slice. Proof: AC6: Focused tests, full tests, typecheck, lint, build, migration, and Logics validation pass.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `logics/request/req_113_add_purchasable_garage_cars.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Add purchasable garage cars
- Keywords: backlog-groom, request, add purchasable garage cars, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Add purchasable garage cars.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_113_add_purchasable_garage_cars` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_113_add_purchasable_garage_cars.md`.
- Generated locally by logics-manager.
- Task `task_114_add_purchasable_garage_cars` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_114_add_purchasable_garage_cars`
