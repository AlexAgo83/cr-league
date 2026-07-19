# Balance simulations

Run the balance kit from the repo root:

```bash
npm run balance:sim
```

Useful variants:

```bash
npm run balance:sim -- --runs 500
npm run balance:sim -- --runs 1000 --json reports/balance/latest.json
npm run balance:sim -- --runs 100 --circuits 3 --limit 8
```

What it measures:

- one candidate strategy at a time against a fixed seven-car bot grid;
- all approach/preparation/card combinations, including no card;
- all city circuits by default;
- deterministic qualifying grid estimate before each race;
- average grid, average finish, win rate, podium rate, points, internal score, credits, card price, credit margin, next-card affordability, GP-per-card estimate, and card trigger rate.

Use the output this way:

- `Top strategies` shows overpowered combinations.
- `Bottom strategies` shows dead choices.
- `Card summary` compares cards independent of approach/preparation.
- `Economy summary` compares cards by credits minus card price, so economy cards can be checked against race sacrifice.
- `Circuit summary` shows whether a circuit is much richer or poorer than the others.
- `Outliers` flags strategies more than `--outlier` average points away from `balanced/speed/no_card`.

What to check after card/economy changes:

- no single card dominates points, win rate, and credit margin at the same time;
- economy cards should pay for future options without becoming the obvious racing choice;
- qualifying-focused cards should improve average grid without making average finish automatic;
- if pole converts too often, test softer grid advantage or larger overtaking windows before redesigning qualifying;
- circuit summaries should not show one circuit paying wildly more points/credits than the others;
- card price changes should keep `GP/card` in a range that makes buying a choice.

The script reuses `simulateRace`; it is a balance smoke test, not a full league-season simulator. Use it before playtests, then treat tester feedback as the stronger signal.

## AI season playtest

Run the AI playtest when you want many simulated players to play seasons and produce one readable verdict:

```bash
npm run playtest:ai
npm run playtest:ai -- --agents 50 --seasons 3 --rounds 6 --report reports/playtest/latest-ai.md --json reports/playtest/latest-ai.json
```

What it adds on top of `balance:sim`:

- multiple AI profiles with different approach, preparation, pit, and buying habits;
- inventory use, card consumption, and card purchases between GP;
- season standings, champions, card trigger rates, dead-card checks, and profile win rates;
- deterministic fun/frustration scores from finish position and concrete race events.

Use the alerts this way:

- `dominant profile` means one AI style is probably too efficient across circuits;
- `dead card trigger` means a card was played but never produced an event;
- `never played` means the simulated profile mix did not cover that card.

This is still a mechanics runner. Use `npm run playtest:simulate` for API workflow pressure and browser QA for layout, animation, copy, and replay feel.
