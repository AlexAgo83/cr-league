## item_224_add_launch_and_first_corner_replay_phase - Add launch and first-corner replay phase
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 20%
> Complexity: Medium
> Theme: Replay realism
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Race starts can look too linear because the field immediately follows normal progress interpolation.
- The first few percent of a race should feel compact and variable, but a full launch model would be unnecessary scope.
- Start behavior must not change winners or final classification unless a later gameplay request explicitly does so.

# Scope
- In:
  - Add a deterministic `launch` or `race_start` trace phase for the first small normalized race window.
  - Apply bounded launch variation from existing deterministic inputs such as seed, grid position, relevant traits, and circuit start/first-sector metadata.
  - Keep the pack compact early, then smoothly transition to normal trace spacing before the first sustained sector.
  - Expose enough phase metadata for replay/director inspection.
  - Add focused tests for deterministic launch variation, monotonic progress, and unchanged final classification.
- Out:
  - Clutch, reaction-time, tire-temperature, collision, or false-start models.
  - Changing race outcome scoring.
  - Adding new UI controls or copy.

# Acceptance criteria
- AC1: Canonical traces include a bounded launch/first-corner phase for newly generated races.
- AC2: The early field is visibly compact and separates smoothly into normal race progress.
- AC3: Tests prove deterministic output and unchanged final result ordering.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Canonical traces include a bounded launch/first-corner phase for newly generated races.
- request-AC2 -> This backlog slice. Proof: AC2: The early field is visibly compact and separates smoothly into normal race progress.
- request-AC8 -> This backlog slice. Proof: AC3: Tests prove deterministic output and unchanged final result ordering.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_060_race_replay_realism_layers_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_097_race_replay_realism_layers_after_canonical_trace`
- Primary task(s): `task_098_orchestrate_race_replay_realism_layers_after_canonical_trace`

# AI Context
- Summary: Add launch and first-corner replay phase
- Keywords: scaffolded-backlog, add launch and first-corner replay phase, implementation-ready
- Use when: Implementing the scaffolded slice for Add launch and first-corner replay phase.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
