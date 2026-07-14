## task_028_improve_between_gp_garage_guidance - Improve between-GP garage guidance
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_033_improve_between_gp_garage_guidance`

# Acceptance criteria
- AC1: The garage shows the player post-GP reward and consumed-card summary.
- AC2: Inventory and recommended shop offers are separate, scannable sections.
- AC3: Only up to three card offers are shown.
- AC4: Card labels include `Recommended`, `Risky`, or `Low fit` based on current GP context.
- AC5: Unit/e2e tests cover the updated garage flow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_028_improve_between_gp_garage_guidance.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_028_improve_between_gp_garage_guidance.md` after implementation.
- npm run typecheck passed; npm test passed; npm run lint passed; npm run build passed; npm run test:e2e passed; logics-manager i18n validate passed; npm run logics:validate passed.
- Finish workflow executed on 2026-07-14.
- Linked backlog/request close verification passed.

# Report
- Added a post-GP garage summary for player credits, points, and consumed card state.
- Split the garage into inventory and recommended offers with a locked-shop hint before resolution.
- Added simple contextual card fit labels and limited shop display to three offers.
- Updated EN/FR copy plus unit and e2e coverage.
- Finished on 2026-07-14.
- Linked backlog item(s): `item_033_improve_between_gp_garage_guidance`
- Related request(s): `req_027_improve_between_gp_garage_guidance`

# AI Context
- Summary: Implement improve between-gp garage guidance.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_027_improve_between_gp_garage_guidance`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `garage-summary` in `apps/web/src/app/App.tsx` shows player GP credits, points, and consumed card state.
- request-AC2 -> This task. Proof: `garage_inventory` and `garage_shop` headings split inventory from offers in the garage panel.
- request-AC3 -> This task. Proof: `recommendedShopOffers(...).slice(0, 3)` limits visible offers.
- request-AC4 -> This task. Proof: `cardFit` drives `Recommended`, `Risky`, and `Low fit` labels in directive and shop UI.
- request-AC5 -> This task. Proof: EN/FR i18n keys, Vitest assertions, and Playwright garage flow coverage.
