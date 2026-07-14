## req_026_add_between_gp_progression_v0 - Add between-GP progression v0
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: Between-GP progression v0 delivered as a thin persisted card inventory, fixed-price purchase, owned-card validation, and post-GP consumption slice.
> Confidence: 90
> Complexity: Medium
> Theme: Economy and progression
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add the first lightweight between-GP progression hook so a resolved Grand Prix leads to a small garage decision before the next race.
- Keep this intentionally thinner than the full card economy: enough inventory, buying, and consumption to validate the loop without adding selling, rarity, pack opening, or balance complexity.

# Context
- Playtest feedback showed that chaining GPs is technically smooth but lacks a progression reason to continue.
- The simulation already supports consumable card effects and credits, but the player could previously select cards without inventory ownership.
- This slice should make credits matter immediately while staying compatible with the later V1 card/economy backlog.

# Acceptance criteria
- AC1: Teams have a persisted card inventory exposed in league state.
- AC2: A player can buy a card with earned credits through the API after a GP and see it in the app.
- AC3: A submitted directive can only use a card owned by that team.
- AC4: A played consumable card is removed from inventory after GP resolution.
- AC5: The app shows a minimal between-GP garage/inventory view with English and French copy.
- AC6: Docs and Logics reflect the delivered thin progression hook and remaining economy limits.

# AC Traceability
- AC1 -> `task_027_add_between_gp_progression_v0`. Proof: `Team.cards` in `prisma/schema.prisma`, migration `20260714233000_add_team_cards`, and `LeagueState.teams[].cards` in `apps/api/src/features/leagues/store.ts`.
- AC2 -> `task_027_add_between_gp_progression_v0`. Proof: `POST /leagues/:leagueId/cards/buy`, API tests, and e2e garage purchase coverage.
- AC3 -> `task_027_add_between_gp_progression_v0`. Proof: `submitDecision` checks the selected card against the team's inventory before upserting a directive.
- AC4 -> `task_027_add_between_gp_progression_v0`. Proof: `resolveCurrentGrandPrix` removes each `result.consumedCards` entry from the matching team inventory.
- AC5 -> `task_027_add_between_gp_progression_v0`. Proof: garage section in `apps/web/src/app/App.tsx`, styling in `apps/web/src/styles/layout.css`, and EN/FR keys.
- AC6 -> `task_027_add_between_gp_progression_v0`. Proof: README, changelog, playtest docs, roadmap, implementation roadmap, and Logics workflow docs updated.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `logics_manager/flow.py`
- `logics_manager/assist.py`
- `tests/python/test_logics_manager_cli.py`

# AI Context
- Summary: Draft a bounded request for add between-gp progression v0.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Scope boundaries
- In: team inventory persistence, starter card, fixed-price buy endpoint, owned-card validation, card consumption, minimal garage UI, EN/FR strings, validation.
- Out: selling, rarity, pack draw, dynamic pricing, catch-up tuning, card balance telemetry, full deckbuilding UI.

# Backlog
- `item_032_add_between_gp_progression_v0`
