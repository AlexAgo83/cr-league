## item_266_clean_up_race_recap_narrative - Clean up race recap narrative
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Race report clarity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Race recap sections overlap, make unsupported success claims, and may mistake the final classification marker for a causal event.

# Scope
- In:
  - Remove the redundant non-winning commentary from the plan-comparison block.
  - Make the result sentence factual and keep directive analysis in its own block.
  - Compare player and winner plans without repeating position or points.
  - Exclude technical finish and race-note events from dominant-cause selection.
  - Keep French and English copy aligned and add focused regression coverage.
- Out:
  - Race simulation, scoring, replay animation, and report layout changes.

# Acceptance criteria
- AC1: Each recap block has one role and does not repeat the finishing result.
- AC2: Result copy is factual; directive and winner comparison copy carry the analysis.
- AC3: A finish marker with a non-zero position delta falls back to a genuine race cause.
- AC4: Focused helper tests, typecheck, lint, full tests, build, and Logics validation pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: ReportView renders one source per recap section.
- request-AC2 -> This backlog slice. Proof: Verdict stance is limited to position and points.
- request-AC3 -> This backlog slice. Proof: Dominant-cause filtering and regression test exclude technical markers.
- request-AC4 -> This backlog slice. Proof: English and French keys are updated together and validated.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_108_clean_up_race_recap_narrative.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Clean up race recap narrative
- Keywords: backlog-groom, request, clean up race recap narrative, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Clean up race recap narrative.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: The issue is visible after every Grand Prix and weakens trust in the report.

# Notes
- Hybrid rationale: Derived from request `req_108_clean_up_race_recap_narrative` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_108_clean_up_race_recap_narrative.md`.
- Generated locally by logics-manager.
- Task `task_109_clean_up_race_recap_narrative` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_109_clean_up_race_recap_narrative`
