## item_024_wire_web_copy_to_i18n_catalog - Wire web copy to i18n catalog
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: i18n
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The i18n contract should be backed by actual source-locale web copy, not an empty catalog.

# Scope
- In:
  - source-locale catalog keys for current static web copy.
  - minimal typed translation helper.
  - App wiring to catalog keys.
  - validation.
- Out:
  - runtime locale selection.
  - extra locales.
  - backend error localization.
  - simulation-generated race report localization.

# Acceptance criteria
- AC1: Current static web UI copy lives in `en.json`.
- AC2: `App.tsx` consumes that catalog through a typed helper.
- AC3: Validation passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: catalog keys are in scope.
- request-AC2 -> This backlog slice. Proof: typed helper is in scope.
- request-AC3 -> This backlog slice. Proof: App wiring is in scope.
- request-AC4 -> This backlog slice. Proof: existing web flow test remains in scope.
- request-AC5 -> This backlog slice. Proof: i18n validation is in scope.
- request-AC6 -> This backlog slice. Proof: full validation is in scope.
- request-AC7 -> This backlog slice. Proof: runtime locale switching and extra locales are out of scope.

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
- Request: `req_018_wire_web_copy_to_i18n_catalog`
- Primary task(s): `task_019_wire_web_copy_to_i18n_catalog`

# AI Context
- Summary: Wire web copy to i18n catalog
- Keywords: backlog-groom, request, wire web copy to i18n catalog, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Wire web copy to i18n catalog.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: The i18n contract should not remain empty after initialization.

# Notes
- Hybrid rationale: Derived from request `req_018_wire_web_copy_to_i18n_catalog` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_018_wire_web_copy_to_i18n_catalog.md`.
- Generated locally by logics-manager.
- Task `task_019_wire_web_copy_to_i18n_catalog` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_019_wire_web_copy_to_i18n_catalog`
