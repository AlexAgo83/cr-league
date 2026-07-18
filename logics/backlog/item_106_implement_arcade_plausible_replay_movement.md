## item_106_implement_arcade_plausible_replay_movement - Implement arcade-plausible replay movement
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 96
> Confidence: 91
> Progress: 0
> Complexity: High
> Theme: Replay implementation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Current car movement can make rank changes feel abrupt because progress and order are interpolated from sparse segment snapshots.
- Different circuits can amplify those artifacts through path length, camera framing, and lap count differences.
- Players should read overtakes and gaps as a coherent race story even if the model remains arcade-like.
- The implementation should be tunable by reading the generated replay plan, not only by manually watching a finished replay.
- If the current `RaceResult` is too sparse, the replay should be fed by deterministic race-fact enrichment instead of UI-side guessing.

# Scope
- In:
  - Build the replay staging adapter from the agreed contract.
  - Add minimal `RaceResult` enrichment only when the staging contract proves the existing trace is not enough.
  - Keep enriched fields as race facts: gap snapshots, order changes, pressure windows, momentum shifts, attack/defense context, and event replay metadata.
  - Add the smallest practical readable inspection path for staged replay output, such as a fixture snapshot, debug helper, or test dump.
  - Update `ReplayView.tsx` and related helpers so car progress, tower order, moment notifications, and marker seeking consume staged replay data where appropriate.
  - Stage overtakes visually with setup, close-gap, side-by-side or lane-offset, swap, defend/counter, and settle phases.
  - Keep weather markers, active moment notifications, focus driver, camera, speed menu, replay progress, and report access working.
  - Ensure shortest, longest, wet, technical, and high-overtaking circuits still frame cars and labels correctly on desktop and mobile.
- Out:
  - Changing race winner selection outside the existing simulation model.
  - Putting animation curves, camera commands, CSS state, or display-only coordinates into `RaceResult`.
  - Adding new car art, audio, 3D, or animation libraries.
  - Redesigning the whole result screen.
  - Changing league API contracts unless required by tests and explicitly documented.

# Acceptance criteria
- AC1: Overtakes in replay are visually staged instead of appearing as instantaneous rank jumps.
- AC2: Any `RaceResult` enrichment is deterministic, covered by tests, and contains race facts rather than UI animation instructions.
- AC3: The tower, car markers, active notification, and progress bar agree about the currently staged race moment.
- AC4: Seeking before, during, and after an overtake shows stable deterministic state.
- AC5: Replay finish order always matches `RaceResult.classification`.
- AC6: Desktop and mobile replay screenshots show no broken camera framing, clipped cars, or overlapping labels across representative circuits.
- AC7: A developer or implementation agent can inspect a deterministic replay plan without relying only on visual playback.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC2: Any `RaceResult` enrichment is deterministic, covered by tests, and contains race facts rather than UI animation instructions.
- request-AC5 -> This backlog slice. Proof: AC1: Overtakes in replay are visually staged instead of appearing as instantaneous rank jumps.
- request-AC6 -> This backlog slice. Proof: AC3: The tower, car markers, active notification, and progress bar agree about the currently staged race moment.
- request-AC7 -> This backlog slice. Proof: AC6: Desktop and mobile replay screenshots show no broken camera framing, clipped cars, or overlapping labels across representative circuits.
- request-AC8 -> This backlog slice. Proof: AC5: Replay finish order always matches `RaceResult.classification`.
- request-AC9 -> This backlog slice. Proof: AC7: A developer or implementation agent can inspect a deterministic replay plan without relying only on visual playback.

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
