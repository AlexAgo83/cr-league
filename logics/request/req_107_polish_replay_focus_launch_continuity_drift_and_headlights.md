## req_107_polish_replay_focus_launch_continuity_drift_and_headlights - Polish replay focus, launch continuity, drift, and headlights
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replay interaction and realism
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let a player click any replay car to move the active focus camera to that driver.
- Restore the player's car when focus mode changes or replay restarts.
- Remove the early launch teleport/freeze visible in persisted and future chrono traces.
- Make front-axle drift clearer and headlights softer against the map.

# Context
- The issue is reproducible on `/replay/cmry51iq` around the first launch samples.
- Persisted traces contain a future launch position copied into earlier timestamps,
  followed by repeated flat samples.
- Replay cars, camera movement, headlights, and drift already share the SVG renderer.

# Acceptance criteria
- AC1: Clicking a car changes the camera target only while focus mode is active.
- AC2: Toggling focus mode or restarting resets the target to the player car.
- AC3: Existing malformed launch plateaus render continuously and new trace samples
  never reuse motion state from a future timestamp.
- AC4: Drift has a stronger bounded angle, front headlights use a blurred blend,
  and metadata-positioned rear lights glow more strongly while braking.
- AC5: Focus, trace continuity, geometry, and render behavior have focused coverage
  and are verified on the reported replay.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `apps/web/src/features/ReplayView.tsx`
- `apps/web/src/features/replay/replayMath.ts`
- `apps/web/src/features/CircuitMap.tsx`
- `packages/shared/src/simulation/chronoRaceEngine.ts`

# AI Context
- Summary: Polish replay camera targeting and car motion while repairing launch trace discontinuities.
- Keywords: replay, focus camera, launch trace, drift, headlights
- Use when: Changing replay camera targets, launch interpolation, or car visual effects.
- Skip when: Work is outside the replay map and chrono trace generation.

# Backlog
- none
- `item_265_polish_replay_focus_launch_continuity_drift_and_headlights`
