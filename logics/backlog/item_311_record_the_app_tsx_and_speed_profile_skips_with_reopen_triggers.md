## item_311_record_the_app_tsx_and_speed_profile_skips_with_reopen_triggers - Record the App.tsx and speed-profile skips with reopen triggers
> From version: 0.5.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Decision record
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The review deliberately declined two plausible-looking changes, and unwritten intent decays into a future agent redoing or reversing them.
- App.tsx is 779 lines but already decomposed into 12 hooks and 3 action factories, so further splitting buys indirection and risks 1307 lines of tests.
- The speed-profile JSON conversion would trade the generator's satisfies check for a d.ts nobody reads, and typecheck is currently fast.

# Scope
- In:
  - Record both skips where an implementing agent will encounter them, using a ponytail comment at the relevant code site, a docs note, or both.
  - For App.tsx, name the reopen trigger: a change to App.tsx breaks something it did not touch.
  - For the speed profiles, name the reopen trigger: a cold tsc -b becomes slow enough to hurt, and note that the generator is a small change away from emitting JSON.
  - Keep each note short enough that it stays true as the code moves.
- Out:
  - Performing either declined change.
  - Writing a long architecture decision record for either skip.
  - Adding a lint rule, size budget, or automated guard for App.tsx.

# Acceptance criteria
- AC1: Both skips are recorded where an implementing agent will see them.
- AC2: Each skip names a specific observable condition that would reopen it.
- AC3: No behavioral code change is introduced by this item.
- AC4: Typecheck and lint still pass.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Both skips are recorded where an implementing agent will see them.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_076_review_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_124_trim_the_eager_web_bundle_and_document_script_and_skip_boundaries`
- Primary task(s): `task_125_orchestrate_the_review_follow_up`

# AI Context
- Summary: Record the App.tsx and speed-profile skips with reopen triggers
- Keywords: scaffolded-backlog, record the app.tsx and speed-profile skips with reopen triggers, implementation-ready
- Use when: Implementing the scaffolded slice for Record the App.tsx and speed-profile skips with reopen triggers.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
