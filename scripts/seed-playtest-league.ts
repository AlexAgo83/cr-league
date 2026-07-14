import { PrismaClient } from "@prisma/client";
import { DEMO_RACE_INPUT } from "../packages/shared/src/simulation/demoRace.js";

const prisma = new PrismaClient();
const code = process.env.PLAYTEST_LEAGUE_CODE ?? "PLAY01";

async function main() {
  await prisma.league.deleteMany({
    where: { code }
  });

  const league = await prisma.league.create({
    data: {
      name: "CR League Playtest",
      code,
      cadence: "fast",
      preparationDeadlineAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  });

  const botNames = ["Mika Blitz", "Northline"];
  for (const name of botNames) {
    await prisma.team.create({
      data: {
        leagueId: league.id,
        name,
        kind: "bot"
      }
    });
  }

  await prisma.grandPrix.create({
    data: {
      leagueId: league.id,
      name: DEMO_RACE_INPUT.grandPrixName,
      round: 1,
      seed: `${DEMO_RACE_INPUT.seed}-${league.id}-playtest`,
      primaryTrait: DEMO_RACE_INPUT.primaryTrait,
      secondaryTrait: DEMO_RACE_INPUT.secondaryTrait,
      forecast: DEMO_RACE_INPUT.forecast
    }
  });

  console.log(`Playtest league ${league.code}: ${league.id}`);
  console.log("Human testers can join with team names: Volt Union, Late Apex");
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
