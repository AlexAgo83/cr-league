## item_150_first_contact_frictions_one_click_chrono_enter_submits_intros_persist - First-contact frictions: one-click chrono, Enter submits, intros persist
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90
> Confidence: 85
> Progress: 10%
> Complexity: Low
> Theme: First-session UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The first game action takes two identical NEW LAP TIME clicks; Enter does nothing in the setup forms; the three quick-start intros reopen every reload until a checkbox is found and ticked.

# Scope
- In:
  - Run the chrono directly from the desk CTA when attempts remain, keeping the attempts-left count visible; keep a confirmation only for the last attempt.
  - Make profile create, profile recover, and league create/join submit on Enter via proper form semantics.
  - Persist intro dismissal per league on first close through the existing UI-preferences storage; keep the checkbox semantics as never-show-again and the help reopen affordance.
  - Update the App and e2e tests that pin the confirm-modal flow.
- Out:
  - The single-recommended-CTA highlight rule (req_059 item_141).
  - Rewriting intro content.

# Acceptance criteria
- AC1: First chrono is one click with attempts-left visible; last attempt still confirms.
- AC2: Enter submits each filled setup form.
- AC3: A dismissed intro stays dismissed for that league across reloads.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: First chrono is one click with attempts-left visible; last attempt still confirms.
- request-AC3 -> This backlog slice. Proof: AC2: Enter submits each filled setup form.
- request-AC4 -> This backlog slice. Proof: AC3: A dismissed intro stays dismissed for that league across reloads.
- request-AC8 -> This backlog slice. Proof: AC3: A dismissed intro stays dismissed for that league across reloads.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_026_replay_suspense_and_first_contact_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`
- Primary task(s): `task_063_orchestrate_replay_suspense_and_first_contact_polish`

# AI Context
- Summary: First-contact frictions: one-click chrono, Enter submits, intros persist
- Keywords: scaffolded-backlog, first-contact frictions: one-click chrono, enter submits, intros persist, implementation-ready
- Use when: Implementing the scaffolded slice for First-contact frictions: one-click chrono, Enter submits, intros persist.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
