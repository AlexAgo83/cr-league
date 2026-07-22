## item_206_delete_client_side_replay_beat_re_derivation_replayfacts_is_the_sole_source - Delete client-side replay beat re-derivation; replayFacts is the sole source
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Over-engineering cleanup
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- replayDirector.ts:43-74 re-implements simulateRace's buildReplayDirectorBeats (grid/overtake/weather/pack/pit/final) line-for-line, gated as a fallback behind result.replayFacts?.directorBeats?.length (replayDirector.ts:33).
- orderChangesFromTrace (replayMath.ts:120-139) duplicates buildReplayFacts.orderChanges; the weather-beat progress and pack window (replayDirector.ts:27,61,64) are byte-identical copies of simulateRace.ts:191,195; pitStopTraceProgress (replayMath.ts:270-288) is a magic-window binary search superseded by the sim's event.traceProgress.
- These fallbacks agree today only because facts win, and exist only to drift.

# Scope
- In:
  - Remove the fallback branches in replayDirector.ts and the replayMath duplicates (orderChangesFromTrace, weather/pack copies, pitStopTraceProgress) and rely on result.replayFacts as the sole source.
  - Keep only the thin facts-consuming path and add a test asserting a resolved race always carries directorBeats/orderChanges so the deletion is safe.
- Out:
  - Changing the sim's replayFacts contents.
  - Removing the visual beat choreography (replayBeatPhases) which is render-only.
  - Touching the pit/start canonical work in the other items.

# Acceptance criteria
- AC1: The client-side director/overtake/weather/pack/pit re-derivations are deleted.
- AC2: replayFacts is the sole source of race beats, guarded by a test that resolved races always carry them.
- AC3: Replay behavior is unchanged for existing races.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: The client-side director/overtake/weather/pack/pit re-derivations are deleted.
- request-AC5 -> This backlog slice. Proof: AC2: replayFacts is the sole source of race beats, guarded by a test that resolved races always carry them.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_054_canonical_race_track_geometry_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_090_canonical_race_track_geometry_generate_semantic_track_markers_instead_of_interpreting_them_on_the_map`
- Primary task(s): `task_091_orchestrate_canonical_race_track_geometry`

# AI Context
- Summary: Delete client-side replay beat re-derivation; replayFacts is the sole source
- Keywords: scaffolded-backlog, delete client-side replay beat re-derivation; replayfacts is the sole source, implementation-ready
- Use when: Implementing the scaffolded slice for Delete client-side replay beat re-derivation; replayFacts is the sole source.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
