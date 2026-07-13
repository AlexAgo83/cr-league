## spec_002_card_set_v1 - Card Set V1
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 80%
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`
> Related spec: `spec_001_grand_prix_core_loop_and_simulation_v1`

# Purpose
Define the first card set for CR League V1.

Cards should create tactical drama and race stories, not a large deckbuilder. Each card must be understandable before the race and explainable after the race.

# V1 Rules
- 12 cards total for the first full V1 design.
- A smaller vertical slice may implement 6 cards first.
- Mostly consumable cards.
- Maximum 1 card played per Grand Prix.
- Cards are owned by a team inventory.
- Cards are bought with credits or earned as post-race rewards.
- Every played card must generate either a replay event, a report mention, or both.

# Card Design Template
Each card should define:

- id;
- name;
- family;
- trigger;
- upside;
- downside or limit;
- best user position: leader, midfield, trailing, or any;
- replay event;
- report line;
- balance concern.

# Families
- Weather: rewards reading forecasts and preparing for uncertainty.
- Reliability: protects against risk and makes aggressive strategies safer.
- Attack and rival: creates direct social stakes.
- Comeback and economy: gives trailing or planning-focused players options without free wins.

# V1 Card List
## 1. Rain Tires
- Family: Weather.
- Trigger: light or heavy rain appears in Early Race or Mid Race.
- Upside: improves weather readiness and may create a position gain.
- Downside: if the race stays dry, small pace loss.
- Best user position: any, strongest for calculated risk-takers.
- Replay event: rain tire icon when weather changes.
- Report line: "Your rain setup paid off when showers arrived mid-race."
- Balance concern: avoid making rain prediction too binary.

## 2. Hybrid Setup
- Family: Weather.
- Trigger: weather changes at least once.
- Upside: reduces penalty from changing conditions.
- Downside: lower peak pace in stable conditions.
- Best user position: midfield.
- Replay event: stable pace during weather transition.
- Report line: "The hybrid setup kept your car consistent as conditions changed."
- Balance concern: must be safer but less explosive than Rain Tires.

## 3. Mechanic Express
- Family: Reliability.
- Trigger: first minor reliability failure.
- Upside: cancels the failure and converts it into a small time loss.
- Downside: no benefit if no reliability event occurs.
- Best user position: leader or aggressive player.
- Replay event: pit crew or wrench callout.
- Report line: "Mechanic Express prevented a minor failure from becoming race-ending damage."
- Balance concern: should not cancel major failure in V1 unless rare and expensive.

## 4. Reinforced Engine
- Family: Reliability.
- Trigger: Late Race reliability check.
- Upside: reduces late mechanical risk.
- Downside: small pace penalty on fast circuits.
- Best user position: leader or points defender.
- Replay event: engine shield icon during late race.
- Report line: "The reinforced engine helped you survive late pressure."
- Balance concern: may become auto-pick for leaders if too efficient.

## 5. Rocket Start
- Family: Attack.
- Trigger: Start segment, especially with Aggressive approach.
- Upside: chance to gain one or two positions early.
- Downside: raises reliability or control pressure later.
- Best user position: midfield or trailing.
- Replay event: launch burst from grid.
- Report line: "Rocket Start gave you early track position, but added late-race pressure."
- Balance concern: should be exciting but not always optimal.

## 6. Slipstream Trap
- Family: Rival.
- Trigger: player is near selected rival in Early or Mid Race.
- Upside: improves chance to overtake or pressure rival.
- Downside: no benefit if rival is not nearby.
- Best user position: midfield.
- Replay event: close-follow overtake cue.
- Report line: "You used your rival's slipstream to force a decisive move."
- Balance concern: depends on rival proximity; needs graceful miss explanation.

## 7. Calm Radio
- Family: Reliability.
- Trigger: defending a position or under rival pressure.
- Upside: reduces driver error and control loss.
- Downside: does not create pace.
- Best user position: leader or podium defender.
- Replay event: radio icon during defense.
- Report line: "Calm Radio helped your driver hold position under pressure."
- Balance concern: may feel invisible unless report/replay call it out.

## 8. Late Push
- Family: Comeback.
- Trigger: Finish segment while outside podium.
- Upside: chance of final position gain.
- Downside: raises failure or mistake risk.
- Best user position: midfield or trailing.
- Replay event: final-lap attack.
- Report line: "Late Push nearly stole a result in the final segment."
- Balance concern: should not guarantee podiums from the back.

## 9. Sponsor Bonus
- Family: Economy.
- Trigger: race finish.
- Upside: extra credits.
- Downside: small performance penalty during race.
- Best user position: players planning future card purchases.
- Replay event: optional sponsor board, not required.
- Report line: "You sacrificed some pace for a stronger credit payout."
- Balance concern: must not be the obvious choice for players already winning.

## 10. Underdog Funding
- Family: Comeback and economy.
- Trigger: player starts race in lower half of championship standings.
- Upside: bonus credits if the player finishes or beats rival objective.
- Downside: no direct performance bonus.
- Best user position: trailing.
- Replay event: none required.
- Report line: "Underdog Funding turned a difficult weekend into useful resources."
- Balance concern: language must avoid humiliating trailing players.

## 11. Weather Radar
- Family: Weather.
- Trigger: briefing phase before card lock.
- Upside: improves forecast confidence or reveals one segment of weather timeline.
- Downside: consumes a card without direct race performance.
- Best user position: optimizers.
- Replay event: none required.
- Report line: "Weather Radar gave your team better information before committing the plan."
- Balance concern: may require pre-race UI support; can wait if costly.

## 12. Pressure Call
- Family: Rival.
- Trigger: selected rival chooses Aggressive or is under low-control conditions.
- Upside: raises rival mistake chance in one segment.
- Downside: no benefit if rival stays controlled.
- Best user position: social multiplayer.
- Replay event: rival pressure marker.
- Report line: "Pressure Call forced your rival into a tense mistake window."
- Balance concern: sabotage must feel light, not mean or unfair.

# Vertical Slice First Six
For the first implementation slice, use:

- Rain Tires;
- Mechanic Express;
- Rocket Start;
- Slipstream Trap;
- Late Push;
- Sponsor Bonus.

This set covers weather, reliability, attack, rival, comeback, and economy with minimal UI.

# Non-goals
- No card rarity in the first prototype.
- No crafting.
- No player-to-player trading.
- No deck construction.
- No permanent passive card builds.
- No card combos that require long rule text.

# Open Questions
- Should Weather Radar exist in V1 or wait until practice/advanced briefing exists?
- Should cards be bought from a fixed shop or random draw?
- Should each player start with the same starter cards?
- Should failed conditional cards be fully consumed?
