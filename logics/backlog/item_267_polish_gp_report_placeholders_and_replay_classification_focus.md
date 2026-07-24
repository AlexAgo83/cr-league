## item_267_polish_gp_report_placeholders_and_replay_classification_focus - Polish GP report placeholders and replay classification focus
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Replay interaction clarity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The GP placeholder regressed and replay classification does not participate in the existing driver-focus interaction.

# Scope
- In:
  - Remove the pre-GP Rewards placeholder.
  - Add accessible focus controls to classification badges when focus mode is active.
  - Connect badges to moving cars with a pointer-events-free SVG overlay.
  - Verify focus switching and visual layering.
- Out:
  - Race simulation, ordering, timing, and camera behavior changes.

# Acceptance criteria
- AC1: No Rewards heading appears in the pending GP report.
- AC2: Classification badge activation calls the same focused-team state used by car clicks.
- AC3: Connector endpoints follow both badge and moving-car DOM positions without intercepting input.
- AC4: Focused badge state is exposed with `aria-pressed`.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: PlanView placeholder and App assertion are removed.
- request-AC2 -> This backlog slice. Proof: ReplayTower forwards the selected team to ReplayView focus state.
- request-AC3 -> This backlog slice. Proof: ReplayDriverConnectors updates SVG endpoints each animation frame.
- request-AC4 -> This backlog slice. Proof: Focus button test and browser checks cover interaction and rendering.

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
- Request: `logics/request/req_109_polish_gp_report_placeholders_and_replay_classification_focus.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Polish GP report placeholders and replay classification focus
- Keywords: backlog-groom, request, polish gp report placeholders and replay classification focus, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Polish GP report placeholders and replay classification focus.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_109_polish_gp_report_placeholders_and_replay_classification_focus` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_109_polish_gp_report_placeholders_and_replay_classification_focus.md`.
- Generated locally by logics-manager.
- Task `task_110_polish_gp_report_placeholders_and_replay_classification_focus` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_110_polish_gp_report_placeholders_and_replay_classification_focus`
