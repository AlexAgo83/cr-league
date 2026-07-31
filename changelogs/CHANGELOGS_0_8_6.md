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
- Below four cars, every one leaves a tyre trail on any map.
- The duel takes the whole screen. The map is the board: the standing top-left, both engagement tanks and the lap history top-right, the three calls across the bottom, the rematch in the corner. The reveal panel is gone — the lap history already says what he chose and what it was worth.
- An attack with an empty tank is closed rather than offered.
- The team you follow is named on the race-tracking panel instead of heading the running order it is already listed in.
- The dotted line is drawn between the selection and its car, with no other rule. It used to be all of them below four cars and only the followed one above.
- Open-wheel cars carry marker lights on the nose instead of a GT's headlights.

## Fixed
- Fixed the lap counter, which could show one lap past the last one.
- Fixed the Destiny Wheel camera following the wrong car when no team was the player's.
- Fixed the circuit pagination turning black on black.
- Fixed status notifications landing on top of the race-day bar on a full-page map.
- Fixed an arcade game offering "Back to the game" in the header, which is not where a player in a duel wants to go: it is the way back to the menu.
- Fixed the camera zoom pumping between wide and close for a whole duel, because two cars are never far enough apart to leave close range.
