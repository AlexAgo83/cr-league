## item_359_race_the_destiny_wheel_draw_and_show_the_order - Race the Destiny Wheel draw and show the order
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100
> Complexity: Medium
> Theme: Solo modes
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The draw has to produce an order, and the race the game already simulates is what produces it.
- The replay was built for a championship race and carries plan, cards and payoff surfaces that mean nothing in a draw.
- Running the same participants twice must not always give the same order, or it is not a draw.

# Scope
- In:
  - Build the race directly from the shared simulation with a circuit, neutral decisions and no cards.
  - Vary the seed per launch so a second draw with the same participants gives a different order.
  - Play it through the existing replay, passing none of its plan, decision or payoff inputs so those surfaces are absent.
  - Show the finishing order as the result, with a way to draw again and a way back to the catalogue.
  - Cover the draw with tests: two participants minimum, a different order across launches, and no league state created.
- Out:
  - Do not modify the race simulation or the replay component.
  - No points, credits, cards, qualifying or standings.
  - No sharing or exporting of a result.

# Acceptance criteria
- AC1: A launch produces a finishing order over all entered participants.
- AC2: Two launches with the same participants can give different orders.
- AC3: The replay shows the map without plan, cards, qualifying or payoff surfaces.
- AC4: The result screen offers drawing again with the same participants.
- AC5: No LeagueState is created and no campaign save is written.
- AC6: Lint, typecheck, build, unit tests and the e2e suite pass.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: A launch produces a finishing order over all entered participants.
- request-AC5 -> This backlog slice. Proof: AC2: Two launches with the same participants can give different orders.
- request-AC6 -> This backlog slice. Proof: AC3: The replay shows the map without plan, cards, qualifying or payoff surfaces.
- request-AC9 -> This backlog slice. Proof: AC4: The result screen offers drawing again with the same participants.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_086_solo_arcade_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
- Primary task(s): `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel`

# AI Context
- Summary: Race the Destiny Wheel draw and show the order
- Keywords: scaffolded-backlog, race the destiny wheel draw and show the order, implementation-ready
- Use when: Implementing the scaffolded slice for Race the Destiny Wheel draw and show the order.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
