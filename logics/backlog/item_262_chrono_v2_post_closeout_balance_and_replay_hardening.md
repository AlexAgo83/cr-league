## item_262_chrono_v2_post_closeout_balance_and_replay_hardening - Chrono v2 post-closeout balance and replay hardening
> From version: 0.4.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Run a larger bounded chrono v2 balance pass after the sampled replay trace migration.
Fix only clear, measured outliers before live: high-upside aggressive/mini_pack combinations should not dominate from poor grid spots, conservative/economy/defense options should remain viable tradeoffs, and circuit gap spreads should stay reviewable.
Keep replay integrity checks green while making the smallest tuning changes needed.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: Balance simulation reporting captures the pre/post evidence for card, pit strategy, upset, duration, and gap spread behavior.
- AC2: Clear outliers from the larger bounded run are adjusted with small chrono tuning changes only; no UI/API/storage/release/circuit catalogue changes.
- AC3: Replay integrity remains valid after tuning: monotonic trace, bounded speed changes, pit/overtake/defense coherence, and final classification alignment.
- AC4: Validation includes targeted simulation tests, full typecheck/test/lint/build/e2e, bounded balance rerun, and Logics validation.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Balance simulation reporting captures the pre/post evidence for card, pit strategy, upset, duration, and gap spread behavior.
- request-AC2 -> This backlog slice. Proof: AC2: Clear outliers from the larger bounded run are adjusted with small chrono tuning changes only; no UI/API/storage/release/circuit catalogue changes.
- request-AC3 -> This backlog slice. Proof: AC3: Replay integrity remains valid after tuning: monotonic trace, bounded speed changes, pit/overtake/defense coherence, and final classification alignment.
- request-AC4 -> This backlog slice. Proof: AC4: Validation includes targeted simulation tests, full typecheck/test/lint/build/e2e, bounded balance rerun, and Logics validation.

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
- Request: `logics/request/req_104_chrono_v2_post_closeout_balance_and_replay_hardening.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Chrono v2 post-closeout balance and replay hardening
- Keywords: backlog-groom, request, chrono v2 post-closeout balance and replay hardening, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Chrono v2 post-closeout balance and replay hardening.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_104_chrono_v2_post_closeout_balance_and_replay_hardening` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_104_chrono_v2_post_closeout_balance_and_replay_hardening.md`.
- Generated locally by logics-manager.
- Task `task_105_chrono_v2_post_closeout_balance_and_replay_hardening` was finished via `logics-manager flow finish task` on 2026-07-23.

# Tasks
- `task_105_chrono_v2_post_closeout_balance_and_replay_hardening`
