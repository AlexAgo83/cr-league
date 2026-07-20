## item_144_deterministic_verdict_builder - Deterministic verdict builder
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 85
> Complexity: Low
> Theme: Race learning and feedback
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- No single function answers 'did my plan work and why'; the causes are scattered across four recap builders and the raw event list.
- Any verdict copy written separately from the recap builders would eventually contradict them.

# Scope
- In:
  - Add a buildRaceVerdict pure function in helpers.ts taking the same inputs as raceRecapCards and returning an outcome tier, a dominant-cause i18n key with interpolation values, and a try-next key.
  - Derive the outcome tier from position, positionChange, and points; rank the dominant cause by reusing or extracting the ranking already inside recapDifference (own major event, card hit/miss, weather bet, approach effect).
  - Defer the try-next line to the recapNextLesson look-ahead so both surfaces agree.
  - Use pickRecapKey/resultVariant for deterministic variant selection.
  - Unit tests in helpers.test.ts for the four scenario families and variant determinism.
- Out:
  - Changing recapDifference/recapDirective outputs.
  - New simulation fields or resultTags.

# Acceptance criteria
- AC1: buildRaceVerdict is pure, deterministic for a given seed, and returns keys plus values only.
- AC2: The four scenario families are unit-tested.
- AC3: Cause ranking is shared with the recap builders, not duplicated.
- AC4: Two consecutive wins with the same plan do not produce word-for-word identical verdicts: the seed-based variant selection (resultVariant) must be exercised so repeated outcomes rotate phrasing. (Added 2026-07-20: the playtest saw the same winning recap sentence verbatim on two consecutive GPs.)

# Implementation Notes
- 2026-07-20 wave 1: added `buildRaceVerdict()` in `helpers.ts`, returning outcome, stance, dominant cause, and try-next as i18n keys plus params.
- Extracted the dominant-cause selection behind `recapDifference()` so the verdict and recap use the same event/card/weather/headline priority; verdict additionally allows an approach cause when no higher-priority cause exists.
- Reused the next-lesson derivation by splitting `recapNextLessonLine()` from `recapNextLesson()`, so verdict try-next copy cannot drift from the recap card.
- Added EN/FR `recap_verdict_*` variant families and unit coverage for card podium, weather loss, clean hold, approach gain, and seed-based wording rotation.

# Validation
- 2026-07-20 targeted: `rtk npm run typecheck`; `rtk npm run lint`; `rtk npm test -- apps/web/src/app/helpers.test.ts apps/web/src/i18n/index.test.ts`.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: buildRaceVerdict is pure, deterministic for a given seed, and returns keys plus values only.
- request-AC3 -> This backlog slice. Proof: AC2: The four scenario families are unit-tested.
- request-AC4 -> This backlog slice. Proof: AC3: Cause ranking is shared with the recap builders, not duplicated.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_024_result_verdict_pass_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_060_result_verdict_pass_why_it_worked_why_it_failed_what_to_try_next`
- Primary task(s): `task_061_orchestrate_result_verdict_pass`

# AI Context
- Summary: Deterministic verdict builder
- Keywords: scaffolded-backlog, deterministic verdict builder, implementation-ready
- Use when: Implementing the scaffolded slice for Deterministic verdict builder.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
