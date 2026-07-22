## item_234_extend_replay_inspection_to_chrono_traces - Extend replay inspection to chrono traces
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 65%
> Complexity: Low
> Theme: Developer validation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The existing replay inspection artifact focuses on generated races, so chrono parity cannot be checked without launching the app or reading raw traces.
- Representative trace output is the cheapest way to validate whether chrono motion now matches race-track expectations.
- The inspection should stay developer-facing and avoid a new test harness.

# Scope
- In:
  - Extend `scripts/inspect-replay-trace.ts` or the existing `npm run replay:inspect` path to include representative chrono traces.
  - Print Prague, Monaco, and Montreal chrono samples with trace count, progress, phase, speed, weather, and final time.
  - Reuse `createQualifyingRuns` rather than introducing a separate fixture generator.
  - Add or update the smallest focused test only if the script exposes reusable logic; otherwise validate with the command output in task closeout.
  - Document how to read the chrono section in the orchestration task report.
- Out:
  - A new CLI package or interactive viewer.
  - Golden snapshot files for full script output.
  - User-facing chrono diagnostics.

# Acceptance criteria
- AC1: `npm run replay:inspect` includes a chrono section for Prague, Monaco, and Montreal.
- AC2: The output includes enough phase/speed/weather context to compare race and chrono trace behavior.
- AC3: Closeout records the command output as validation proof.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: `npm run replay:inspect` includes a chrono section for Prague, Monaco, and Montreal.
- request-AC5 -> This backlog slice. Proof: AC2: The output includes enough phase/speed/weather context to compare race and chrono trace behavior.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_061_chrono_replay_race_track_parity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_098_chrono_replay_race_track_parity`
- Primary task(s): `task_099_orchestrate_chrono_replay_race_track_parity`

# AI Context
- Summary: Extend replay inspection to chrono traces
- Keywords: scaffolded-backlog, extend replay inspection to chrono traces, implementation-ready
- Use when: Implementing the scaffolded slice for Extend replay inspection to chrono traces.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
