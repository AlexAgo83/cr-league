## item_106_implement_arcade_plausible_replay_movement - Implement arcade-plausible replay movement
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Replay implementation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Current car movement can make rank changes feel abrupt because progress and order are interpolated from sparse segment snapshots.
- Different circuits can amplify those artifacts through path length, camera framing, and lap count differences.
- Players should read overtakes and gaps as a coherent race story even if the model remains arcade-like.

# Scope
- In:
  - Build the replay staging adapter from the agreed contract.
  - Update `ReplayView.tsx` and related helpers so car progress, tower order, moment notifications, and marker seeking consume staged replay data where appropriate.
  - Stage overtakes visually with short approach, side-by-side or lane-offset, swap, and settle phases.
  - Keep weather markers, active moment notifications, focus driver, camera, speed menu, replay progress, and report access working.
  - Ensure shortest, longest, wet, technical, and high-overtaking circuits still frame cars and labels correctly on desktop and mobile.
- Out:
  - Changing race winner selection outside the existing simulation model.
  - Adding new car art, audio, 3D, or animation libraries.
  - Redesigning the whole result screen.
  - Changing league API contracts unless required by tests and explicitly documented.

# Acceptance criteria
- AC1: Overtakes in replay are visually staged instead of appearing as instantaneous rank jumps.
- AC2: The tower, car markers, active notification, and progress bar agree about the currently staged race moment.
- AC3: Seeking before, during, and after an overtake shows stable deterministic state.
- AC4: Replay finish order always matches `RaceResult.classification`.
- AC5: Desktop and mobile replay screenshots show no broken camera framing, clipped cars, or overlapping labels across representative circuits.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Overtakes in replay are visually staged instead of appearing as instantaneous rank jumps.
- request-AC5 -> This backlog slice. Proof: AC2: The tower, car markers, active notification, and progress bar agree about the currently staged race moment.
- request-AC6 -> This backlog slice. Proof: AC3: Seeking before, during, and after an overtake shows stable deterministic state.
- request-AC7 -> This backlog slice. Proof: AC4: Replay finish order always matches `RaceResult.classification`.
- request-AC8 -> This backlog slice. Proof: AC5: Desktop and mobile replay screenshots show no broken camera framing, clipped cars, or overlapping labels across representative circuits.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_017_coherent_race_replay_and_simulation_realism_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_046_make_race_simulation_and_replay_feel_coherent_across_circuits`
- Primary task(s): `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`

# AI Context
- Summary: Implement arcade-plausible replay movement
- Keywords: scaffolded-backlog, implement arcade-plausible replay movement, implementation-ready
- Use when: Implementing the scaffolded slice for Implement arcade-plausible replay movement.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
