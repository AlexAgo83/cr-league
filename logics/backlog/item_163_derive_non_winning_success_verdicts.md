## item_163_derive_non_winning_success_verdicts - Derive non-winning success verdicts
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Result interpretation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The app can explain a win, but non-winning plans often read as plain losses even when they protected position, handled bad weather, or saved future value.
- The logic must stay honest and deterministic.

# Scope
- In:
  - Add a pure derived helper for non-winning success verdicts from existing decision/result/context inputs.
  - Support at least position-preservation, weather/card-value, and economy/future-option patterns.
  - Add negative tests proving poor non-winning results are not mislabeled as success.
- Out:
  - Changing result storage, rewards, or standings.
  - Adding explicit objectives.
  - Using randomness or subjective scoring.

# Acceptance criteria
- AC2: Three deterministic non-winning success patterns are supported.
- AC3: Poor results do not receive success verdicts.
- AC4: No simulation/reward/standings changes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: `deriveNonWinningFeedback` emits success verdicts for concrete non-winning outcomes.
- request-AC2 -> This backlog slice. Proof: helper branches cover held/improved position, rain/weather-card mitigation, and points/credits without card spend.
- request-AC3 -> This backlog slice. Proof: helper returns a miss verdict for poor zero-point losses.
- request-AC4 -> This backlog slice. Proof: helper is derived in the web app and does not mutate result storage, rewards, standings, or simulation data.
- request-AC6 -> This backlog slice. Proof: `helpers.test.ts` covers all three success branches and the negative miss branch.
- request-AC7 -> This backlog slice. Proof: covered by the task closeout validation suite.

# Notes
- Implemented in `apps/web/src/app/helpers.ts` via `deriveNonWinningFeedback`.
- Task `task_069_orchestrate_non_winning_success_feedback` owns closeout validation.
- Task `task_069_orchestrate_non_winning_success_feedback` was finished via `logics-manager flow finish task` on 2026-07-21.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_032_non_winning_success_feedback_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_068_non_winning_success_feedback`
- Primary task(s): `task_069_orchestrate_non_winning_success_feedback`

# AI Context
- Summary: Derive non-winning success verdicts
- Keywords: scaffolded-backlog, derive non-winning success verdicts, implementation-ready
- Use when: Implementing the scaffolded slice for Derive non-winning success verdicts.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
