## spec_011_simulation_algorithm_v0 - Simulation Algorithm V0
> From version: 1.0.0
> Schema version: 1.0
> Status: Settled
> Understanding: 85%
> Confidence: 70%
> Related request: `req_004_define_cr_league_implementation_contracts_v0`
> Related backlog: `item_010_define_cr_league_implementation_contracts_v0`
> Related task: `task_005_define_cr_league_implementation_contracts_v0`
> Related spec: `spec_001_grand_prix_core_loop_and_simulation_v1`

# Purpose
Define a codable first simulation algorithm.

The goal is not perfect balance. The goal is deterministic, explainable output that can be tuned later.

# Inputs
- seed;
- participants;
- standings rank;
- bot archetype;
- circuit primary and secondary traits;
- weather forecast;
- decisions;
- selected cards.

# Output
- resolved weather timeline;
- classification;
- event timeline;
- report blocks;
- credits and points;
- consumed cards;
- replay data.

# PRNG
Use a small deterministic seeded PRNG.

Requirements:

- same inputs and seed produce same output;
- no direct `Math.random()` inside simulation;
- expose helper functions for `roll()`, `rollInt(min,max)`, and weighted choice.

# Internal Scores
Each team starts with baseline:

```txt
pace = 50
control = 50
reliability = 50
weatherReadiness = 50
aggression = 50
score = 0
```

Decision modifiers:

```txt
PRUDENT:    pace -4, control +8, reliability +8, aggression -8
BALANCED:   no major modifier
AGGRESSIVE: pace +8, control -6, reliability -6, aggression +10

SPEED:       pace +8, reliability -2
RELIABILITY: reliability +10, control +4, pace -2
WEATHER:     weatherReadiness +12, pace -2
```

Circuit modifiers:

```txt
FAST: pace matters more
TECHNICAL: control matters more
URBAN: control and aggression risk matter more
HIGH_WEAR: reliability matters more
WEATHER_SENSITIVE: weatherReadiness matters more
```

These numbers are placeholders for the first build.

# Race Segments
V0 uses five segments:

1. Start
2. Early Race
3. Mid Race
4. Late Race
5. Finish

Each segment computes a segment delta per team:

```txt
segmentDelta = weightedScore + seededVariance + cardEffect + eventEffect
```

Keep seeded variance modest. The result should vary, not ignore decisions.

# Weather Resolution
Resolve a segment weather timeline from forecast.

V0:

- Start and Early Race often follow highest probability forecast.
- Mid Race may change based on probabilities.
- Late Race and Finish can continue or dry.

The resolved timeline must be stored.

# Segment Weights
Suggested first weights:

Start:

- pace 35%;
- aggression 35%;
- control 30%.

Early Race:

- pace 45%;
- control 35%;
- circuit fit 20%.

Mid Race:

- pace 30%;
- control 25%;
- weather readiness 30%;
- card/rival context 15%.

Late Race:

- reliability 40%;
- control 25%;
- pace 25%;
- aggression risk 10%.

Finish:

- accumulated score 70%;
- late pace/control 20%;
- event/card hooks 10%.

# Event Generation
Generate events when a meaningful threshold is crossed.

Event examples:

- `strong_start`
- `poor_start`
- `weather_change`
- `weather_gamble_paid`
- `wrong_weather_bet`
- `rival_overtake`
- `mechanical_scare`
- `mechanic_save`
- `late_push_gain`
- `late_push_failure`
- `held_position`

Rule:

- every played card must produce an event or explicit report mention;
- every major position delta should produce an event;
- player events outrank bot flavor events.

# Classification
At the end:

1. Sort by accumulated score descending.
2. Apply deterministic tie-breaker from seed and previous standing.
3. Assign positions.
4. Compute position changes.
5. Award points and credits.

V0 points for 6 teams:

```txt
P1 25
P2 18
P3 15
P4 12
P5 10
P6 8
```

# Card Hooks
Implement the first six cards:

- Rain Tires;
- Mechanic Express;
- Rocket Start;
- Slipstream Trap;
- Late Push;
- Sponsor Bonus.

Cards should be implemented as small functions:

```txt
applyBeforeRace()
applySegment()
applyAfterRace()
```

Do not build a generic rules engine in V0.

# Report Generation
Report is generated from:

- final classification;
- player decision;
- selected card result;
- top 3 player-relevant events;
- rival result;
- rewards.

Use deterministic templates keyed by event type.

# Non-goals
- No physics.
- No pit strategy.
- No tire compound model beyond cards.
- No generic rule engine.
- No machine-generated prose.
- No hidden rubber-banding.

# Open Questions
- Are the placeholder modifiers too visible or too weak?
- Should bot archetypes modify scores before or during segments?
- Should event generation happen during scoring or after classification?
