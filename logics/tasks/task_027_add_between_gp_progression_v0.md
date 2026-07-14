## task_027_add_between_gp_progression_v0 - Add between-GP progression v0
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
- `item_032_add_between_gp_progression_v0`

# Acceptance criteria
- AC1: League state exposes `teams[].cards` and a `cardShop`.
- AC2: `POST /leagues/:leagueId/cards/buy` buys a valid card for a team with enough credits.
- AC3: `submitDecision` rejects a card that is not in the team's inventory.
- AC4: `resolveCurrentGrandPrix` consumes played cards from inventory.
- AC5: The web app displays player credits, inventory counts, and buy buttons in a garage section.
- AC6: Validation covers API behavior and web rendering.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_027_add_between_gp_progression_v0.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_027_add_between_gp_progression_v0.md` after implementation.
- npm run typecheck passed; npm test passed; npm run lint passed; npm run build passed; npm run test:e2e passed; logics-manager i18n validate passed; npm run logics:validate passed before closeout; DATABASE_URL='postgresql://user:password@localhost:5432/cr_league?schema=cr_league' npx prisma validate passed.
- Finish workflow executed on 2026-07-14.
- Linked backlog/request close verification passed.

# Report
- Added `Team.cards` JSON persistence and migration.
- Added starter inventory, fixed-price shop state, card purchase endpoint, owned-card validation, and consumed-card removal.
- Added a web garage section showing credits, inventory counts, and buy buttons, with English/French copy.
- Updated API and web tests for the new contract.
- Finished on 2026-07-14.
- Linked backlog item(s): `item_032_add_between_gp_progression_v0`
- Related request(s): `req_026_add_between_gp_progression_v0`

# AI Context
- Summary: Implement add between-gp progression v0.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_026_add_between_gp_progression_v0`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `Team.cards` in `prisma/schema.prisma`, migration `20260714233000_add_team_cards`, and `LeagueState.teams[].cards` in `apps/api/src/features/leagues/store.ts`.
- request-AC2 -> This task. Proof: `POST /leagues/:leagueId/cards/buy`, API tests, and e2e garage purchase coverage.
- request-AC3 -> This task. Proof: `submitDecision` checks the selected card against the team's inventory before upserting a directive.
- request-AC4 -> This task. Proof: `resolveCurrentGrandPrix` removes each `result.consumedCards` entry from the matching team inventory.
- request-AC5 -> This task. Proof: garage section in `apps/web/src/app/App.tsx`, styling in `apps/web/src/styles/layout.css`, and EN/FR keys.
- request-AC6 -> This task. Proof: README, changelog, playtest docs, roadmap, implementation roadmap, and Logics workflow docs updated.
