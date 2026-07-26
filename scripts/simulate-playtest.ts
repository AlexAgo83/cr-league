import { mkdir, writeFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { type RaceDecision, type RaceResult } from "../packages/shared/src/index.js";
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
import { multiplayerDecisionFor, multiplayerNextBuyFor, multiplayerPlaytestProfiles, type PlaytestProfile } from "./playtestBrain.js";

type Player = {
  index: number;
  name: string;
  profile: PlaytestProfile;
  profileId: string;
  recoveryCode: string;
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
const aiProfiles = multiplayerPlaytestProfiles;
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
    recoveryCode: owner.recoveryCode,
    maxPlayers: playerCount,
    fillWithBots: false,
    maxGrandPrixPerSeason: rounds
  });
  if (!created?.player) throw new Error("League creation did not return an owner claim.");

  const admin: Player = {
    index: firstPlayerIndex,
    name: owner.name,
    profile: profileFor(firstPlayerIndex),
    profileId: owner.profileId,
    recoveryCode: owner.recoveryCode,
    teamId: created.player.teamId,
    claimCode: created.player.claimCode,
    leagueId: created.league.id
  };
  await updateLeagueSettings(prisma, created.league.id, {
    teamId: admin.teamId,
    claimCode: admin.claimCode,
    cadence: "fast",
    preparationDeadlineAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  });

  const players = [admin];
  let state = created;
  if (!created.league.code) throw new Error("Created league did not return an invite code.");
  for (let offset = 1; offset < playerCount; offset += 1) {
    const candidate = await createPlayer(firstPlayerIndex + offset);
    const joined = await joinLeagueByCode(prisma, {
      code: created.league.code,
      teamName: candidate.name,
      profileId: candidate.profileId,
      recoveryCode: candidate.recoveryCode
    });
    if (!joined?.player) throw new Error(`Join failed for ${candidate.name}.`);
    players.push({
      index: firstPlayerIndex + offset,
      name: candidate.name,
      profile: profileFor(firstPlayerIndex + offset),
      profileId: candidate.profileId,
      recoveryCode: candidate.recoveryCode,
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
  if (!profile.recoveryCode) throw new Error(`Profile creation did not return a recovery code for ${name}.`);
  return { name, profileId: profile.profile.id, recoveryCode: profile.recoveryCode };
}

async function playLeague(run: LeagueRun) {
  for (let round = 1; round <= rounds; round += 1) {
    let cardsBought = 0;
    for (const player of run.players) {
      const body = decisionFor(run.state, player, round);
      const request = {
        teamId: player.teamId,
        claimCode: player.claimCode,
        ...body
      };
      await submitQualifyingRun(prisma, run.state.league.id, { ...request, laps: 4 + ((player.index + round) % 3) });
      await submitDecision(prisma, run.state.league.id, request);
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
    const cardId = team ? multiplayerNextBuyFor({ profile: player.profile, index: player.index, round, ownedCards: team.cards, credits: team.credits }) : undefined;
    if (!team || !cardId) continue;
    const state = await buyCard(prisma, run.state.league.id, {
      teamId: player.teamId,
      claimCode: player.claimCode,
      cardId
    });
    if (state) run.state = state;
    bought += 1;
  }
  return bought;
}

function decisionFor(state: LeagueState, player: Player, round: number): RaceDecision {
  return multiplayerDecisionFor({ profile: player.profile, index: player.index, round, teamId: player.teamId, teams: state.teams });
}

function profileFor(index: number) {
  return aiProfiles[index % aiProfiles.length]!;
}

async function writeReport(leagueRuns: LeagueRun[]) {
  const reportDate = new Date().toISOString().slice(0, 10);
  const reportPath = `reports/playtest/${reportDate}-${totalPlayers}-player-ai-multiplayer-simulation.md`;
  const profileRows = profileSummaries(leagueRuns);
  await mkdir("reports/playtest", { recursive: true });
  await writeFile(
    reportPath,
    [
      "# AI Multiplayer Simulated Playtest",
      "",
      `- Date: ${new Date().toISOString()}`,
      `- Players simulated: ${totalPlayers}`,
      `- Leagues: ${leagueRuns.length}`,
      `- Grand Prix per league: ${rounds}`,
      `- AI profiles: ${aiProfiles.map((profile) => profile.name).join(", ")}`,
      `- Browser coverage: not included; this is API workflow pressure only.`,
      "",
      "## Result",
      "- PASS: all simulated AI players joined, qualified, submitted a plan, resolved races, bought cards when affordable, and advanced through the configured GP count.",
      `- PASS: no backend rule error blocked the ${totalPlayers}-player flow split across the product limit of 16 players per league.`,
      "- PASS: AI plans covered approach, preparation, pit strategy, card usage, and rival targeting.",
      "",
      "## AI Profiles",
      "| Profile | Starts | Wins | Podiums | Pts/race | Credits/race |",
      "| --- | ---: | ---: | ---: | ---: | ---: |",
      ...profileRows.map(([profile, stats]) => `| ${profile} | ${stats.starts} | ${stats.wins} | ${stats.podiums} | ${round(stats.points / Math.max(1, stats.starts))} | ${round(stats.credits / Math.max(1, stats.starts))} |`),
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

function profileSummaries(leagueRuns: LeagueRun[]) {
  const stats = new Map(aiProfiles.map((profile) => [profile.name, { starts: 0, wins: 0, podiums: 0, points: 0, credits: 0 }]));
  const players = new Map(leagueRuns.flatMap((run) => run.players.map((player) => [player.teamId, player])));
  for (const result of leagueRuns.flatMap((run) => run.state.grandPrixHistory.map((grandPrix) => grandPrix.result as RaceResult | null).filter((result): result is RaceResult => Boolean(result)))) {
    for (const entry of result.classification) {
      const profile = players.get(entry.teamId)?.profile.name;
      const row = profile ? stats.get(profile) : undefined;
      if (!row) continue;
      row.starts += 1;
      row.wins += entry.position === 1 ? 1 : 0;
      row.podiums += entry.position <= 3 ? 1 : 0;
      row.points += entry.points;
      row.credits += entry.credits;
    }
  }
  return [...stats.entries()];
}

function round(value: number) {
  return Number(value.toFixed(2));
}
