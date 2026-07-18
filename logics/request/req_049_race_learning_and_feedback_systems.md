## req_049_race_learning_and_feedback_systems - Race learning and feedback systems
> From version: 0.3.7
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Complexity: High
> Theme: Race learning, feedback, and strategy clarity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make chrono attempts teach the player something, not just produce a lap time.
- Let players browse previous chrono attempts and compare their tested configurations.
- Carry the best chrono evidence into final plan validation so the app can suggest a stronger configuration before the player locks the plan.
- Make weather visible on the map so forecast and resolved conditions feel embodied, not only textual.
- Make replay events visible near cars so the map feels alive while the replay runs.
- After the replay, show a compact race payoff recap: what the player gained, lost, spent, and learned.
- Rebalance the first session so players start with credits and choose their first card deliberately instead of receiving a card by default.
- Explore a simple tire-preparation choice in Plan without bloating the current directive loop.

# Context
- Qualifying already exists as `/leagues/:leagueId/qualifying` and stores `currentGrandPrix.qualifyingRuns`; the web derives `playerQualifyingRuns`, `lastQualifyingRun`, `qualifyingLeaderboard`, and `qualifyingReplayEntries` in `App.tsx`.
- A `QualifyingRun` already contains the tested `decision` plus a `result`, so the UI can compare lap times and configurations without inventing a new domain object.
- Final plan validation already routes through confirmation modals in `App.tsx`; this is the lowest-friction place to surface best-chrono suggestions.
- `CircuitMap` already receives circuit identity and cars; weather is currently textual in map status and does not alter the visual treatment.
- `ReplayView` already has animated cars, replay live state, and race event data; rendering short event callouts near cars should reuse existing event timestamps and car positions instead of adding a new replay engine.
- `ResultView` and report helpers already display replay/report content and race rewards; the missing piece is a compact payoff summary immediately after replay completion or beside the report entry point.
- New league teams currently start with zero credits in `apps/api/src/features/leagues/store.ts`, while tests and fixtures often seed cards such as `rain_grip`; the starter economy must be changed deliberately with fixture updates.
- `DirectivePanel` has a three-step directive loop: approach, preparation, card. Existing preparations are speed, reliability, and weather; tire strategy can be added as a fourth directive field only if the simulation and copy stay simple.

# Acceptance criteria
- AC1: After every chrono attempt, the player can read a dynamic chrono report with lap time, tested configuration, circuit/weather context, comparison to the player's best attempt, and one actionable interpretation.
- AC2: The player can navigate chrono session history for the current GP and distinguish best/current/older attempts without losing the main race desk flow.
- AC3: Before final plan submission, the app suggests the best observed chrono configuration when it differs from the current plan and lets the player understand the tradeoff without forcing auto-apply.
- AC4: Map visuals reflect weather states in a lightweight, readable way across desktop and mobile, without hiding route, cars, or controls.
- AC5: Replay events can appear as short visual callouts near the affected car(s), keyed from real simulation events and bounded so the map stays legible.
- AC6: After replay completion, the player sees a payoff recap containing position change, points, credits, card spend/consumption, and championship movement when available.
- AC7: New leagues start without an inventory card and with a deliberate starting credit balance that lets the player choose an early card; tests and fixtures reflect the new economy.
- AC8: Tire strategy is specified as a small, testable mechanic with three choices (soft/medium/hard or equivalent), clear effects, and no speculative tire-management system.
- AC9: EN and FR copy exists for every new player-facing string; no hardcoded user-facing strings are introduced.
- AC10: Typecheck, lint, unit tests, build, and affected E2E flows pass for each shipped item.

# AC Traceability
- AC1 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: `apps/web/src/app/App.tsx` renders the chrono report from `QualifyingRun` data with best time, grid position, latest gap, remaining attempts, and suggestion copy.
- AC2 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: `apps/web/src/app/App.tsx` renders session history and opens selected qualifying replays; `apps/web/src/app/App.test.tsx` covers the Plan history navigation.
- AC3 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: `buildChronoReport` compares the current plan with the best observed chrono decision and suggests whether to reuse or retest the setup.
- AC4 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: `apps/web/src/features/CircuitMap.tsx` accepts a weather state and `apps/web/src/styles/layout.css` renders light/heavy rain ambience without hiding controls.
- AC5 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: `apps/web/src/features/ReplayView.tsx` attaches active event labels to affected cars and `apps/web/src/app/App.test.tsx` asserts the replay map event label.
- AC6 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: `apps/web/src/features/ResultView.tsx` shows finish, race movement, points, credits, card spend, and championship rank movement when a result is available.
- AC7 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: `apps/api/src/features/leagues/store.ts` creates/joins/restarts human teams with starter credits and no cards; `apps/api/src/app.test.ts` covers the new economy.
- AC8 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json` frame the three existing preparation choices as tire prep without adding a speculative tire-management system.
- AC9 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: new user-facing strings are present in EN and FR locale catalogs.
- AC10 -> `task_050_orchestrate_race_learning_and_feedback_systems`. Proof: `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `logics-manager flow validate req_049_race_learning_and_feedback_systems`, `logics-manager lint --require-status`, and `logics-manager audit --group-by-doc` passed.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_020_race_learning_and_feedback_systems_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/roadmap/road_001_cr_league_roadmap.md
- apps/web/src/app/App.tsx
- apps/web/src/app/helpers.ts
- apps/web/src/features/DirectivePanel.tsx
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/ResultView.tsx
- apps/web/src/features/GarageView.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/store.ts
- packages/shared/src/domain/race.ts
- packages/shared/src/simulation/simulateRace.ts
- User feedback (2026-07-18): players want a dynamic qualifying report, navigable chrono session history, plan suggestions based on the best chrono configuration, weather-influenced map visuals, visible replay events near cars, a clear post-replay gains/losses recap, no starter inventory card with more starting credits instead, and a richer tire preparation choice.

# AI Context
- Summary: Race learning and feedback systems
- Keywords: request-chain-scaffold, race learning and feedback systems, development-ready
- Use when: You need to implement or review the scaffolded workflow for Race learning and feedback systems.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_118_add_dynamic_chrono_report_after_each_qualifying_attempt`
- `item_119_make_chrono_session_history_navigable`
- `item_120_suggest_the_best_chrono_backed_configuration_before_plan_lock`
- `item_121_add_weather_visual_states_to_the_circuit_map`
- `item_122_render_replay_event_callouts_near_cars`
- `item_123_add_post_replay_payoff_recap`
- `item_124_start_new_leagues_with_credits_instead_of_a_starter_card`
- `item_125_specify_and_implement_a_simple_tire_strategy_directive`
