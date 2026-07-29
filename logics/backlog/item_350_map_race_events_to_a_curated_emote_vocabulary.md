## item_350_map_race_events_to_a_curated_emote_vocabulary - Map race events to a curated emote vocabulary
> From version: 0.8.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Race replay expressiveness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- RaceEventType declares 26 types, and mapping all of them would make the map unreadable.
- A measured race emitted 27 events across 5 cars, with three consecutive events for a single pit stop.
- Without a cooldown, one car can react several times within a second and none of the reactions register.

# Scope
- In:
  - Add a pure mapping from RaceEvent to an emote identifier or nothing, in packages/shared next to the other race domain helpers.
  - Cover the visceral events: mechanical scare and save, best sector and personal record, overtake and being overtaken, pressure, minor error, successful defense, critical battery, penalty risk.
  - Return nothing for pit sequence events, weather changes, race notes, sponsor payouts and the finish, which are narration or already shown elsewhere.
  - Add a per-car cooldown with major severity taking precedence inside the same window.
  - Cover the mapping and the cooldown with unit tests, including the measured pit sequence as a regression case.
- Out:
  - No rendering work in this item.
  - No change to RaceEventType or to the simulation.
  - No player-authored emote selection.

# Acceptance criteria
- AC1: Every RaceEventType resolves deterministically to an emote identifier or to nothing, asserted by a parametrized test over the declared union so a new event type cannot be silently unmapped.
- AC2: The consecutive pit_imminent, pit_stop and pit_exit sequence produces at most one emote.
- AC3: Two events inside the cooldown window yield one emote, and a major severity event wins over a minor one.
- AC4: The mapping is pure and tested without a browser or a DOM.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Every RaceEventType resolves deterministically to an emote identifier or to nothing, asserted by a parametrized test over the declared union so a new event type cannot be silently unmapped.
- request-AC2 -> This backlog slice. Proof: AC2: The consecutive pit_imminent, pit_stop and pit_exit sequence produces at most one emote.
- request-AC3 -> This backlog slice. Proof: AC3: Two events inside the cooldown window yield one emote, and a major severity event wins over a minor one.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_084_race_replay_driver_emotes_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_132_pop_driver_reaction_emotes_above_cars_during_the_replay`
- Primary task(s): `task_133_orchestrate_race_replay_driver_emotes`

# AI Context
- Summary: Map race events to a curated emote vocabulary
- Keywords: scaffolded-backlog, map race events to a curated emote vocabulary, implementation-ready
- Use when: Implementing the scaffolded slice for Map race events to a curated emote vocabulary.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
