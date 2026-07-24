## req_113_add_purchasable_garage_cars - Add purchasable garage cars
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Garage progression
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add persistent cosmetic car ownership to the garage.
- Keep cars 1-7 free, price cars 8-10 at 1,000 credits, F1 cars 11-13 at 2,000, and rally cars 14-16 at 3,000.
- Show locked cars as faded with a lock on both preview images.

# Context
- Car selection currently saves any asset directly in the team livery without ownership or server-side pricing.
- `car-008` was the implicit default before paid cars, so existing teams must retain it during migration.
- Card purchases already provide the credit-guarded transaction pattern to reuse.

# Acceptance criteria
- AC1: Shared prices match the four requested car groups.
- AC2: Paid ownership persists per team and purchase atomically debits credits, unlocks, and equips the car.
- AC3: The API rejects direct selection of a locked paid car.
- AC4: Locked previews are faded and display a lock over both top and side images.
- AC5: Existing implicit `car-008` users are grandfathered; new teams default to free `car-001`.
- AC6: Focused tests, full tests, typecheck, lint, build, migration, and Logics validation pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `packages/shared/src/economy/carAssets.ts`
- `apps/api/src/features/leagues/storeCore.ts`
- `apps/web/src/features/GarageView.tsx`
- `prisma/schema.prisma`

# AI Context
- Summary: Draft a bounded request for add purchasable garage cars.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- `item_271_add_purchasable_garage_cars`
- `item_271_add_purchasable_garage_cars`
