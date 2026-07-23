## task_108_polish_replay_focus_launch_continuity_drift_and_headlights - Polish replay focus, launch continuity, drift, and headlights
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
- `item_265_polish_replay_focus_launch_continuity_drift_and_headlights`

# Acceptance criteria
- AC1: Wire focused replay car state through `ReplayView` and `CircuitMap`.
- AC2: Reset camera target to the player when focus mode changes or replay restarts.
- AC3: Skip malformed persisted launch plateaus and reject future motion state during trace generation.
- AC4: Raise bounded drift amplitude, tune front headlight blending, and add
  metadata-positioned rear lights with braking glow.
- AC5: Add focused tests and validate `/replay/cmry51iq` through shared Chrome.

# AC Traceability
- request-AC1 -> This task. Proof: `CircuitMap` reports clicked cars and `ReplayView` uses the selected ID as the camera target only in focus mode.
- request-AC2 -> This task. Proof: focus-mode and restart wrappers restore `playerCar.id`; shared Chrome measurements show zero camera-target error after each reset.
- request-AC3 -> This task. Proof: `replayMath.ts` interpolates across malformed launch plateaus and `chronoRaceEngine.ts` rejects previous samples from later timestamps; both have regression tests.
- request-AC4 -> This task. Proof: drift is bounded at 22 degrees, front headlights
  use blurred `soft-light` blending, and rear metadata lights gain glow in `braking`
  speed-profile spans.
- request-AC5 -> This task. Proof: focused suites, static checks, and per-car launch sampling on the reported replay provide validation.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_108_polish_replay_focus_launch_continuity_drift_and_headlights.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_108_polish_replay_focus_launch_continuity_drift_and_headlights.md` after implementation.
- 303 tests passed; typecheck, ESLint, and production build passed; /replay/cmry51iq sampled all eight cars at max 4.56 units per 100ms with zero frozen samples; clicked rival, focus-mode reset, and restart reset each measured zero camera-target error; front/rear lights and braking glow visually inspected in shared Chrome
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- Added click-to-focus camera targeting with deterministic player resets.
- Repaired historical launch plateaus at read time and future trace ordering at generation time.
- Strengthened front-axle drift, tuned front headlights, and added braking-aware rear lights.
- Verified the reported replay moved all eight cars continuously with no zero-motion samples.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_265_polish_replay_focus_launch_continuity_drift_and_headlights`
- Related request(s): `req_107_polish_replay_focus_launch_continuity_drift_and_headlights`

# AI Context
- Summary: Implement replay target selection, launch continuity repair, and visual effect tuning.
- Keywords: ReplayView, CircuitMap, replayMath, chronoRaceEngine, focus, launch
- Use when: Implementing or validating this replay interaction and continuity slice.
- Skip when: Work does not affect replay camera, trace movement, or car visuals.

# Links
- Request: `req_107_polish_replay_focus_launch_continuity_drift_and_headlights`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
