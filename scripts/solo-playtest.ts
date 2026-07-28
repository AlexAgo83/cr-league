// Drives the real solo loop — the shared engine, exactly what the browser runs locally — with
// the playtest brain making the calls. The multiplayer playtests all go through the API, so
// nothing exercised solo end to end before this.
//
// Usage: npm run playtest:solo [-- --profiles sprinter,banker --seasons 2]
import { mkdir, writeFile } from "node:fs/promises";
import {
  buyCard,
  circuitIdentityForRound,
  circuitSeasonSeed,
  resolveGrandPrix,
  runQualifying,
  startNextGrandPrix,
  submitDecision,
  SharedLeagueRuleError,
  type CardId,
  type LeagueState
} from "../packages/shared/src/index.js";
import { createInitialSoloLeagueState, SOLO_LEAGUE_ID, SOLO_TEAM_ID } from "../apps/web/src/app/soloLeague.js";
import { frustrationScore, funScore, multiplayerDecisionFor, multiplayerNextBuyFor, playtestProfiles } from "./playtestBrain.js";

const seasons = numberArg("--seasons", 2);
const requested = stringArg("--profiles", "sprinter,rain-reader,banker,closer,all-in-attack,no-card-saver");
const reportPath = stringArg("--report", `reports/playtest/${new Date().toISOString().slice(0, 10)}-solo-playtest.md`);
const profiles = requested.split(",").map((name) => playtestProfiles.find((profile) => profile.name === name.trim())).filter(Boolean) as typeof playtestProfiles;

type RoundLog = {
  season: number;
  round: number;
  circuit: string;
  position: number;
  points: number;
  credits: number;
  fun: number;
  frustration: number;
  bought?: CardId;
  blocked?: string;
};

type ProfileRun = {
  profile: string;
  rounds: RoundLog[];
  finalPoints: number;
  finalCredits: number;
  errors: string[];
  purchasesBlocked: number;
  bestTimes: number;
};

// index is the *profile* index, not the round counter: multiplayerCardFor() plays a card only
// when (index + round) is even, so passing the loop counter kept them in lockstep and no card
// was ever played.
function playProfile(profileIndex: number): ProfileRun {
  const profile = profiles[profileIndex]!;
  let state: LeagueState = createInitialSoloLeagueState();
  const rounds: RoundLog[] = [];
  const errors: string[] = [];
  let purchasesBlocked = 0;
  const totalRounds = seasons * state.league.maxGrandPrixPerSeason;

  for (let index = 0; index < totalRounds; index += 1) {
    const gp = state.currentGrandPrix;
    const circuit = circuitIdentityForRound(gp.round, circuitSeasonSeed(SOLO_LEAGUE_ID, gp.season));
    const me = state.teams.find((team) => team.id === SOLO_TEAM_ID)!;

    // Shop before the race, like a player would.
    const buy = multiplayerNextBuyFor({ profile, index: profileIndex, round: gp.round, ownedCards: me.cards, credits: me.credits });
    let bought: CardId | undefined;
    if (buy) {
      try {
        state = buyCard(state, { teamId: SOLO_TEAM_ID, cardId: buy });
        bought = buy;
      } catch (error) {
        purchasesBlocked += 1;
        if (!(error instanceof SharedLeagueRuleError)) errors.push(`buy ${buy}: ${String(error)}`);
      }
    }

    const owned = state.teams.find((team) => team.id === SOLO_TEAM_ID)!.cards;
    const decision = multiplayerDecisionFor({
      profile,
      index: profileIndex,
      round: gp.round,
      teamId: SOLO_TEAM_ID,
      teams: state.teams.map((team) => ({ id: team.id, name: team.name, points: team.points, cards: team.cards, credits: team.credits }))
    });
    const cardId = decision.cardId && owned.includes(decision.cardId) ? decision.cardId : undefined;

    try {
      state = runQualifying(state, { teamId: SOLO_TEAM_ID, ...decision, cardId, laps: 3 }).state;
      state = submitDecision(state, { teamId: SOLO_TEAM_ID, ...decision, cardId });
      state = resolveGrandPrix(state, { allowDefaults: true });
    } catch (error) {
      errors.push(`round ${gp.season}-${gp.round}: ${error instanceof Error ? error.message : String(error)}`);
      break;
    }

    const result = state.currentGrandPrix.result!;
    const entry = result.classification.find((candidate) => candidate.teamId === SOLO_TEAM_ID)!;
    rounds.push({
      season: gp.season,
      round: gp.round,
      circuit: circuit.layoutKey,
      position: entry.position,
      points: entry.points,
      credits: entry.credits,
      fun: funScore(entry.position, result, SOLO_TEAM_ID),
      frustration: frustrationScore(entry.position, result, SOLO_TEAM_ID),
      bought,
      blocked: buy && !bought ? buy : undefined
    });

    if (index < totalRounds - 1) {
      try {
        state = startNextGrandPrix(state);
      } catch (error) {
        errors.push(`next gp after ${gp.season}-${gp.round}: ${error instanceof Error ? error.message : String(error)}`);
        break;
      }
    }
  }

  const finalTeam = state.teams.find((team) => team.id === SOLO_TEAM_ID)!;
  return {
    profile: profile.name,
    rounds,
    finalPoints: finalTeam.points,
    finalCredits: finalTeam.credits,
    errors,
    purchasesBlocked,
    bestTimes: Object.keys(finalTeam.circuitRecords ?? {}).length
  };
}

