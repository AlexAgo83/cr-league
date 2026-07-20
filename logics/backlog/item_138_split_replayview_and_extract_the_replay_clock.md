## item_138_split_replayview_and_extract_the_replay_clock - Split ReplayView and extract the replay clock
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 32%
> Complexity: Low
> Theme: Web architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- ReplayView.tsx is 1071 lines holding several sub-components, a requestAnimationFrame loop, ~10 state hooks, 6 refs, and manual pop-timer arrays in one file.

# Scope
- In:
  - Extract a useReplayClock hook owning the rAF loop, play/pause/seek state, and pop-timer lifecycle.
  - Move the scrubber, timing tower, and stage sub-components into their own files under a replay/ folder.
  - Preserve the pass-4 scrubber interaction fixes (drag-wins, pointer-events, aria-valuetext) unchanged.
  - Keep the existing ReplayView tests passing as the behavioral contract; relocate them alongside the split files.
- Out:
  - Any change to replay visuals, timing math, or the trace format.
  - New replay features.

# Acceptance criteria
- AC1: ReplayView.tsx is a composition file and the rAF/timer logic lives in useReplayClock.
- AC2: Existing replay tests pass unchanged apart from import paths.
- AC3: No file in the replay folder exceeds ~400 lines.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: ReplayView.tsx is a composition file and the rAF/timer logic lives in useReplayClock.
- request-AC9 -> This backlog slice. Proof: AC2: Existing replay tests pass unchanged apart from import paths.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`
- Primary task(s): `task_059_orchestrate_repo_review_remediation_pass_5`

# AI Context
- Summary: Split ReplayView and extract the replay clock
- Keywords: scaffolded-backlog, split replayview and extract the replay clock, implementation-ready
- Use when: Implementing the scaffolded slice for Split ReplayView and extract the replay clock.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
