## req_014_add_cr_league_simulation_preview_api_and_screen - Add CR League simulation preview API and screen
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Implementation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Expose the pure shared simulation through a minimal API preview endpoint.
- Add a web screen that runs the demo Grand Prix and displays the returned race result.
- Keep the slice deliberately non-persistent: no league state, auth, database writes, or scheduling.

# Context
- The pure simulation core exists in `packages/shared`.
- The current app has a Fastify API and a Vite React shell.
- This slice is meant to make the simulation tangible before adding database persistence.

# Acceptance criteria
- AC1: API exposes `POST /simulation/preview` and returns a `RaceResult`.
- AC2: Calling the endpoint without a body runs a shared demo race.
- AC3: Invalid preview input returns a 400 instead of crashing the server.
- AC4: Web app loads the preview, shows loading/error states, and renders classification, key events, and report blocks.
- AC5: Tests cover the API preview route and the web preview rendering.
- AC6: Validation passes.
- AC7: No DB, auth, scheduling, inventory persistence, or multiplayer state is introduced.

# AC Traceability
- AC1 -> `task_015_add_cr_league_simulation_preview_api_and_screen`. Proof: simulation route registered in the Fastify app.
- AC2 -> `task_015_add_cr_league_simulation_preview_api_and_screen`. Proof: shared `DEMO_RACE_INPUT` powers empty-body preview calls.
- AC3 -> `task_015_add_cr_league_simulation_preview_api_and_screen`. Proof: route validates the minimal `RaceInput` shape before simulating.
- AC4 -> `task_015_add_cr_league_simulation_preview_api_and_screen`. Proof: web `App` renders preview state and result sections.
- AC5 -> `task_015_add_cr_league_simulation_preview_api_and_screen`. Proof: API and web tests cover the preview flow.
- AC6 -> `task_015_add_cr_league_simulation_preview_api_and_screen`. Proof: validation commands passed.
- AC7 -> `task_015_add_cr_league_simulation_preview_api_and_screen`. Proof: no persistence or multiplayer files were introduced.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `req_013_implement_cr_league_pure_simulation_core`
- `item_019_implement_cr_league_pure_simulation_core`
- `task_014_implement_cr_league_pure_simulation_core`

# AI Context
- Summary: Add a minimal API and web screen for previewing the CR League simulation.
- Keywords: simulation-preview, fastify, react, race-result
- Use when: Working on the first interactive preview of the simulation.
- Skip when: Working on persistent leagues, auth, scheduling, or multiplayer state.

# Backlog
- `item_020_add_cr_league_simulation_preview_api_and_screen`
