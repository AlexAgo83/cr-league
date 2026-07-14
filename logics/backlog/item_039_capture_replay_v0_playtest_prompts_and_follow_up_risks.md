## item_039_capture_replay_v0_playtest_prompts_and_follow_up_risks - Capture replay V0 playtest prompts and follow-up risks
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Playtest readiness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The team needs to know whether the simple visual replay actually improves comprehension before investing in richer replay work.
- Without playtest prompts, feedback may collapse into generic visual polish comments.

# Scope
- In:
  - Update the 3-GP playtest checklist with replay-specific observations.
  - Document what the V0 replay intentionally does not prove.
  - Add follow-up backlog notes for animation, richer event variety, or full replay only if testers ask for it.
- Out:
  - Running the playtest itself.
  - Analytics instrumentation.
  - Replay balance changes.

# Acceptance criteria
- AC1: Playtest docs ask whether the replay made the race easier to understand.
- AC2: Playtest docs ask whether visual event callouts match the written recap.
- AC3: Known limits document that replay V0 is not a full race simulation.
- AC4: Roadmap/docs identify the next decision point after V0.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Playtest docs ask whether the replay made the race easier to understand.
- request-AC4 -> This backlog slice. Proof: AC2: Playtest docs ask whether visual event callouts match the written recap.
- request-AC6 -> This backlog slice. Proof: AC3: Known limits document that replay V0 is not a full race simulation.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_002_visual_replay_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_031_add_first_visual_race_replay_from_event_timeline`
- Primary task(s): `task_032_orchestrate_visual_replay_v0`

# AI Context
- Summary: Capture replay V0 playtest prompts and follow-up risks
- Keywords: scaffolded-backlog, capture replay v0 playtest prompts and follow-up risks, implementation-ready
- Use when: Implementing the scaffolded slice for Capture replay V0 playtest prompts and follow-up risks.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
