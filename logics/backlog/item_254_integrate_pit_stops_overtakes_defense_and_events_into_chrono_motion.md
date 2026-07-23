## item_254_integrate_pit_stops_overtakes_defense_and_events_into_chrono_motion - Integrate pit stops, overtakes, defense, and events into chrono motion
> From version: 0.4.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Race interactions
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Pit stops, overtakes, defense, and incidents are currently mostly score/events plus replay annotations. In the chrono model they must affect time/distance and not just narrative text.
- Replay order changes need to be actual consequences of simulated distance/finish timing, not post-hoc decorations.

# Scope
- In:
  - Represent pit entry, pit_stop, and pit_exit as motion phases with time loss and track progress behavior tied to pitLaneProgress.
  - Model overtakes and defense as deterministic local effects when cars are close in eligible zones, using attack/defense/control parameters and seeded risk.
  - Attach RaceEvent.traceProgress, trackProgress, zoneKind, and zoneLabel from the actual motion state.
  - Keep flavor/mini-info events if useful, but ensure they do not contradict speed, phase, gaps, or order.
  - Update replayFacts orderChanges/directorBeats generation to read the chrono trace and event facts.
- Out:
  - Lane selection, collision avoidance, or full pack physics.
  - New event art/UI work.
  - Broad copy rewrites.

# Acceptance criteria
- AC1: Pit phases are ordered and align with pit events and pitLaneProgress.
- AC2: Overtake orderChanges correspond to actual order changes in the trace and include plausible nearby phases.
- AC3: Defense/attack/incidents change elapsed time or motion state when emitted, instead of being purely narrative.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Pit phases are ordered and align with pit events and pitLaneProgress.
- request-AC3 -> This backlog slice. Proof: AC2: Overtake orderChanges correspond to actual order changes in the trace and include plausible nearby phases.
- request-AC4 -> This backlog slice. Proof: AC3: Defense/attack/incidents change elapsed time or motion state when emitted, instead of being purely narrative.
- request-AC5 -> This backlog slice. Evidence needed: Determinism is proven across repeated runs for representative seeds/circuits/weather/pit/card combinations, and balance simulations show acceptable distributions for winner spread, gap spread, card impact, weather impact, and pit strategy impact.
- request-AC6 -> This backlog slice. Evidence needed: The migration is contained: public RaceInput/RaceResult contracts remain compatible unless an additive field is justified, web replay still works without UI rewrites, and unrelated API/storage/release/circuit-catalog files are untouched.
- request-AC7 -> This backlog slice. Evidence needed: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, npm run balance:sim (or a bounded documented subset), and npm run logics:validate pass, with validation evidence recorded at task closeout.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_065_track_driven_chrono_race_engine_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_102_track_driven_chrono_race_engine_derive_grand_prix_timing_gaps_classification_and_replay_from_speed_over_the_race_track`
- Primary task(s): `task_103_orchestrate_track_driven_chrono_race_engine_migration`

# AI Context
- Summary: Integrate pit stops, overtakes, defense, and events into chrono motion
- Keywords: scaffolded-backlog, integrate pit stops, overtakes, defense, and events into chrono motion, implementation-ready
- Use when: Implementing the scaffolded slice for Integrate pit stops, overtakes, defense, and events into chrono motion.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_103_orchestrate_track_driven_chrono_race_engine_migration`

# Notes
- Task `task_103_orchestrate_track_driven_chrono_race_engine_migration` was finished via `logics-manager flow finish task` on 2026-07-23.