const runs = profiles.map((_, index) => playProfile(index));
const totalRounds = runs.reduce((sum, run) => sum + run.rounds.length, 0);
const expectedRounds = profiles.length * seasons * 6;
const avg = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

const lines: string[] = [
  "# Solo Playtest Report",
  "",
  `- Date: ${new Date().toISOString()}`,
  `- Seasons: ${seasons}`,
  `- Profiles: ${profiles.map((profile) => profile.name).join(", ")}`,
  `- Rounds played: ${totalRounds} / ${expectedRounds}`,
  "",
  "## Verdict"
];

const failed = runs.filter((run) => run.errors.length);
lines.push(failed.length ? `- FAIL: ${failed.length} profile(s) hit an engine error` : "- PASS: every profile completed the full run");
for (const run of failed) for (const error of run.errors) lines.push(`  - ${run.profile}: ${error}`);

const blocked = runs.reduce((sum, run) => sum + run.purchasesBlocked, 0);
if (blocked) lines.push(`- CHECK: ${blocked} card purchase(s) refused, mostly for credits`);
const missingRecords = runs.filter((run) => run.bestTimes < new Set(run.rounds.map((round) => round.circuit)).size);
if (missingRecords.length) lines.push(`- CHECK: ${missingRecords.length} profile(s) ended with fewer circuit records than circuits raced`);

lines.push(
  "",
  "## Per Profile",
  "| Profile | Wins | Podiums | Avg pos | Pts | Credits | Fun | Frustration | Records | Buys refused |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"
);
for (const run of runs) {
  const positions = run.rounds.map((round) => round.position);
  lines.push(
    `| ${run.profile} | ${positions.filter((position) => position === 1).length} | ${positions.filter((position) => position <= 3).length} | ${avg(positions).toFixed(2)} | ${run.finalPoints} | ${run.finalCredits} | ${avg(run.rounds.map((round) => round.fun)).toFixed(2)} | ${avg(run.rounds.map((round) => round.frustration)).toFixed(2)} | ${run.bestTimes} | ${run.purchasesBlocked} |`
  );
}

lines.push("", "## First Season, Round By Round", "| Profile | GP | Circuit | Pos | Pts | Credits | Bought | Refused |", "| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const run of runs) {
  for (const round of run.rounds.filter((entry) => entry.season === 1)) {
    lines.push(`| ${run.profile} | ${round.season}-${round.round} | ${round.circuit} | P${round.position} | ${round.points} | ${round.credits} | ${round.bought ?? "-"} | ${round.blocked ?? "-"} |`);
  }
}

await mkdir(reportPath.split("/").slice(0, -1).join("/"), { recursive: true });
await writeFile(reportPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Solo playtest: ${profiles.length} profiles x ${seasons} seasons`);
console.log(`Report: ${reportPath}`);

function stringArg(flag: string, fallback: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

function numberArg(flag: string, fallback: number) {
  const value = Number(stringArg(flag, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}
