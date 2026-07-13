## req_015_add_minimal_league_persistence_api - Add minimal league persistence API
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Implementation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add the first persistent league data model so CR League can move beyond a static demo race.
- Expose minimal API endpoints to create a demo league, read league state, submit a race decision, and resolve the current Grand Prix.
- Keep the slice API/backend-only; the full playable frontend flow comes next.

# Context
- The pure simulation engine already exists in `packages/shared`.
- The API can already preview a race without persistence.
- PostgreSQL with Prisma is the selected persistence path, using a dedicated schema from `DATABASE_URL`.

# Acceptance criteria
- AC1: Prisma schema defines minimal league, team, Grand Prix, and race decision models.
- AC2: API runtime owns a Prisma client and registers league routes in server mode.
- AC3: API can create a demo league with teams and a current Grand Prix.
- AC4: API can read league state.
- AC5: API can submit or replace a team race decision for the current Grand Prix.
- AC6: API can resolve the current Grand Prix using the shared simulation and persist result/rewards.
- AC7: Tests cover the league API flow without requiring a live PostgreSQL server.
- AC8: Validation passes.
- AC9: Frontend gameplay, auth, invite flow, inventory persistence, and scheduling remain out of scope.

# AC Traceability
- AC1 -> `task_016_add_minimal_league_persistence_api`. Proof: Prisma models added in `prisma/schema.prisma`.
- AC2 -> `task_016_add_minimal_league_persistence_api`. Proof: `apps/api/src/db/client.ts` and `buildApp` dependency registration.
- AC3 -> `task_016_add_minimal_league_persistence_api`. Proof: `POST /leagues`.
- AC4 -> `task_016_add_minimal_league_persistence_api`. Proof: `GET /leagues/:leagueId`.
- AC5 -> `task_016_add_minimal_league_persistence_api`. Proof: `POST /leagues/:leagueId/decisions`.
- AC6 -> `task_016_add_minimal_league_persistence_api`. Proof: `POST /leagues/:leagueId/resolve`.
- AC7 -> `task_016_add_minimal_league_persistence_api`. Proof: in-memory Prisma fake in API tests.
- AC8 -> `task_016_add_minimal_league_persistence_api`. Proof: validation commands passed.
- AC9 -> `task_016_add_minimal_league_persistence_api`. Proof: no frontend gameplay/auth/scheduling/inventory implementation added.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `req_014_add_cr_league_simulation_preview_api_and_screen`
- `task_015_add_cr_league_simulation_preview_api_and_screen`
- `adr_004_data_security`

# AI Context
- Summary: Add the first minimal persistent league API for CR League.
- Keywords: prisma, league-api, grand-prix, race-decision, persistence
- Use when: Working on backend league state before the playable frontend flow.
- Skip when: Working on UI-only preview, auth, invite codes, inventory, or scheduling.

# Backlog
- `item_021_add_minimal_league_persistence_api`
