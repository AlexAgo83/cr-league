## item_037_design_visual_replay_v0_contract_and_layout - Design visual replay V0 contract and layout
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Replay UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current key-moments list explains events but does not make the race feel observed.
- A replay visual can become expensive quickly if the first pass tries to simulate real movement instead of rendering existing result evidence.

# Scope
- In:
  - Define the V0 replay metaphor: simple top-down track, lane strip, or lap ribbon.
  - Map existing result data to visual elements: player marker, rival/field marker, winner, lap markers, major events, and player-related events.
  - Decide which text remains in the visual panel and which remains in the existing recap/timeline.
  - Specify responsive behavior for desktop and mobile.
- Out:
  - New simulation mechanics.
  - Animated physics or precise race positions.
  - Full art direction or generated assets.
  - New backend persistence shape unless existing data is insufficient.

# Acceptance criteria
- AC1: The replay V0 contract can be implemented from `RaceResult` classification and events.
- AC2: The chosen layout names what is displayed for player, winner, key event, and lap progression.
- AC3: The layout keeps readable labels on desktop and mobile.
- AC4: The plan explicitly avoids new rendering dependencies.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The replay V0 contract can be implemented from `RaceResult` classification and events.
- request-AC2 -> This backlog slice. Proof: AC2: The chosen layout names what is displayed for player, winner, key event, and lap progression.
- request-AC3 -> This backlog slice. Proof: AC3: The layout keeps readable labels on desktop and mobile.
- request-AC4 -> This backlog slice. Proof: AC4: The plan explicitly avoids new rendering dependencies.
- request-AC5 -> This backlog slice. Proof: AC4: The plan explicitly avoids new rendering dependencies.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_002_visual_replay_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_031_add_first_visual_race_replay_from_event_timeline`
- Primary task(s): `task_032_orchestrate_visual_replay_v0`

# AI Context
- Summary: Design visual replay V0 contract and layout
- Keywords: scaffolded-backlog, design visual replay v0 contract and layout, implementation-ready
- Use when: Implementing the scaffolded slice for Design visual replay V0 contract and layout.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
