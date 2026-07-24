## task_114_add_purchasable_garage_cars - Add purchasable garage cars
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_271_add_purchasable_garage_cars`

# Acceptance criteria
- AC1: Shared prices match the four requested car groups.
- AC2: Paid ownership persists per team and purchase atomically debits credits, unlocks, and equips the car.
- AC3: The API rejects direct selection of a locked paid car.
- AC4: Locked previews are faded and display a lock over both top and side images.
- AC5: Existing implicit `car-008` users are grandfathered; new teams default to free `car-001`.
- AC6: Focused tests, full tests, typecheck, lint, build, migration, and Logics validation pass.

# AC Traceability
- request-AC1 -> This task. Proof: shared catalogue test covers 0, 1,000, 2,000, and 3,000 credit groups.
- request-AC2 -> This task. Proof: API test verifies a 2,000-credit debit, persisted ownership, immediate equipment, and no duplicate debit.
- request-AC3 -> This task. Proof: API test receives 409 when selecting locked `car-011`.
- request-AC4 -> This task. Proof: App test and Chromium checks at 1280x800 and 390x844 find two lock overlays and the priced action.
- request-AC5 -> This task. Proof: migration stores implicit `car-008` in both livery and ownership while the shared default is `car-001`.
- request-AC6 -> This task. Proof: validation results are recorded below.

# Validation
- Focused shared, API, and App tests: 66 passed.
- `npm test`: 307 passed, 7 skipped.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed.
- `prisma migrate deploy` applied `20260724120000_add_unlocked_car_assets` successfully to the local PostgreSQL database.
- Chromium desktop and mobile checks show both locks and a visible priced action.
- `logics-manager i18n validate` passed.
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- Added persistent cosmetic car ownership and one credit-guarded purchase endpoint.
- Added four shared price tiers and rejected direct locked-car selection.
- Added faded dual-view locks, purchase confirmation, and immediate equipment in GarageView.
- Updated README and the core product brief to keep car unlocks explicitly cosmetic.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_271_add_purchasable_garage_cars`
- Related request(s): `req_113_add_purchasable_garage_cars`

# AI Context
- Summary: Implement add purchasable garage cars.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_113_add_purchasable_garage_cars`
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
