## item_256_calibrate_balance_and_preserve_gameplay_value_across_the_new_engine - Calibrate balance and preserve gameplay value across the new engine
> From version: 0.4.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Balance validation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A chrono engine can make the race more credible but can also break game balance: one parameter can dominate, cards can become too strong or invisible, and weather/pit strategy can become noisy.
- The migration must be judged on distributions over many seeds, not on one expected result.

# Scope
- In:
  - Extend or add balance simulation reporting for the chrono engine: average race duration, gap spread, podium volatility, favorite win rate, upset rate, card impact, weather-prep impact, pit strategy value, and circuit archetype differences.
  - Set explicit acceptance thresholds or review bands in the task report before closeout.
  - Compare a bounded fixed-seed corpus against the old score-first baseline where useful, while allowing intentional outcome changes.
  - Tune motion parameters only enough to keep the game arcade, readable, and fair.
- Out:
  - Perfect parity with the old engine.
  - Long-term economy redesign.
  - Adding analytics infrastructure.

# Acceptance criteria
- AC1: Balance sim output includes the required chrono metrics over a representative fixed-seed corpus.
- AC2: No existing card/preparation/pit strategy is statistically invisible or overwhelmingly dominant within the documented review bands.
- AC3: The task closeout records the balance evidence and any known follow-up tuning risks.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Balance sim output includes the required chrono metrics over a representative fixed-seed corpus.
- request-AC5 -> This backlog slice. Proof: AC2: No existing card/preparation/pit strategy is statistically invisible or overwhelmingly dominant within the documented review bands.
- request-AC7 -> This backlog slice. Proof: AC3: The task closeout records the balance evidence and any known follow-up tuning risks.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_065_track_driven_chrono_race_engine_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_102_track_driven_chrono_race_engine_derive_grand_prix_timing_gaps_classification_and_replay_from_speed_over_the_race_track`
- Primary task(s): `task_103_orchestrate_track_driven_chrono_race_engine_migration`

# AI Context
- Summary: Calibrate balance and preserve gameplay value across the new engine
- Keywords: scaffolded-backlog, calibrate balance and preserve gameplay value across the new engine, implementation-ready
- Use when: Implementing the scaffolded slice for Calibrate balance and preserve gameplay value across the new engine.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
