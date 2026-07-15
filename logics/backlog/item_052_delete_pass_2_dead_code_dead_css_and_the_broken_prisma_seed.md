## item_052_delete_pass_2_dead_code_dead_css_and_the_broken_prisma_seed - Delete pass-2 dead code, dead CSS, and the broken prisma seed
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 80%
> Complexity: Low
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The second audit pass found dead weight the first pass missed: prisma/seed.ts is both dead and broken (it targets the removed leagueId_round compound-unique key, so `prisma db seed` fails while scripts/seed-playtest-league.ts already covers seeding); nine CSS rules/tokens style classes no component renders; several data fields are written but never read (CardDefinition.id and consumable, the web decisions rivalTeamId type field, the RaceDecision.defaulted column, bot claim codes); and four helpers carry parameters or wrappers only ever used one way.

# Scope
- In:
  - Delete prisma/seed.ts and the db:seed entry in package.json.
  - Delete the dead CSS rules and tokens listed in AC11 from apps/web/src/styles/layout.css and tokens.css.
  - Drop CardDefinition.id and consumable from the type and all 15 card records; drop rivalTeamId from apps/web/src/app/types.ts; drop the RaceDecision.defaulted column with a migration and remove its write sites; pass null for bot claim codes.
  - Inline createReplayTracePoint's mode param, replace QUALIFYING_LOCK_CARDS with a direct comparison, collapse profileMenu's twin booleans, inline pointOnRoute.
  - Delete the legacy PLAYER_CLAIM_KEY migration path in App.tsx (parseLegacyClaim, the migrate branch in loadPlayerClaims, the removeItem in forgetProfile) — owner confirmed on 2026-07-15 that no live player predates PLAYER_CLAIMS_KEY.
  - Ship the RaceDecision.defaulted column drop as a normal prisma migration — owner confirmed the DB is a disposable dev instance in Docker.
  - Add @grifhinz/logics-manager as a root devDependency (owner decision) so the logics:validate script no longer depends on a global install.
  - Re-verify each symbol has zero references before deleting.
- Out:
  - Pass-1 findings (item_048/049/050/051).
  - Any behavior, styling, or gameplay change.
  - The boilerplate consolidation covered by item_053.

# Acceptance criteria
- AC10: The broken prisma/seed.ts and its db:seed script entry are removed; scripts/seed-playtest-league.ts remains the single seeding path.
- AC11: Dead CSS is removed (.eyebrow, .hero-topline, .race-telemetry, .command-hint, .profile-league-summary, dead .standings-list and .garage-locked selector fragments, unused --color-warning and --color-danger tokens) and no rendered surface changes.
- AC12: Never-read data fields are gone: CardDefinition.id and CardDefinition.consumable, the web-side decisions rivalTeamId type field, and the write-only RaceDecision.defaulted column (with migration), plus the unused bot claim codes.
- AC13: Single-use parameterizations are inlined: createReplayTracePoint's mode param, the one-element QUALIFYING_LOCK_CARDS set, profileMenu's twin booleans, and the pointOnRoute wrapper.
- AC15: The legacy PLAYER_CLAIM_KEY migration path is deleted only after the owner confirms no live player predates PLAYER_CLAIMS_KEY; otherwise it is kept and the finding closed with that note.

# AC Traceability
- request-AC10 -> This backlog slice. Proof: AC10: The broken prisma/seed.ts and its db:seed script entry are removed; scripts/seed-playtest-league.ts remains the single seeding path.
- request-AC11 -> This backlog slice. Proof: AC11: Dead CSS is removed (.eyebrow, .hero-topline, .race-telemetry, .command-hint, .profile-league-summary, dead .standings-list and .garage-locked selector fragments, unused --color-warning and --color-danger tokens) and no rendered surface changes.
- request-AC12 -> This backlog slice. Proof: AC12: Never-read data fields are gone: CardDefinition.id and CardDefinition.consumable, the web-side decisions rivalTeamId type field, and the write-only RaceDecision.defaulted column (with migration), plus the unused bot claim codes.
- request-AC13 -> This backlog slice. Proof: AC13: Single-use parameterizations are inlined: createReplayTracePoint's mode param, the one-element QUALIFYING_LOCK_CARDS set, profileMenu's twin booleans, and the pointOnRoute wrapper.
- request-AC15 -> This backlog slice. Proof: AC15: The legacy PLAYER_CLAIM_KEY migration path is deleted only after the owner confirms no live player predates PLAYER_CLAIMS_KEY; otherwise it is kept and the finding closed with that note.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_033_over_engineering_cleanup_pass_1.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Delete pass-2 dead code, dead CSS, and the broken prisma seed
- Keywords: backlog-groom, request, delete pass-2 dead code, dead css, and the broken prisma seed, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Delete pass-2 dead code, dead CSS, and the broken prisma seed.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_033_over_engineering_cleanup_pass_1` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_033_over_engineering_cleanup_pass_1.md`.
- Generated locally by logics-manager.
