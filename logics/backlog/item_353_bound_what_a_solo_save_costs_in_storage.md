## item_353_bound_what_a_solo_save_costs_in_storage - Bound what a solo save costs in storage
> From version: 0.8.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Solo persistence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A 4 Grand Prix save is 557 KB, of which 344 KB is replay traces of Grand Prix already resolved.
- Each resolved Grand Prix adds about 86 KB, so a save grows without bound and three slots would reach the storage quota.
- `safeStorage.set` swallows quota failures, so hitting the limit loses progress silently rather than reporting it.

# Scope
- In:
  - Keep the replay trace only for the most recent resolved Grand Prix and drop it from older history entries when persisting.
  - Verify a trace-less history entry still renders its replay in a degraded but working form, since `replayTrace` is already optional.
  - Add a test asserting a long solo game stays under a stated size budget.
  - Decide and record what happens when a save still cannot be written.
- Out:
  - Do not compress or re-encode the state.
  - Do not move solo persistence to IndexedDB in this slice.
  - Do not change the simulation output or the RaceResult shape.

# Acceptance criteria
- AC1: A solo save's size stops growing once the trace budget is reached, asserted by a test over several simulated seasons.
- AC2: A history entry without a trace still opens a replay without throwing.
- AC3: Three full slots fit well inside a 5 MB budget, shown by the same test.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: A solo save's size stops growing once the trace budget is reached, asserted by a test over several simulated seasons.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_085_solo_save_slots_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_133_offer_three_solo_save_slots_with_readable_state`
- Primary task(s): `task_134_orchestrate_solo_save_slots`

# AI Context
- Summary: Bound what a solo save costs in storage
- Keywords: scaffolded-backlog, bound what a solo save costs in storage, implementation-ready
- Use when: Implementing the scaffolded slice for Bound what a solo save costs in storage.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
