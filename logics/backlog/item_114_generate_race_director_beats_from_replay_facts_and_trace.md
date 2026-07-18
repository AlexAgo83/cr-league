## item_114_generate_race_director_beats_from_replay_facts_and_trace - Generate race-director beats from replay facts and trace
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Replay storytelling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Several replay stretches are visually stable but narratively flat: the map moves, but the player does not know what to care about.
- Action becomes fun when a visible event explains it, as seen when `Launch Boost +1 pos` appeared during playtest.
- The replay needs truthful beats for both action and quiet periods without inventing fake race outcomes.

# Scope
- In:
  - Add a deterministic race-director beat builder that consumes `RaceResult`, replay trace, replay facts, player team id, and weather/event data.
  - Support beat categories such as start, overtake, attack, defense, gap opens, gap closes, pack compact, leader escaping, weather phase, card effect, final lap pressure, and finish.
  - Prefer existing `RaceResult.events`, `replayFacts.orderChanges`, trace order, trace gaps, weather markers, and classification data before adding any new data.
  - Expose a readable debug helper or test snapshot for generated beats.
  - Keep copy concise and localizable through `en.json` and `fr.json`.
  - Use fallback rhythm beats when no major action exists in a window, but only when backed by trace/order/gap/weather state.
- Out:
  - Building a large scripting DSL.
  - Persisting director beats in the database unless a later implementation proves it necessary.
  - Adding long commentary paragraphs.
  - Changing report copy or race event semantics.

# Acceptance criteria
- AC1: Given the same result and trace, the beat builder returns identical ordered beats.
- AC2: Order-change facts produce overtake/position-change beats.
- AC3: Quiet trace windows produce truthful rhythm beats such as compact pack, leader gap, weather phase, or final-lap pressure when applicable.
- AC4: Generated beats include enough team ids/progress/lap context for UI highlighting.
- AC5: Tests cover action beats, quiet fallback beats, and no contradictory fake events.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Given the same result and trace, the beat builder returns identical ordered beats.
- request-AC5 -> This backlog slice. Proof: AC2: Order-change facts produce overtake/position-change beats.
- request-AC6 -> This backlog slice. Proof: AC3: Quiet trace windows produce truthful rhythm beats such as compact pack, leader gap, weather phase, or final-lap pressure when applicable.
- request-AC8 -> This backlog slice. Proof: AC4: Generated beats include enough team ids/progress/lap context for UI highlighting.
- request-AC9 -> This backlog slice. Proof: AC5: Tests cover action beats, quiet fallback beats, and no contradictory fake events.
- request-AC10 -> This backlog slice. Proof: AC5: Tests cover action beats, quiet fallback beats, and no contradictory fake events.
- request-AC7 -> This backlog slice. Evidence needed: The overlay layout does not obscure replay controls, tower, timeline, car cluster, or mobile map framing at desktop and 390px mobile widths.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_019_replay_spectacle_fun_pass_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_048_make_race_replay_feel_like_a_fun_race_spectacle`
- Primary task(s): `task_049_orchestrate_replay_spectacle_fun_pass`

# AI Context
- Summary: Generate race-director beats from replay facts and trace
- Keywords: scaffolded-backlog, generate race-director beats from replay facts and trace, implementation-ready
- Use when: Implementing the scaffolded slice for Generate race-director beats from replay facts and trace.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_049_orchestrate_replay_spectacle_fun_pass`

# Notes
- Task `task_049_orchestrate_replay_spectacle_fun_pass` was finished via `logics-manager flow finish task` on 2026-07-18.
