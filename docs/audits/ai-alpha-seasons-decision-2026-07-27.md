# AI Alpha Seasons Decision - 2026-07-27

## Decision
Proceed to the 0.6 beta-season lifecycle corpus.

The alpha evidence found follow-up risks, but no pre-0.6 blocker. Runtime stability, browser traversal, cold-start onboarding, replayability variety, and the balance gate all passed. The next corpus should make beta-season lifecycle the product slice and carry the observed balance/UX risks as gates, not open a separate 0.5 or UX-only detour first.

## Evidence Matrix
| Surface | Command | Sample | Pass threshold | Result | Report |
| --- | --- | --- | --- | --- | --- |
| Headless AI seasons | `npx tsx scripts/ai-playtest.ts --agents 84 --seasons 6 --rounds 6 --league-size 6 --report reports/playtest/alpha-seasons/headless-ai-playtest.md --json reports/playtest/alpha-seasons/headless-ai-playtest.json` | 84 agents, 6 seasons, 6 GP, league size 6 | command exits 0; markdown + JSON written; no stability failure | PASS with balance watchpoints | `reports/playtest/alpha-seasons/headless-ai-playtest.md`, `reports/playtest/alpha-seasons/headless-ai-playtest.json` |
| Replayability | `npx tsx scripts/replayability-analytics.ts --seasons 24 --rounds 6 --agents 14 --report reports/playtest/alpha-seasons/replayability.md --json reports/playtest/alpha-seasons/replayability.json` | 24 seasons, 6 GP, 14 agents | command exits 0; dominant cluster <= 25%; boring race rate acceptable | PASS | `reports/playtest/alpha-seasons/replayability.md`, `reports/playtest/alpha-seasons/replayability.json` |
| Balance gate | `npm run balance:gate` | 1 run, 4 circuits, 432 strategies | exit 0; max gap <= 25%; pit points spread <= 4.5 | PASS | `reports/playtest/alpha-seasons/balance-gate.txt` |
| Browser multi-profile | `npx tsx scripts/browser-fun-score.ts --rounds 2 --profiles sprinter,rain-reader,banker,closer --report reports/playtest/alpha-seasons/browser-fun-score.md --runs-dir reports/playtest/alpha-seasons/browser-fun-score-runs` | 4 profiles, 2 GP each | all profile runs exit 0; scenario checks pass | PASS with banker fun watchpoint | `reports/playtest/alpha-seasons/browser-fun-score.md` |
| UX playthrough | `npx tsx scripts/browser-playtest.ts --rounds 2 --profile sprinter --report reports/playtest/alpha-seasons/browser-ux-smoke.md --ux-report reports/playtest/alpha-seasons/browser-playthrough.md --ux-assets reports/playtest/alpha-seasons/browser-playthrough-assets` | 1 profile, 2 GP, desktop + mobile captures | result PASS; no console/UI failures; no mobile body overflow | PASS with accessibility follow-up | `reports/playtest/alpha-seasons/browser-ux-smoke.md`, `reports/playtest/alpha-seasons/browser-playthrough.md` |
| Cold start | `npx tsx scripts/browser-playtest.ts --rounds 1 --profile sprinter --report reports/playtest/alpha-seasons/browser-cold-start-smoke.md --cold-start-report reports/playtest/alpha-seasons/cold-start-funnel.md` | mobile 390x900, first-session funnel | result PASS; reaches first purchase | PASS | `reports/playtest/alpha-seasons/cold-start-funnel.md` |

## Findings
- Proceed-to-0.6: browser flows completed, cold-start reached first purchase in 2320 ms measured step time, no UI failures or console errors were reported, and replayability had 99.31% unique finishing orders, 96.53% comeback race rate, 0% boring races, and average title lock round 5.75.
- Economy/card follow-up: not a blocker before 0.6. The headless profile report flags sprinter at 63.43% win rate and all-in-attack at 41.67%, but replayability dominant clusters stay under the 25% gate and the balance gate exits 0.
- UX/friction follow-up: not a blocker before 0.6. Browser comprehension checks pass across the core scenarios and cold-start has no observed missing/ambiguous copy. Carry accessibility cleanup into 0.6 because the UX report still shows critical button-name issues, contrast issues, and many small mobile tap targets.
- Stability bugfix: rejected. All commands exited 0 and produced reports.

## 0.6 Entry Gates
- Keep beta-season lifecycle as the next corpus.
- Add a narrow 0.6 acceptance gate for accessibility debt visible in `browser-playthrough.md`: discernible button names, contrast, page heading, prohibited ARIA, and mobile tap targets.
- Keep profile dominance as a beta-season watchpoint; do not tune cards again until beta lifecycle evidence repeats it with real season behavior.
