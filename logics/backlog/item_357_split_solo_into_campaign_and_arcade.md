## item_357_split_solo_into_campaign_and_arcade - Split Solo into Campaign and Arcade
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100
> Complexity: Low
> Theme: Solo modes
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Solo leads straight to campaign save slots, so a second kind of solo play has nowhere to live.
- The Arcade needs a catalogue that stays readable when it holds one game and when it holds several.

# Scope
- In:
  - Add an Arcade sub-mode beside Campaign on the Solo step, reusing the existing choice-step treatment.
  - Keep Campaign's path to the save slots exactly as it is, including the skip when no slot holds a game.
  - Add a catalogue screen listing the games that exist.
  - Cover the navigation with tests: Campaign still reaches the slots, Arcade reaches the catalogue.
- Out:
  - No locked or coming-soon entries in the catalogue.
  - No change to the multiplayer entry path.
  - No arcade game implementation in this item.

# Acceptance criteria
- AC1: Solo shows Campaign and Arcade, and Campaign behaves exactly as Solo did before.
- AC2: Arcade opens a catalogue listing the games that exist and nothing else.
- AC3: Back from either sub-mode returns to the Solo step, and back from Solo to the entry choice.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Solo shows Campaign and Arcade, and Campaign behaves exactly as Solo did before.
- request-AC2 -> This backlog slice. Proof: AC2: Arcade opens a catalogue listing the games that exist and nothing else.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_086_solo_arcade_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
- Primary task(s): `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel`

# AI Context
- Summary: Split Solo into Campaign and Arcade
- Keywords: scaffolded-backlog, split solo into campaign and arcade, implementation-ready
- Use when: Implementing the scaffolded slice for Split Solo into Campaign and Arcade.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
