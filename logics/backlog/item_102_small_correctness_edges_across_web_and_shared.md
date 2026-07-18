## item_102_small_correctness_edges_across_web_and_shared - Small correctness edges across web and shared
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Correctness polish
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- pickWeighted can return a zero-weight entry when the PRNG yields exactly 0, and the existing test's fixed seeds never hit that path.
- Other players' livery colors reach CSS custom properties unvalidated on the client.
- The garage submits untrimmed team names; the modal closes on clicks that merely end on the overlay; focus restore can drop to body when the trigger unmounted; league-config numeric fields collapse to 0 when cleared while typing.

# Scope
- In:
  - Guard pickWeighted so entries with effective weight zero are never returned; add a test that forces cursor 0 (mock or seed search).
  - Add a small hex-color validator in the web (mirroring the API's isHexColor) applied where livery values become CSS variables, falling back to the default livery.
  - Trim the team name in GarageView before enable-check and submit.
  - Close the modal only when the pointer press started on the overlay (record mousedown target).
  - Guard focus restore with document.contains and fall back to no-op when the trigger is gone.
  - Hold the raw string for league-config numeric inputs in local state (or clamp on blur) so intermediate empty states are allowed; clampNumber at submit stays.
  - Extend existing test files for the changed helpers and Modal behavior.
- Out:
  - Server-side livery re-validation (already normalized on write).
  - New validation libraries.

# Acceptance criteria
- AC1: pickWeighted provably never returns a zero-weight entry.
- AC2: Non-hex livery values render as the default livery colors.
- AC3: Team names persist trimmed; text selection ending on the overlay no longer closes the modal; focus restore never throws or focuses a detached node; clearing a numeric field while typing is possible and submit still clamps.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: pickWeighted provably never returns a zero-weight entry.
- request-AC8 -> This backlog slice. Proof: AC2: Non-hex livery values render as the default livery colors.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_016_repo_review_remediation_pass_4_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_045_repo_review_remediation_pass_4_ownership_resilience_race_window_closure_and_replay_polish`
- Primary task(s): `task_046_orchestrate_repo_review_remediation_pass_4`

# AI Context
- Summary: Small correctness edges across web and shared
- Keywords: scaffolded-backlog, small correctness edges across web and shared, implementation-ready
- Use when: Implementing the scaffolded slice for Small correctness edges across web and shared.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
