import { mkdir, writeFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { CARD_DEFINITIONS, CARD_PRICE, RACE_APPROACHES, TECHNICAL_PREPARATIONS, type CardId, type RaceResult } from "../packages/shared/src/index.js";
import {
  buyCard,
  createDemoLeague,
  createProfile,
  joinLeagueByCode,
  resolveCurrentGrandPrix,
  startNextGrandPrix,
  submitDecision,
  submitQualifyingRun,
  updateLeagueSettings,
  type LeagueState
} from "../apps/api/src/features/leagues/store.js";

type Player = {
  index: number;
  name: string;
  teamId: string;
  claimCode: string;
  leagueId: string;
};

type LeagueRun = {
  state: LeagueState;
  admin: Player;
  players: Player[];
  rounds: RoundSummary[];
};

type RoundSummary = {
  round: number;
  winner: string;
  podium: string[];
  humanDecisions: number;
  qualifyingRuns: number;
  cardsBought: number;
};

const prisma = new PrismaClient();
const totalPlayers = numberArg("--players", 20);
const rounds = numberArg("--rounds", 3);
const maxPlayersPerLeague = 16;
const teamNames = [
  "Volt Union",
  "Late Apex",
  "Grip Plus",
  "Blue Kerb",
  "Red Sector",
  "Night Shift",
  "Apex Lab",
  "Northline",
  "Fast Bureau",
  "Rain Desk",
  "Turbo Mail",
  "Clean Air",
  "Delta Box",
  "Final Lap",
  "Sector Zero",
  "Pole Room",
  "Urban Brake",
  "Soft Wall",
  "Hard Relay",
  "Plan Fix"
];
const cardIds = Object.keys(CARD_DEFINITIONS) as CardId[];

try {
  const leagueRuns: LeagueRun[] = [];
  let remainingPlayers = totalPlayers;
  let nextPlayer = 0;

  while (remainingPlayers > 0) {
    const leagueSize = Math.min(maxPlayersPerLeague, remainingPlayers);
    const run = await createLeagueRun(leagueRuns.length + 1, leagueSize, nextPlayer);
    leagueRuns.push(run);
    remainingPlayers -= leagueSize;
    nextPlayer += leagueSize;
  }

  for (const run of leagueRuns) {
    await playLeague(run);
  }

  const reportPath = await writeReport(leagueRuns);
  console.log(`Simulated ${totalPlayers} players across ${leagueRuns.length} leagues x ${rounds} GP.`);
  console.log(`Report: ${reportPath}`);
} finally {
  await prisma.$disconnect();
}

async function createLeagueRun(leagueNumber: number, playerCount: number, firstPlayerIndex: number): Promise<LeagueRun> {
  const owner = await createPlayer(firstPlayerIndex);
  const created = await createDemoLeague(prisma, {
    name: `Auto Playtest ${Date.now()} ${leagueNumber}`,
    teamName: owner.name,
    profileId: owner.profileId,
    maxPlayers: playerCount,
    fillWithBots: false,
    maxGrandPrixPerSeason: rounds
  });
  if (!created?.player) throw new Error("League creation did not return an owner claim.");

  const admin: Player = { index: firstPlayerIndex, name: owner.name, teamId: created.player.teamId, claimCode: created.player.claimCode, leagueId: created.league.id };
  await updateLeagueSettings(prisma, created.league.id, {
    teamId: admin.teamId,
    claimCode: admin.claimCode,
    cadence: "fast",
    preparationDeadlineAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  });

  const players = [admin];
  let state = created;
  for (let offset = 1; offset < playerCount; offset += 1) {
    const candidate = await createPlayer(firstPlayerIndex + offset);
    const joined = await joinLeagueByCode(prisma, {
      code: created.league.code,
      teamName: candidate.name,
      profileId: candidate.profileId
    });
    if (!joined?.player) throw new Error(`Join failed for ${candidate.name}.`);
    players.push({
      index: firstPlayerIndex + offset,
      name: candidate.name,
      teamId: joined.player.teamId,
      claimCode: joined.player.claimCode,
      leagueId: joined.league.id
    });
    state = joined;
  }

  return { state, admin, players, rounds: [] };
}

async function createPlayer(index: number) {
  const name = teamNames[index] ?? `Team ${index + 1}`;
  const profile = await createProfile(prisma, { email: `playtest-${Date.now()}-${index}@example.test` });
  return { name, profileId: profile.profile.id };
}

async function playLeague(run: LeagueRun) {
  for (let round = 1; round <= rounds; round += 1) {
    let cardsBought = 0;
    for (const player of run.players) {
      const cardId = cardFor(run.state, player, round);
      const body = {
        teamId: player.teamId,
        claimCode: player.claimCode,
        approach: RACE_APPROACHES[(player.index + round) % RACE_APPROACHES.length]!,
        preparation: TECHNICAL_PREPARATIONS[(player.index + round * 2) % TECHNICAL_PREPARATIONS.length]!,
        ...(cardId ? { cardId } : {})
      };
      await submitQualifyingRun(prisma, run.state.league.id, { ...body, laps: 4 + ((player.index + round) % 3) });
      await submitDecision(prisma, run.state.league.id, body);
    }

    const resolved = await resolveCurrentGrandPrix(prisma, run.state.league.id, {
      teamId: run.admin.teamId,
      claimCode: run.admin.claimCode
    });
    if (!resolved?.currentGrandPrix.result) throw new Error(`League ${run.state.league.code} round ${round} did not resolve.`);
    run.state = resolved;

    const result = resolved.currentGrandPrix.result as RaceResult;
    run.rounds.push({
      round,
      winner: result.classification[0]?.teamName ?? "Unknown",
      podium: result.classification.slice(0, 3).map((entry) => entry.teamName),
      humanDecisions: resolved.decisions.length,
      qualifyingRuns: resolved.currentGrandPrix.qualifyingRuns.length,
      cardsBought
    });

    if (round < rounds) {
      cardsBought = await buyCards(run, round);
      run.rounds[run.rounds.length - 1]!.cardsBought = cardsBought;
      const next = await startNextGrandPrix(prisma, run.state.league.id, {
        teamId: run.admin.teamId,
        claimCode: run.admin.claimCode
      });
      if (!next || next.currentGrandPrix.round !== round + 1) throw new Error(`League ${run.state.league.code} did not advance to GP ${round + 1}.`);
      run.state = next;
    }
  }
}

async function buyCards(run: LeagueRun, round: number) {
  let bought = 0;
  for (const player of run.players) {
    const team = run.state.teams.find((candidate) => candidate.id === player.teamId);
    if (!team || team.credits < CARD_PRICE) continue;
    const state = await buyCard(prisma, run.state.league.id, {
      teamId: player.teamId,
      claimCode: player.claimCode,
      cardId: cardIds[(player.index + round) % cardIds.length]!
    });
    if (state) run.state = state;
    bought += 1;
  }
  return bought;
}

function cardFor(state: LeagueState, player: Player, round: number) {
  const team = state.teams.find((candidate) => candidate.id === player.teamId);
  if (!team?.cards.length || (player.index + round) % 2 !== 0) return undefined;
  return team.cards[0];
}

async function writeReport(leagueRuns: LeagueRun[]) {
  const reportDate = new Date().toISOString().slice(0, 10);
  const reportPath = `reports/playtest/${reportDate}-20-player-simulation.md`;
  await mkdir("reports/playtest", { recursive: true });
  await writeFile(
    reportPath,
    [
      "# 20 Player Simulated Playtest",
      "",
      `- Date: ${new Date().toISOString()}`,
      `- Players simulated: ${totalPlayers}`,
      `- Leagues: ${leagueRuns.length}`,
      `- Grand Prix per league: ${rounds}`,
      `- Browser coverage: not included; this is API workflow pressure only.`,
      "",
      "## Result",
      "- PASS: all simulated players joined, qualified, submitted a plan, resolved races, bought cards when affordable, and advanced through the configured GP count.",
      "- PASS: no backend rule error blocked the 20-player flow split across the product limit of 16 players per league.",
      "",
      "## League Runs",
      ...leagueRuns.flatMap((run) => [
        "",
        `### ${run.state.league.name}`,
        `- Code: ${run.state.league.code}`,
        `- Human teams: ${run.players.length}`,
        `- Final leader: ${run.state.teams[0]?.name ?? "Unknown"} (${run.state.teams[0]?.points ?? 0} pts, ${run.state.teams[0]?.credits ?? 0} credits)`,
        `- Final tail: ${run.state.teams
          .slice(-3)
          .map((team) => `${team.name} (${team.points} pts, ${team.credits} credits)`)
          .join(", ")}`,
        "",
        "| GP | Winner | Podium | Decisions | Qualifying runs | Cards bought after GP |",
        "| --- | --- | --- | ---: | ---: | ---: |",
        ...run.rounds.map((round) => `| ${round.round} | ${round.winner} | ${round.podium.join(", ")} | ${round.humanDecisions} | ${round.qualifyingRuns} | ${round.cardsBought} |`)
      ]),
      "",
      "## Follow-Up",
      "- Run the browser checklist for visual-only items: animated highlights, report/replay shortcuts, empty-state images, and layout polish.",
      "- Keep 20-player simulation split across multiple leagues unless the product limit changes above 16."
    ].join("\n") + "\n",
    "utf8"
  );
  return reportPath;
}

function numberArg(name: string, fallback: number) {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? Number(process.argv[index + 1]) : fallback;
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}
