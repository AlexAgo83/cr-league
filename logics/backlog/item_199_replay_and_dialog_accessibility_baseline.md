## item_199_replay_and_dialog_accessibility_baseline - Replay and dialog accessibility baseline
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Accessibility
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- useReplayClock auto-plays via requestAnimationFrame (useReplayClock.ts:128) and CircuitMap ambient cars use SVG animateMotion (CircuitMap.tsx:484); neither consults prefers-reduced-motion and the CSS reduce-block only disables decorative accents.
- Modal.tsx:77 selects focusable elements without filtering hidden/zero-size ones and focuses the dialog container rather than the first control.
- The replay speed menu (ReplayStageOverlay.tsx:312-327) uses role=listbox/option with no keyboard navigation.

# Scope
- In:
  - Read matchMedia('(prefers-reduced-motion: reduce)') once and default the replay clock to paused and the ambient animation to static when reduce is set (ADR-006).
  - Filter the modal focusable query by visibility and focus the first visible interactive control.
  - Give the speed menu arrow-key roving focus per the listbox pattern, or drop the listbox/option roles for a plain button menu.
- Out:
  - Restyling the replay or modals.
  - A broader a11y audit of every screen.
  - Changing the replay timing model.

# Acceptance criteria
- AC1: With reduce-motion set, the replay does not auto-animate and ambient motion is static.
- AC2: The modal focus trap skips hidden elements and focuses the first visible control.
- AC3: The speed menu is keyboard-navigable or no longer advertises listbox semantics it does not implement.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: With reduce-motion set, the replay does not auto-animate and ambient motion is static.
- request-AC6 -> This backlog slice. Proof: AC2: The modal focus trap skips hidden elements and focuses the first visible control.
- request-AC4 -> This backlog slice. Evidence needed: RaceDecision.teamId is indexed, rivalTeamId is a FK/relation with onDelete handling and an index, the enum-like columns are DB-constrained, and the profileId index migration runs without write-locking teams.
- request-AC5 -> This backlog slice. Evidence needed: The API fails fast on missing WEB_ORIGIN/DATABASE_URL outside development, and render.yaml declares ADMIN_TOKEN and ADMIN_EMAILS.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_052_post_remediation_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_088_post_remediation_hardening_submit_sell_concurrency_client_security_and_privacy_accessibility_data_model_integrity_and_config_validation`
- Primary task(s): `task_089_orchestrate_post_remediation_hardening`

# AI Context
- Summary: Replay and dialog accessibility baseline
- Keywords: scaffolded-backlog, replay and dialog accessibility baseline, implementation-ready
- Use when: Implementing the scaffolded slice for Replay and dialog accessibility baseline.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_089_orchestrate_post_remediation_hardening`

# Notes
- Task `task_089_orchestrate_post_remediation_hardening` was finished via `logics-manager flow finish task` on 2026-07-22.
