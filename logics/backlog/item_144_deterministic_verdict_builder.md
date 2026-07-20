## item_144_deterministic_verdict_builder - Deterministic verdict builder
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
