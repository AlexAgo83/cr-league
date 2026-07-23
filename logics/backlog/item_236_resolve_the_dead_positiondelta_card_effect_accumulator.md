## item_236_resolve_the_dead_positiondelta_card_effect_accumulator - Resolve the dead positionDelta card-effect accumulator
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay correctness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 clarified priority rationale during corpus-wide grooming.

# Problem
- TeamState.positionDelta (simulateRace.ts:51) is incremented by 12 card branches (:855-902) but never read.
- Classification sorts by scores.score (:332,:442), so cards that advertise position gains currently have zero effect on finishing order — either a real gameplay bug or an abandoned field.

# Scope
- In:
  - Make an explicit decision and record it in the task: Option A feed positionDelta into the classification sort key so the writes change finishing order; Option B delete the field, its initializers, and the 12 += writes.
  - If Option A: re-run npm run balance:sim and confirm the standings/payout curve stays sane before committing.
  - If Option B: remove all dead references so nothing is written-but-unread.
- Out:
  - Rebalancing card values beyond making the chosen option coherent.
  - The broader score-vs-time classification unification (follow-up).

# Acceptance criteria
- AC1: positionDelta is either consumed by classification or fully removed; nothing remains written-but-unread.
- AC2: If it now affects order, a balance simulation confirms the curve is still sane.
- AC3: The chosen option and its rationale are recorded in the orchestration task.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: positionDelta is either consumed by classification or fully removed; nothing remains written-but-unread.
- request-AC8 -> This backlog slice. Proof: AC2: If it now affects order, a balance simulation confirms the curve is still sane.
- request-AC3 -> This backlog slice. Evidence needed: All localStorage access in apps/web goes through a safe wrapper; the app starts and operates without throwing when localStorage getItem/setItem throw (disabled or quota-exceeded), verified by a test that stubs a throwing storage.
- request-AC4 -> This backlog slice. Evidence needed: normalizeEmail rejects any control/whitespace character so no tab/newline can reach the mail header, and POST /profiles returns a neutral response that no longer reveals whether an email is already registered.
- request-AC5 -> This backlog slice. Evidence needed: Unauthenticated write routes are IP rate-limited, and the admin profile/league list endpoints filter and paginate at the database level (where/skip/take) rather than loading whole tables into memory.
- request-AC6 -> This backlog slice. Evidence needed: Removing a league's owner human team no longer permanently 403s resolve/next-grand-prix/restart (ownerTeamId is reassigned or falls back to another human claim), and validateReplayTrace has negative tests asserting its specific error strings.
- request-AC7 -> This backlog slice. Evidence needed: Cosmetic replay-trace generation lives in its own module out of the simulation core, the dead normalizeRaceTraits/clampNumber exports are gone, and App.tsx's mutually-exclusive dialogs use a single activeModal state.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_062_review_findings_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
- Primary task(s): `task_100_orchestrate_review_findings_remediation`

# AI Context
- Summary: Resolve the dead positionDelta card-effect accumulator
- Keywords: scaffolded-backlog, resolve the dead positiondelta card-effect accumulator, implementation-ready
- Use when: Implementing the scaffolded slice for Resolve the dead positionDelta card-effect accumulator.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Advertised position-gain card effects are currently dishonest if the accumulator is written but never read.

# Tasks
- `task_100_orchestrate_review_findings_remediation`

# Notes
- Task `task_100_orchestrate_review_findings_remediation` was finished via `logics-manager flow finish task` on 2026-07-23.
