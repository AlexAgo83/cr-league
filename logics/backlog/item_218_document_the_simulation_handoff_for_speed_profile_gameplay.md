## item_218_document_the_simulation_handoff_for_speed_profile_gameplay - Document the simulation handoff for speed-profile gameplay
> From version: 0.3.28
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Simulation follow-up
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Speed profiles are likely useful for future gameplay, but wiring them into race outcomes before the replay behavior is proven would mix visual fidelity with balance changes.
- The future simulation model needs clear criteria so it does not become speculative physics scope inside this replay request.

# Scope
- In:
  - Document the later simulation gate: replay-only profile accepted, pit/events still aligned, no audit anomalies, and a fresh balance baseline available.
  - List likely future simulation uses: pace advantage on straights, control/grip advantage in corners, weather penalties amplified in curved zones, and overtake probability in fast zones.
  - State that this request intentionally leaves classification, scoring, card effects, bot strategy, and economy untouched.
- Out:
  - Implementing simulation scoring from speed profiles.
  - Changing cards, rewards, bot strategies, or balance constants.
  - Creating a full physics model.

# Acceptance criteria
- AC1: Closeout or a linked note clearly states the criteria for a future simulation integration pass.
- AC2: No race outcome, card, reward, or bot-strategy behavior changes ship in this request.

# Simulation handoff
- A later simulation pass may use the profile for straight-line pace, corner control/grip, weather-amplified curved-zone penalties, and overtake probability in fast zones.
- Gate that later pass on accepted replay behavior, passing circuit audit, pit/event alignment proof, and a fresh balance baseline.
- This slice intentionally leaves `simulateRace`, card balance, bot strategy, scoring, rewards, economy, and classification untouched.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Closeout or a linked note clearly states the criteria for a future simulation integration pass.
- request-AC6 -> This backlog slice. Proof: AC2: No race outcome, card, reward, or bot-strategy behavior changes ship in this request.
- request-AC3 -> This backlog slice. Proof: The handoff explicitly keeps this request replay-only and defers simulation/outcome use.
- request-AC4 -> This backlog slice. Evidence needed: Replay remains deterministic and watchable across representative circuits: a mostly straight route, a tight technical route, a long route, and a pit-stop race all keep aligned markers/events and non-jarring car motion.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_058_canonical_corner_speed_profile_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_095_canonical_corner_speed_profile_for_replay_motion`
- Primary task(s): `task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion`

# AI Context
- Summary: Document the simulation handoff for speed-profile gameplay
- Keywords: scaffolded-backlog, document the simulation handoff for speed-profile gameplay, implementation-ready
- Use when: Implementing the scaffolded slice for Document the simulation handoff for speed-profile gameplay.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion`

# Notes
- Task `task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion` was finished via `logics-manager flow finish task` on 2026-07-23.
