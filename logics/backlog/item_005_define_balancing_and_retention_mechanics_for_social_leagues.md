## item_005_define_balancing_and_retention_mechanics_for_social_leagues - Define balancing and retention mechanics for social leagues
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: League retention
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A championship can lose players quickly if early leaders run away or trailing players feel they have nothing meaningful to do.
- Overt rubber-banding can frustrate leaders and make wins feel fake.

# Scope
- In:
  - Define comeback philosophy and acceptable mechanisms.
  - Add rival goals so players can care about beating nearby opponents even when they are not fighting for first.
  - Reward trailing players with slightly better opportunity access, such as more credits or cards that are stronger from behind.
  - Define bot personalities that create readable opponents in solo and filled multiplayer leagues.
  - Define absent-player defaults for multiplayer deadlines.
- Out:
  - Hidden manipulation of race results to force close championships.
  - Complex matchmaking rating.
  - Public competitive ladder.
  - Push notification strategy beyond future consideration.

# Acceptance criteria
- AC1: The design names at least three non-cheating comeback mechanisms.
- AC2: A player outside the title fight still has at least one meaningful goal per Grand Prix.
- AC3: Bot profiles have simple, legible tendencies.
- AC4: Multiplayer races can proceed when one or more players miss the preparation deadline.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The design names at least three non-cheating comeback mechanisms.
- request-AC5 -> This backlog slice. Proof: AC2: A player outside the title fight still has at least one meaningful goal per Grand Prix.
- request-AC3 -> This backlog slice. Evidence needed: The Grand Prix loop is described from pre-race briefing through player decisions, simulation, replay, report, rewards, and championship progression.
- request-AC4 -> This backlog slice. Evidence needed: The brief defines cards as simple, mostly consumable special moves with clear race-story impact and a one-card-per-Grand-Prix V1 assumption.
- request-AC6 -> This backlog slice. Evidence needed: The brief explicitly excludes V1 features that would inflate cost or scope, including live real-time races, complex 3D rendering, deep market systems, advanced notifications, and heavy vehicle upgrade trees.
- request-AC7 -> This backlog slice. Evidence needed: The backlog identifies the first development slices required to validate fun: league setup, team creation, race preparation, simulation, replay/reporting, cards/inventory, and progression.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_000_define_the_asynchronous_racing_league_game_product_brief`
- Primary task(s): `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery`

# AI Context
- Summary: Define balancing and retention mechanics for social leagues
- Keywords: scaffolded-backlog, define balancing and retention mechanics for social leagues, implementation-ready
- Use when: Implementing the scaffolded slice for Define balancing and retention mechanics for social leagues.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery` was finished via `logics-manager flow finish task` on 2026-07-13.
