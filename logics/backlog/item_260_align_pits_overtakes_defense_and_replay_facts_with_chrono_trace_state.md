## item_260_align_pits_overtakes_defense_and_replay_facts_with_chrono_trace_state - Align pits, overtakes, defense, and replay facts with chrono trace state
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
- Pit/overtake/defense annotations can still be partly post-processed after trace creation.
- Replay facts should describe actual motion state transitions, especially when order changes happen.

# Scope
- In:
  - Represent pit entry, pit_stop, and pit_exit as chrono state phases tied to pitLaneProgress and pit strategy.
  - Emit or annotate overtake phases only around actual non-pit order changes in adjacent sampled trace states.
  - Mark defending only when nearby cars and racecraft conditions make the marker plausible.
  - Update replayFacts/director beats to consume trace-derived order changes and pit states.
  - Ensure RaceEvent traceProgress, trackProgress, zoneKind, and zoneLabel align with the nearest relevant trace state.
- Out:
  - New event art, new UI copy systems, or replay overlay redesign.
  - Full attack/defense pack physics.
  - Changing the card catalogue or economy rewards.

# Acceptance criteria
- AC1: Pit events line up with pit_stop trace phases and pitLaneProgress within documented tolerances.
- AC2: replayFacts.orderChanges correspond to actual order changes and have nearby overtake phases unless pit-related.
- AC3: Defense/overtake/risk markers never contradict speed, phase, order, or final gaps in validateReplayTrace.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Pit events line up with pit_stop trace phases and pitLaneProgress within documented tolerances.
- request-AC4 -> This backlog slice. Proof: AC2: replayFacts.orderChanges correspond to actual order changes and have nearby overtake phases unless pit-related.
- request-AC6 -> This backlog slice. Proof: AC3: Defense/overtake/risk markers never contradict speed, phase, order, or final gaps in validateReplayTrace.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_066_chrono_engine_v2_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_103_chrono_engine_v2_extract_the_race_engine_module_and_make_replay_trace_a_minimal_time_distance_simulation`
- Primary task(s): `task_104_orchestrate_chrono_engine_v2_module_extraction_and_trace_capture`

# AI Context
- Summary: Align pits, overtakes, defense, and replay facts with chrono trace state
- Keywords: scaffolded-backlog, align pits, overtakes, defense, and replay facts with chrono trace state, implementation-ready
- Use when: Implementing the scaffolded slice for Align pits, overtakes, defense, and replay facts with chrono trace state.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_104_orchestrate_chrono_engine_v2_module_extraction_and_trace_capture` was finished via `logics-manager flow finish task` on 2026-07-23.
