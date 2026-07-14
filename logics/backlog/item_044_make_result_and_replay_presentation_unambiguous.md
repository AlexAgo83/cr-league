## item_044_make_result_and_replay_presentation_unambiguous - Make result and replay presentation unambiguous
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 96
> Progress: 90%
> Complexity: Medium
> Theme: Result comprehension
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The first visual replay pass is technically derived from result data but can still be misunderstood as a live or positional race simulation.
- Players need separate cues for final classification, causal explanation, visual summary, and written report.
- The post-GP moment should feel like the payoff of the player's directive, not a set of disconnected cards.

# Scope
- In:
  - Redesign the post-GP result area into an explicit sequence: headline outcome, player consequence, final classification, replay summary, key moments, report.
  - Rename and label replay elements so users know whether they are looking at final positions, weather phases, events, or narrative report.
  - Keep the visual replay honest if it remains static; do not imply precise lap-by-lap car movement unless implemented.
  - Improve empty and low-event states so the result page still explains the race.
  - Route all result/replay labels through EN/FR catalogs.
- Out:
  - Full animated race replay.
  - New simulation event types.
  - Replay controls or scrubber.
  - Canvas or 3D implementation.

# Acceptance criteria
- AC1: A resolved GP result view clearly labels outcome, classification, animated replay, key moments, and report.
- AC2: The replay panel text and controls explain what the user is watching without relying on external instructions.
- AC3: The animated replay is deterministic and stays consistent with the resolved race result.
- AC4: Unit or e2e assertions cover the key result/replay labels and at least one replay control in one locale.

# Direction to carry into implementation
- Follow the V2 result mockup direction for the resolved state: payoff panel first, final classification as timing screen, race readout lanes in the middle, and causal explanation cards below.
- If time-based controls are implemented, label the surface as `Race replay`. If not, label it as `Race readout` or `Race summary`. The label must set the right expectation.
- Post-GP sequence:
  - Headline outcome: position, points, or podium/miss signal.
  - `Your race`: what the player's directive and card changed.
  - `Why`: the main causal factors from events, weather, track traits, or card effects.
  - `Classification`: final order as timing rows.
  - `Race replay`: animated cars on the city circuit when a deterministic playback timeline exists.
  - `Race readout`: fallback visual summary of phases/events when the timeline is not implemented yet.
  - `Key moments`: readable event list.
  - `Report`: generated narrative text.
- Replay data contract:
  - A playback has `durationMs`, `cars`, and `events`.
  - Each car has sampled points with `t`, route `progress`, `rank`, and optional visual offset.
  - Events have `t`, `type`, `teamId`, label, and optional sector/progress.
  - The final playback sample must match the resolved classification.
- Circuit data contract:
  - The 0.3 replay can assume the static circuit catalog contains city, country, layout, path geometry, sectors, laps, grip, overtaking, energy, and likely weather.
  - Do not require runtime routing to render the replay.
- Visual readout rules:
  - Prefer the city circuit route as the visual anchor: show the simplified European city layout, moving cars, sector/weather/event markers, and current replay time. Do not show full Leaflet controls in the result panel.
  - Use interpolation along stored route geometry for movement. Do not add physics, collision, or live pathfinding.
  - Show overtakes only when the playback timeline contains rank/progress changes that support them.
  - If playback data is missing, fall back to V2-style lanes, phase bands, and labeled team markers rather than faking movement.
  - Empty/low-event races still need a clear explanation instead of an empty-looking panel.
- French copy must avoid ambiguous English loanwords where a clear French label exists; verify the meaning with actual in-app context, not isolated translation keys.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A resolved GP result view clearly labels outcome, classification, replay summary, key moments, and report.
- request-AC4 -> This backlog slice. Proof: AC2: The replay panel text explains what the user is looking at without relying on external instructions.
- request-AC5 -> This backlog slice. Proof: AC3: The current static replay does not visually imply precision that the data does not support.
- request-AC7 -> This backlog slice. Proof: AC4: Unit or e2e assertions cover the key result/replay labels in at least one locale.
- request-AC8 -> This backlog slice. Proof: AC4: Unit or e2e assertions cover the key result/replay labels in at least one locale.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Primary task(s): `task_033_orchestrate_race_cockpit_redesign_v0`

# AI Context
- Summary: Make result and replay presentation unambiguous
- Keywords: scaffolded-backlog, make result and replay presentation unambiguous, implementation-ready
- Use when: Implementing the scaffolded slice for Make result and replay presentation unambiguous.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
