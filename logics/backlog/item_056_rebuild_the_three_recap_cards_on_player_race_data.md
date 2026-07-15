## item_056_rebuild_the_three_recap_cards_on_player_race_data - Rebuild the three recap cards on player race data
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Recap content
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The 'difference' card shows the field's first major event with data-free copy; the 'directive' card echoes the player's picks without judging them; the 'lesson' card cycles five canned sentences about the current GP under a next-GP title, and counts rival cards as the player's via relatedTeamId.

# Scope
- In:
  - Difference card: select the player's own event with the largest absolute positionDelta; fallbacks in order — player card trigger, field weather shift phrased with its segment and new weather, result headline.
  - Directive verdict: judge preparation against resolvedWeather across segments, the played card against its triggered events and deltas, and approach against final positionChange; render verdict plus evidence via parameterized templates.
  - Next-GP lesson: compute the next round's circuit via the shared rotation, name it and its dominant trait or likely weather, and tie the advice to the main cause of this race's result; fix the relatedTeamId card-attribution bug.
  - Template pools: at least three parameterized variants per outcome family per card, deterministically rotated (e.g. by round) so consecutive GPs differ; all copy in EN and FR with identical key sets.
  - Unit tests for the three helpers over fixture RaceResults (win with card, weather-bet loss, quiet race, rival-card race).
  - Remove the now-dead lesson_* and other replaced keys from both catalogs.
- Out:
  - Layout or visual changes to ReportView beyond the card text.
  - Replay, key moments, phases, and rewards sections.
  - LLM narrative generation.
  - Server-side changes (covered by the GP identity item).

# Acceptance criteria
- AC1: With a fixture where the player gains positions from a card in the rain, the three cards name the card, the phase, the delta, and next circuit's identity — in both locales.
- AC2: With a quiet race fixture, the cards degrade gracefully (headline fallback, 'held position' verdict, next-GP advice still specific).
- AC3: A rival's card event no longer triggers the player's card lesson.
- AC4: Three consecutive resolved GPs show non-identical recap copy for the same card family.
- AC5: EN and FR key sets are identical and no user-facing string is hardcoded; helper unit tests pass.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: With a fixture where the player gains positions from a card in the rain, the three cards name the card, the phase, the delta, and next circuit's identity — in both locales.
- request-AC5 -> This backlog slice. Proof: AC2: With a quiet race fixture, the cards degrade gracefully (headline fallback, 'held position' verdict, next-GP advice still specific).
- request-AC6 -> This backlog slice. Proof: AC3: A rival's card event no longer triggers the player's card lesson.
- request-AC7 -> This backlog slice. Proof: AC4: Three consecutive resolved GPs show non-identical recap copy for the same card family.
- request-AC8 -> This backlog slice. Proof: AC5: EN and FR key sets are identical and no user-facing string is hardcoded; helper unit tests pass.
- request-AC9 -> This backlog slice. Proof: AC5: EN and FR key sets are identical and no user-facing string is hardcoded; helper unit tests pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_005_personalized_race_recap_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_034_personalized_race_recap`
- Primary task(s): `task_035_orchestrate_personalized_race_recap`

# AI Context
- Summary: Rebuild the three recap cards on player race data
- Keywords: scaffolded-backlog, rebuild the three recap cards on player race data, implementation-ready
- Use when: Implementing the scaffolded slice for Rebuild the three recap cards on player race data.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
