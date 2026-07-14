import { PrismaClient } from "@prisma/client";
import { DEMO_RACE_INPUT } from "../packages/shared/src/simulation/demoRace.js";

const prisma = new PrismaClient();
const BOT_LIVERY_COLORS = ["#38bdf8", "#f97316", "#a78bfa", "#f43f5e", "#facc15", "#22c55e"] as const;

async function main() {
  const league = await prisma.league.upsert({
    where: { code: "DEMO01" },
    update: { name: "Office League" },
    create: {
      name: "Office League",
      code: "DEMO01"
    }
  });

  await prisma.team.createMany({
    data: DEMO_RACE_INPUT.participants.map((participant, index) => ({
      leagueId: league.id,
      name: index === 0 ? "Circle One" : participant.teamName,
      kind: participant.kind,
      claimCode: `DEMO01-${index}`,
      points: 0,
      credits: 0,
      livery:
        participant.kind === "bot"
          ? {
              primary: BOT_LIVERY_COLORS[index % BOT_LIVERY_COLORS.length],
              secondary: BOT_LIVERY_COLORS[(index + 2) % BOT_LIVERY_COLORS.length]
            }
          : { primary: "#16c784", secondary: "#38bdf8" }
    })),
    skipDuplicates: true
  });

  await prisma.grandPrix.upsert({
    where: {
      leagueId_round: {
        leagueId: league.id,
        round: 1
      }
    },
    update: {},
    create: {
      leagueId: league.id,
      name: DEMO_RACE_INPUT.grandPrixName,
      round: 1,
      seed: `${DEMO_RACE_INPUT.seed}-${league.id}`,
      primaryTrait: DEMO_RACE_INPUT.primaryTrait,
      secondaryTrait: DEMO_RACE_INPUT.secondaryTrait,
      forecast: DEMO_RACE_INPUT.forecast
    }
  });

  console.log(`Seeded demo league ${league.code}: ${league.id}`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
