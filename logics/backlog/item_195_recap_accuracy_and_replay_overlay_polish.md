## item_195_recap_accuracy_and_replay_overlay_polish - Recap accuracy and replay-overlay polish
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: UI correctness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- recapDirective (helpers.ts:342) hardcodes light_rain, so a heavy_rain GP is mislabeled as light rain.
- buildRaceVerdict (helpers.ts:185) checks positionChange<0 -> loss before position<=3 -> podium, so a podium that lost grid positions never reads as podium.
- CircuitMap ambient cars (CircuitMap.tsx:483) traverse the path backward on the return leg, oscillating whenever startProgress>0.
- ReplayStageOverlay (ReplayStageOverlay.tsx:214) uses a hardcoded English 'Focus driver' aria-label while siblings use tt().

# Scope
- In:
  - Label the recap weather from the resolved rain intensity (heavy_rain/light_rain/dry) instead of the hasRain boolean.
  - Decide whether a podium that lost grid positions reads as podium or loss; reorder the branches accordingly or leave with a ponytail comment recording the intent.
  - Make the ambient animateMotion forward-only (startProgress->1 then 0->startProgress, or start at 0) so cars never reverse.
  - Add a tt() key for the focus-driver aria-label in the en/fr catalogs.
- Out:
  - Rewording the recap copy beyond the weather token.
  - Redesigning the verdict categories.
  - Broader replay-overlay restyling.

# Acceptance criteria
- AC1: A heavy_rain GP recap reports heavy rain, not light rain.
- AC2: The podium-vs-loss verdict ordering is intentional and documented in code.
- AC3: Onboarding ambient cars only ever move forward.
- AC4: The focus-driver aria-label is translated in both locales.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: A heavy_rain GP recap reports heavy rain, not light rain.
- request-AC5 -> This backlog slice. Proof: AC2: The podium-vs-loss verdict ordering is intentional and documented in code.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_051_simulation_fidelity_and_replay_performance_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness`
- Primary task(s): `task_088_orchestrate_simulation_fidelity_and_replay_performance_fixes`

# AI Context
- Summary: Recap accuracy and replay-overlay polish
- Keywords: scaffolded-backlog, recap accuracy and replay-overlay polish, implementation-ready
- Use when: Implementing the scaffolded slice for Recap accuracy and replay-overlay polish.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
