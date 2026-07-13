## item_002_build_the_first_league_and_team_experience - Build the first league and team experience
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Onboarding and league setup
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Players must be able to start quickly either alone or with a private group.
- League creation can become intimidating if too many settings are exposed too early.

# Scope
- In:
  - Create a racing team profile with name, colors, and a simple identity.
  - Start solo mode with bots immediately.
  - Create a private league with a short invite code.
  - Join a private league using a short invite code.
  - Use sensible default settings: 8 Grand Prix season, private league, bots available, weekly multiplayer cadence, manual immediate solo cadence.
- Out:
  - Public matchmaking.
  - Authentication beyond what is needed for a first playable prototype.
  - Rich cosmetic customization.
  - Advanced league administration.

# Acceptance criteria
- AC1: A new user can create a team and reach the next Grand Prix briefing without reading instructions.
- AC2: A solo league can be created with bots and run immediately.
- AC3: A private multiplayer league can be created and joined through a six-character code or equivalent short code.
- AC4: League creation exposes only a small set of settings while preserving strong defaults.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: A new user can create a team and reach the next Grand Prix briefing without reading instructions.
- request-AC7 -> This backlog slice. Proof: AC2: A solo league can be created with bots and run immediately.
- request-AC3 -> This backlog slice. Evidence needed: The Grand Prix loop is described from pre-race briefing through player decisions, simulation, replay, report, rewards, and championship progression.
- request-AC4 -> This backlog slice. Evidence needed: The brief defines cards as simple, mostly consumable special moves with clear race-story impact and a one-card-per-Grand-Prix V1 assumption.
- request-AC5 -> This backlog slice. Evidence needed: The brief captures the balancing philosophy: trailing players receive comeback options and additional goals without being granted automatic victories.
- request-AC6 -> This backlog slice. Evidence needed: The brief explicitly excludes V1 features that would inflate cost or scope, including live real-time races, complex 3D rendering, deep market systems, advanced notifications, and heavy vehicle upgrade trees.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_000_define_the_asynchronous_racing_league_game_product_brief`
- Primary task(s): `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery`

# AI Context
- Summary: Build the first league and team experience
- Keywords: scaffolded-backlog, build the first league and team experience, implementation-ready
- Use when: Implementing the scaffolded slice for Build the first league and team experience.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery` was finished via `logics-manager flow finish task` on 2026-07-13.
