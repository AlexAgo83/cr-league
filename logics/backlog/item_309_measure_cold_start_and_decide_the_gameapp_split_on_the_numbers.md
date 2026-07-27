## item_309_measure_cold_start_and_decide_the_gameapp_split_on_the_numbers - Measure cold start and decide the GameApp split on the numbers
> From version: 0.5.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- App() shows the 28-line HomeSplash but statically imports GameApp, so the landing screen pays for the entire game graph.
- Splitting it would help first paint but adds a wait at the enter click unless the load is prefetched.
- The project already generates a cold-start funnel report, so guessing at the impact would waste evidence that is one command away.

# Scope
- In:
  - Run npm run playtest:ux:cold-start and record the first-paint numbers as evidence.
  - If the measurement shows first paint materially hurt, wrap GameApp in React.lazy and prefetch it on HomeSplash mount so the enter click stays instant.
  - If the measurement does not justify the change, decline it in writing and cite the measured numbers.
  - Re-run the cold-start report after any change and record the before and after.
- Out:
  - Implementing the split without first taking the measurement.
  - Adding a loading screen, spinner redesign, or new splash visual.
  - Prefetching anything beyond the GameApp entry chunk.

# Acceptance criteria
- AC1: A cold-start measurement is recorded before any decision is made.
- AC2: The outcome is either an implemented split with before and after numbers, or a written decline citing the numbers.
- AC3: If implemented, entering from the splash shows no added perceptible delay.
- AC4: If implemented, typecheck, lint, tests, and build all pass.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: A cold-start measurement is recorded before any decision is made.
- request-AC6 -> This backlog slice. Proof: AC2: The outcome is either an implemented split with before and after numbers, or a written decline citing the numbers.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-27 decision: declined the GameApp split. The existing cold-start funnel now reports durations and passed on mobile 390x900: enter app 292 ms, create league 515 ms, reach first decision 292 ms, run first race 979 ms, make first purchase 304 ms, total measured step time 2382 ms. That does not justify adding a GameApp entry chunk plus prefetch path.

# Links
- Product brief(s): `prod_076_review_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_124_trim_the_eager_web_bundle_and_document_script_and_skip_boundaries`
- Primary task(s): `task_125_orchestrate_the_review_follow_up`

# AI Context
- Summary: Measure cold start and decide the GameApp split on the numbers
- Keywords: scaffolded-backlog, measure cold start and decide the gameapp split on the numbers, implementation-ready
- Use when: Implementing the scaffolded slice for Measure cold start and decide the GameApp split on the numbers.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_125_orchestrate_the_review_follow_up` was finished via `logics-manager flow finish task` on 2026-07-27.
