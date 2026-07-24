## req_108_clean_up_race_recap_narrative - Clean up race recap narrative
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Race report clarity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the race recap concise, factual, and non-redundant.
- Stop technical finish markers from being presented as the cause of a position change.

# Context
- The recap repeated the finishing position and points in both the result and plan-analysis blocks.
- Podium copy judged a plan successful even when the directive analysis identified a poor weather preparation.
- A `finish` event carrying the final position delta could be selected as the dominant cause, producing claims such as "finishes the race changed your result".

# Acceptance criteria
- AC1: The recap separates factual result, directive analysis, winner comparison, and next-race advice without repeating the result.
- AC2: Result copy does not infer that a plan was good solely from a podium or points finish.
- AC3: Technical `finish` and `race_note` events cannot become the dominant race cause.
- AC4: French and English copy and focused tests stay aligned.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `apps/web/src/features/ReportView.tsx`
- `apps/web/src/app/helpers.ts`
- `apps/web/src/app/helpers.test.ts`
- `apps/web/src/i18n/fr.json`
- `apps/web/src/i18n/en.json`

# AI Context
- Summary: Draft a bounded request for clean up race recap narrative.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- `item_266_clean_up_race_recap_narrative`
