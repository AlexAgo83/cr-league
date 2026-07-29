## req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw - Split Solo into Campaign and Arcade, with a Destiny Wheel draw
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Complexity: Medium
> Theme: Solo modes
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Split Solo into two sub-modes so the existing season play has a name of its own and is not the only thing Solo can be.
- Open an Arcade catalogue that lists short self-contained games, with room for more than the first one.
- Offer a first Arcade game that draws an order between named participants by racing them.
- Keep the draw local, quick to set up, and free of the campaign's cards, points and progression.

# Context
- Solo currently goes straight from the entry screen to a campaign save slot, so there is no surface on which to offer anything else.
- The race simulation is a pure function and the replay only needs a result, a circuit and liveries, so a game outside the league costs no engine work.
- The draw is the race: participants are entered by name, the finishing order is the answer. There is no spinning wheel before it.
- Participants are entered as names only; colours and cars are assigned automatically so setting up a draw stays quick.
- The result is not kept: the participants persist so a draw can be replayed, the finishing order does not.

# Acceptance criteria
- AC1: Solo offers Campaign and Arcade; Campaign reaches the existing save slots unchanged.
- AC2: Arcade opens a catalogue of mini games listing only games that exist, built so another can be added without reshaping the screen.
- AC3: The Destiny Wheel asks for participants by name, and the list persists locally when it is validated.
- AC4: Launching runs a generated Grand Prix through the existing race simulation, without cards, plan, qualifying, points or credits.
- AC5: The race plays on the existing circuit map and its replay, with the plan and stats surfaces absent rather than disabled.
- AC6: The finishing order is shown as the result of the draw, and the draw can be run again with the same participants.
- AC7: Arcade never reads or writes a campaign save slot.
- AC8: The three new board icons and the arcade hero exist as committed assets in the app's formats, and the icon existence test covers them.
- AC9: Lint, typecheck, build, unit tests and the e2e suite pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_086_solo_arcade_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/app/SetupViews.tsx
- apps/web/src/app/SetupGate.tsx
- apps/web/src/app/setupContext.ts
- apps/web/src/app/soloStorage.ts
- apps/web/src/app/circuits.ts
- apps/web/src/features/ReplayView.tsx
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/domain/circuits.ts
- packages/shared/src/domain/race.ts
- Current diagnostic: `simulateRace` is a pure function taking participants, a circuit and a seed, and returning a RaceResult. It needs no LeagueState, no API and no league engine.
- Current diagnostic: `ReplayView` requires only `result`, `circuit` and `teamLiveries`. Every plan, decision, tower-report and payoff prop is optional, so passing none of them already yields a replay without plan or stats. No change to ReplayView is needed.
- Current diagnostic: `circuitIdentityForRound`, `raceInputFromCircuit`, `trackZonesForCircuit` and `trackSpeedProfileForCircuit` are all exported from the shared package and are what `resolveGrandPrix` itself uses to build a race.
- Current diagnostic: `RaceParticipant` needs teamId, teamName, kind, standingsRank and a decision; a neutral decision with no card is a valid input, so a draw needs no card economy.
- Current diagnostic: the domain already caps a grid at 16 (`MAX_PLAYERS_LIMIT` in apps/api/src/features/leagues/constants.ts), which is the natural ceiling for a draw rather than a new invented limit.
- Current diagnostic: solo persistence is three campaign slots under `cr-league-solo-slot-v1-*` with a light index. Arcade holds no league state, so it must not consume a slot.
- Current diagnostic: `SetupEntryMode` is `choice | multiplayer | solo` and SetupGate branches on it before the profile branch; a new sub-mode fits that existing shape.
- Current diagnostic: 122 board icons already exist under apps/web/public/assets/crl/icons; none reads as arcade, campaign or wheel, so three are genuinely missing. The result screens can reuse `standings-board` and `podium-result`, and an empty participant list can reuse `empty-card-slot`.
- Current diagnostic: each choice screen has its own hero backdrop, referenced from layout.css (`.setup-entry-hero-panel` uses league-arrival.webp) behind a left-dark gradient, so a new hero must keep its left half quiet for the composited title.
- docs/board-icon-assets-runbook.md
- logics/design/arcade-destiny-wheel-icons/prompt.md
- logics/design/arcade-destiny-wheel-hero/prompt.md

# AI Context
- Summary: Split Solo into Campaign and Arcade, with a Destiny Wheel draw
- Keywords: request-chain-scaffold, split solo into campaign and arcade, with a destiny wheel draw, development-ready
- Use when: You need to implement or review the scaffolded workflow for Split Solo into Campaign and Arcade, with a Destiny Wheel draw.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_356_produce_the_arcade_board_icons_and_hero`
- `item_357_split_solo_into_campaign_and_arcade`
- `item_358_enter_and_keep_the_destiny_wheel_participants`
- `item_359_race_the_destiny_wheel_draw_and_show_the_order`
