## spec_002_card_set_v1 - Card Set V1
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 90
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`
> Related spec: `spec_001_grand_prix_core_loop_and_simulation_v1`

# Purpose
Define the first card set for CR League V1.

Cards should create tactical drama and race stories, not a large deckbuilder. Each card must be understandable before the race and explainable after the race.

# V1 Rules
- 15 cards currently implemented in the prototype.
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

# Current Prototype Card List
## 1. Rain Grip
- Family: Weather.
- Trigger: light or heavy rain appears in Early Race or Mid Race.
- Upside: improves weather readiness and may create a position gain.
- Downside: if the race stays dry, small pace loss.
- Best user position: any, strongest for calculated risk-takers.
- Replay event: rain tire icon when weather changes.
- Report line: "Your rain setup paid off when showers arrived mid-race."
- Balance concern: avoid making rain prediction too binary.

## 2. Fleet Maintenance
- Family: Reliability.
- Trigger: first minor reliability failure.
- Upside: cancels the failure and converts it into a small time loss.
- Downside: no benefit if no reliability event occurs.
- Best user position: leader or aggressive player.
- Replay event: pit crew or wrench callout.
- Report line: "Fleet Maintenance prevented a minor failure from becoming race-ending damage."
- Balance concern: should not cancel major failure in V1 unless rare and expensive.

## 3. Launch Boost
- Family: Attack.
- Trigger: Start segment, especially with Aggressive approach.
- Upside: chance to gain one or two positions early.
- Downside: raises reliability or control pressure later.
- Best user position: midfield or trailing.
- Replay event: launch burst from grid.
- Report line: "Launch Boost gave you early track position, but added late-race pressure."
- Balance concern: should be exciting but not always optimal.

## 4. Urban Draft
- Family: Rival.
- Trigger: player is near selected rival in Early or Mid Race.
- Upside: improves chance to overtake or pressure rival.
- Downside: no benefit if rival is not nearby.
- Best user position: midfield.
- Replay event: close-follow overtake cue.
- Report line: "You used your rival's slipstream to force a decisive move."
- Balance concern: depends on rival proximity; needs graceful miss explanation.

## 5. Final Surge
- Family: Comeback.
- Trigger: Finish segment while outside podium.
- Upside: chance of final position gain.
- Downside: raises failure or mistake risk.
- Best user position: midfield or trailing.
- Replay event: final-lap attack.
- Report line: "Late Push nearly stole a result in the final segment."
- Balance concern: should not guarantee podiums from the back.

## 6. Fleet Sponsorship
- Family: Economy.
- Trigger: race finish.
- Upside: extra credits.
- Downside: small performance penalty during race.
- Best user position: players planning future card purchases.
- Replay event: optional sponsor board, not required.
- Report line: "You sacrificed some pace for a stronger credit payout."
- Balance concern: must not be the obvious choice for players already winning.

## 7. Soft Tires
- Family: Attack.
- Trigger: start and early attack windows.
- Upside: better launch and attack pace.
- Downside: weaker late endurance.
- Best user position: midfield or trailing.
- Replay event: early pace cue.
- Report line: "Soft tires gave you bite early before the stint faded."
- Balance concern: must not erase the value of Launch Boost.

## 8. Qualifying Lap
- Family: Attack.
- Trigger: qualifying attempt.
- Upside: improves the next qualifying run.
- Downside: little direct race value and locks the chrono card choice once used.
- Best user position: any.
- Replay event: qualifying replay time improvement.
- Report line: "Qualifying focus helped set the grid."
- Balance concern: should affect grid without deciding the whole GP.

## 9. Defensive Order
- Family: Reliability.
- Trigger: defending under pressure.
- Upside: protects position and reduces mistakes.
- Downside: limits attacking moves.
- Best user position: leader or podium defender.
- Replay event: defense cue under pressure.
- Report line: "The defensive order kept the car composed under pressure."
- Balance concern: may feel invisible unless replay/report call it out.

## 10. Adjustable Wing
- Family: Attack.
- Trigger: fast or urban circuit sections.
- Upside: more attack pace.
- Downside: stability cost.
- Best user position: midfield or aggressive player.
- Replay event: attack cue on suitable roads.
- Report line: "The adjustable wing opened up passing chances."
- Balance concern: must not dominate all fast circuits.

## 11. Rain Mapping
- Family: Weather.
- Trigger: wet conditions.
- Upside: strong rain response.
- Downside: wasted or slightly costly if dry.
- Best user position: calculated risk-takers.
- Replay event: wet-weather pace cue.
- Report line: "Rain mapping paid off once the road got wet."
- Balance concern: overlaps Rain Grip; should be stronger conditionally and worse when wrong.

## 12. Economy Mode
- Family: Economy.
- Trigger: finish with a solid result.
- Upside: extra credits.
- Downside: slower launch/pace.
- Best user position: players planning future purchases.
- Replay event: optional economy cue.
- Report line: "Economy mode turned restraint into extra credits."
- Balance concern: should be a tradeoff, not a free money button.

## 13. Pit Relay
- Family: Reliability.
- Trigger: late race pressure.
- Upside: steadies the car late.
- Downside: no big raw pace gain.
- Best user position: defenders or consistent scorers.
- Replay event: pit-wall cue.
- Report line: "The pit relay steadied the car late."
- Balance concern: must remain less explosive than attack cards.

## 14. Hard Tires
- Family: Reliability.
- Trigger: late stint.
- Upside: stronger closing phase.
- Downside: weaker start.
- Best user position: prudent or long-run plans.
- Replay event: late endurance cue.
- Report line: "Hard tires came alive late."
- Balance concern: must not make early GP irrelevant.

## 15. Calculated Attack
- Family: Rival.
- Trigger: another car is close enough.
- Upside: attacks only when pressure is realistic.
- Downside: no benefit if isolated.
- Best user position: close midfield fights.
- Replay event: close attack cue.
- Report line: "Calculated attack struck when the gap was small enough."
- Balance concern: proximity threshold must avoid fake-feeling attacks.

# Non-goals
- No card rarity in the first prototype.
- No crafting.
- No player-to-player trading.
- No deck construction.
- No permanent passive card builds.
- No card combos that require long rule text.

# Open Questions
- Should Weather Radar exist later, or do qualifying attempts cover enough pre-race insight?
- Should cards stay fixed-price in a simple shop, or move to random/draft offers after playtest?
- Should each player start with the same starter cards?
- Should failed conditional race cards be fully consumed?
- Should only qualifying cards lock card choice after chrono, as the current prototype does?
