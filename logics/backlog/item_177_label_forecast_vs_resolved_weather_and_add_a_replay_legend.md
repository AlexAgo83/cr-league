## item_177_label_forecast_vs_resolved_weather_and_add_a_replay_legend - Label forecast vs resolved weather and add a replay legend
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Race legibility
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The pre-race pill and replay timeline both show only a weather name, so probability and actuality look identical (audit cause D).
- The orange pace marker and the cloud-to-phase mapping have no legend, so the timeline is unreadable at first contact.
- A naive probability display would misrepresent the model, since only the mid segment uses the forecast.

# Scope
- In:
  - Reframe the DriveView forecast pill as a non-final forecast with a qualitative tendency and EN/FR copy.
  - Label the ReplayProgress timeline as actual resolved weather per phase.
  - Add a compact legend for the pace marker and the phase mapping, legible without color alone.
  - Keep all framing consistent with the simulation's per-segment weather behavior.
- Out:
  - Any change to the weather model or simulation behavior.
  - Precise per-phase probability figures.
  - Redesign of weather icons or colors.
  - Card weather-condition labeling (handled in the card legibility request).

# Acceptance criteria
- AC1: Pre-race weather reads as a forecast (not final) with a qualitative tendency and no per-phase percentages.
- AC2: Replay weather reads as actual resolved weather per phase, distinct from the forecast.
- AC3: A legend explains the pace marker and the five-phase cloud mapping, not color-only, with EN/FR copy.
- AC4: No framing contradicts the model; no simulation change.
- AC5: Typecheck, test, build, lint, and logics:validate pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Pre-race weather reads as a forecast (not final) with a qualitative tendency and no per-phase percentages.
- request-AC2 -> This backlog slice. Proof: AC2: Replay weather reads as actual resolved weather per phase, distinct from the forecast.
- request-AC3 -> This backlog slice. Proof: AC3: A legend explains the pace marker and the five-phase cloud mapping, not color-only, with EN/FR copy.
- request-AC4 -> This backlog slice. Proof: AC4: No framing contradicts the model; no simulation change.
- request-AC5 -> This backlog slice. Proof: AC5: Typecheck, test, build, lint, and logics:validate pass.
- request-AC6 -> This backlog slice. Proof: AC5: Typecheck, test, build, lint, and logics:validate pass.
- request-AC7 -> This backlog slice. Proof: AC5: Typecheck, test, build, lint, and logics:validate pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_043_weather_legibility_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_079_clarify_weather_semantics_forecast_vs_resolved_and_pace_marker_legend`
- Primary task(s): `task_080_orchestrate_weather_forecast_legibility`

# AI Context
- Summary: Label forecast vs resolved weather and add a replay legend
- Keywords: scaffolded-backlog, label forecast vs resolved weather and add a replay legend, implementation-ready
- Use when: Implementing the scaffolded slice for Label forecast vs resolved weather and add a replay legend.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
