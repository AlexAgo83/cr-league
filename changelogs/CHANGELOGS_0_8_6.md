# CR League 0.8.6
Release date: 2026-07-31

## Added
- The One to Beat: a new arcade game. Eight laps against a single rival, one secret call per lap — attack, manage or cover — and a ring that decides who takes time out of whom. Attacking spends engagement, only managing gives it back, and each lap is driven out on the map between the two calls.
- The rival reads you. He plays his archetype, answers a habit when he spots one, comes forward when the flag is close and he is losing, and shuts the door on a lead worth keeping.
- Rain falls on the screen when the race is wet, heavier in a downpour, and the wind slowly turns the drops.
- Team helmets appear in the race lists, on profiles and on the rival you follow.
- The car reacts to its own lap times during a chrono: a lap that beats every earlier one, and a lap thrown away. A chrono used to run in silence.

## Changed
- The full-page map is now the layout for the Stand and the replay, at every width. The header floats over the map and the route is drawn edge to edge.
- Bots think about the weekend in front of them. Approach, tyres, pit strategy and the card they play all read the forecast, the circuit and the championship instead of repeating one plan all season — and they buy for the season rather than at random.
- Chrono attempts learn: a bot runs its plan, tries one variation, then goes back out on whichever was quicker.
- Wet tyres are worth taking when it really rains. They used to lose to speed rubber even in a downpour, so the forecast never actually changed the right answer. They now cost you places in the dry, still cost you in a drizzle, and gain you places in heavy rain — a judgement call rather than a formality.
- Below four cars, every one leaves a tyre trail on any map.
- The duel takes the whole screen. The map is the board: the standing top-left, the lap history top-right, both engagement tanks capping the three calls across the bottom, the rematch in the corner. The reveal panel is gone — the lap history already says what he chose and what it was worth.
- The duel ends on a recap in the middle of the map, the way a Grand Prix and a chrono do: the verdict, the gap at the flag and how many laps each driver took.
- Duel rivals are named by the same generator as every other team, so no two duels open on the same driver.
- The duel's lap history is on the board from the start, with a line saying what will land there, instead of appearing after the first lap.
- Leaving an arcade game for the menu points "Back to the game" at that arcade game rather than at a campaign left an hour ago. It reopens the game's entry screen: a duel in progress is not saved anywhere.
- An attack with an empty tank is closed rather than offered.
- The team you follow is named on the race-tracking panel, beside the gap pills, instead of heading the running order it is already listed in. A chrono has one car, so it says nothing there.
- The dotted line is drawn between the selection and its car, with no other rule. It used to be all of them below four cars and only the followed one above.
- Open-wheel cars carry marker lights on the nose instead of a GT's headlights.

## Fixed
- Fixed the lap counter, which could show one lap past the last one.
- Fixed the Destiny Wheel camera following the wrong car when no team was the player's.
- Fixed the circuit pagination turning black on black.
- Fixed status notifications landing on top of the race-day bar on a full-page map.
- Fixed an arcade game offering "Back to the game" in the header, which is not where a player in a duel wants to go: it is the way back to the menu.
- Fixed the camera zoom pumping between wide and close for a whole duel, because two cars are never far enough apart to leave close range.
- The map says so when the circuit drawings fail to load, and offers the reload that is the only way to get them back.
- Fixed a screen going blank when the circuit drawings fail to load. The Stand carries its panels over the map, and they went down with it: the race-day bar, the plan, the standings and every button that moves the Grand Prix on. Only the drawing is missing now.
