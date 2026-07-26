import { mkdir, writeFile } from "node:fs/promises";
import {
  circuitIdentityForRound,
  circuitSeasonSeed,
  CARD_PRICES,
  raceInputFromCircuit,
  simulateRace,
  trackZonesForCircuit,
  type CardId,
  type CityCircuitIdentity,
  type RaceDecision,
  type RaceParticipant,
  type RaceResult
} from "../packages/shared/src/index.js";
import { nextPlaytestCardPurchase, playtestCardIds, playtestDecisionForAgent, playtestProfiles, type PlaytestAgentState } from "./playtestBrain.js";

type Agent = PlaytestAgentState & {
  name: string;
  nextBuyIndex: number;
  credits: number;
  wins: number;
};

type RaceRow = {
  season: number;
  round: number;
  circuit: string;
  winner: string;
  winnerCluster: string;
  leadChanges: number;
  orderChanges: number;
  closeFinish: boolean;
  boring: boolean;
  biggestComeback: number;
  winningGap: number;
};

type SeasonRow = {
  season: number;
  champion: string;
  championPoints: number;
  titleLockedRound: number;
  leadChanges: number;
  closeFinishes: number;
  boringRaces: number;
  biggestComeback: number;
};

const args = parseArgs();
const reportPath = args.report ?? `reports/playtest/${new Date().toISOString().slice(0, 10)}-replayability-analytics.md`;
const jsonPath = args.json ?? reportPath.replace(/\.md$/, ".json");
const cardStats = new Map(playtestCardIds.map((cardId) => [cardId, { played: 0, bought: 0 }]));
const races: RaceRow[] = [];
const seasons: SeasonRow[] = [];
const clusterWins = new Map<string, number>();
const championCounts = new Map<string, number>();
const finishingOrders = new Map<string, number>();

for (let season = 1; season <= args.seasons; season += 1) {
  const agents = createAgents(args.agents);
  const pointsTimeline: Array<Map<string, number>> = [];
  for (let round = 1; round <= args.rounds; round += 1) {
    const circuit = circuitIdentityForRound(round, circuitSeasonSeed("replayability", season));
    const { result, participants } = runRace(season, round, circuit, agents);
    const race = summarizeRace(season, round, circuit, result, participants);
    races.push(race);
    clusterWins.set(race.winnerCluster, (clusterWins.get(race.winnerCluster) ?? 0) + 1);
    finishingOrders.set(result.classification.map((entry) => entry.teamId).join(">"), (finishingOrders.get(result.classification.map((entry) => entry.teamId).join(">")) ?? 0) + 1);
    for (const entry of result.classification) {
      const agent = agents.find((candidate) => candidate.id === entry.teamId);
      if (!agent) continue;
      agent.points += entry.points;
      agent.credits += entry.credits;
      agent.wins += entry.position === 1 ? 1 : 0;
      agent.starts += 1;
    }
    pointsTimeline.push(new Map(agents.map((agent) => [agent.id, agent.points])));
    agents.forEach(buyNextCard);
  }
  const champion = [...agents].sort((left, right) => right.points - left.points || right.credits - left.credits)[0]!;
  championCounts.set(champion.name, (championCounts.get(champion.name) ?? 0) + 1);
  seasons.push({
    season,
    champion: champion.name,
    championPoints: champion.points,
    titleLockedRound: titleLockedRound(champion.id, pointsTimeline, args.rounds),
    leadChanges: sum(races.filter((race) => race.season === season), "leadChanges"),
    closeFinishes: races.filter((race) => race.season === season && race.closeFinish).length,
    boringRaces: races.filter((race) => race.season === season && race.boring).length,
    biggestComeback: Math.max(0, ...races.filter((race) => race.season === season).map((race) => race.biggestComeback))
  });
}

const payload = buildPayload();
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport(payload), "utf8");
await mkdir(dirname(jsonPath), { recursive: true });
await writeFile(jsonPath, JSON.stringify(payload, null, 2) + "\n", "utf8");

console.log(`Replayability analytics: ${args.seasons} seasons x ${args.rounds} GP x ${args.agents} agents`);
console.log(`Report: ${reportPath}`);
console.log(`JSON: ${jsonPath}`);

function runRace(season: number, round: number, circuit: CityCircuitIdentity, agents: Agent[]) {
  const raceInput = raceInputFromCircuit(circuit);
  const ranked = [...agents].sort((left, right) => right.points - left.points || left.name.localeCompare(right.name));
  const participants = ranked.map<RaceParticipant>((agent, index) => ({
    teamId: agent.id,
    teamName: agent.name,
    kind: "human",
    standingsRank: index + 1,
    decision: playtestDecisionForAgent(agent, circuit, ranked, (cardId) => cardStats.get(cardId)!.played)
  }));
  const result = simulateRace({
    seed: `replayability-s${season}-r${round}`,
    grandPrixName: `${circuit.city} ${round}`,
    primaryTrait: raceInput.primaryTrait,
    secondaryTrait: raceInput.secondaryTrait,
    traits: circuit.traits,
    trackLengthMeters: circuit.trackLengthMeters,
    laps: circuit.laps,
    pitLaneProgress: circuit.pitLaneProgress,
    trackZones: trackZonesForCircuit(circuit),
    forecast: raceInput.forecast,
    participants
  });
  for (const participant of participants) {
    if (participant.decision.cardId) cardStats.get(participant.decision.cardId)!.played += 1;
  }
  for (const consumed of result.consumedCards) {
    const agent = agents.find((candidate) => candidate.id === consumed.teamId);
    if (agent) agent.cards = removeOne(agent.cards, consumed.cardId);
  }
  return { result, participants };
}

function summarizeRace(season: number, round: number, circuit: CityCircuitIdentity, result: RaceResult, participants: RaceParticipant[]): RaceRow {
  const finalTrace = result.replayTrace?.at(-1);
  const winner = result.classification[0]!;
  const runnerUp = result.classification[1];
  const winningGap = runnerUp && finalTrace ? finalTrace.gaps[runnerUp.teamId] ?? 0 : 0;
  const orderChanges = result.replayFacts?.orderChanges.length ?? 0;
  const leadChanges = countLeadChanges(result);
  const biggestComeback = Math.max(0, ...result.classification.map((entry) => -entry.positionChange));
  const winnerParticipant = participants.find((participant) => participant.teamId === winner.teamId);
  return {
    season,
    round,
    circuit: circuit.layoutKey,
    winner: winner.teamName,
    winnerCluster: winnerParticipant ? clusterFor(winnerParticipant.decision) : "unknown",
    leadChanges,
    orderChanges,
    closeFinish: winningGap > 0 && winningGap <= args.closeGap,
    boring: orderChanges === 0,
    biggestComeback,
    winningGap: roundNumber(winningGap)
  };
}

function countLeadChanges(result: RaceResult) {
  let previous = result.replayTrace?.[0]?.order[0];
  let changes = 0;
  for (const point of result.replayTrace ?? []) {
    const leader = point.order[0];
    if (leader && previous && leader !== previous) changes += 1;
    if (leader) previous = leader;
  }
  return changes;
}

function titleLockedRound(championId: string, timeline: Array<Map<string, number>>, rounds: number) {
  for (let index = 0; index < timeline.length; index += 1) {
    const points = timeline[index]!;
    const championPoints = points.get(championId) ?? 0;
    const maxOther = Math.max(0, ...[...points.entries()].filter(([id]) => id !== championId).map(([, points]) => points));
    const remaining = rounds - index - 1;
    if (championPoints > maxOther + remaining * 25) return index + 1;
  }
  return rounds;
}

function buyNextCard(agent: Agent) {
  const next = nextPlaytestCardPurchase(agent, (cardId) => cardStats.get(cardId)!.bought);
  if (!next) return;
  const price = CARD_PRICES[next.cardId];
  agent.credits -= price;
  agent.cards.push(next.cardId);
  agent.nextBuyIndex = next.nextBuyIndex;
  cardStats.get(next.cardId)!.bought += 1;
}

function createAgents(count: number): Agent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `agent_${index + 1}`,
    name: `${playtestProfiles[index % playtestProfiles.length]!.name}-${index + 1}`,
    profile: playtestProfiles[index % playtestProfiles.length]!,
    starts: 0,
    points: 0,
    cards: [playtestCardIds[index % playtestCardIds.length]!],
    nextBuyIndex: 0,
    credits: 120,
    wins: 0
  }));
}

function buildPayload() {
  const totalRaces = Math.max(1, races.length);
  const dominantClusters = [...clusterWins.entries()]
    .map(([cluster, wins]) => ({ cluster, wins, winRate: pct(wins / totalRaces), dominant: wins / totalRaces > args.dominance }))
    .sort((left, right) => right.wins - left.wins);
  const boringCircuits = rankedCounts(races.filter((race) => race.boring).map((race) => race.circuit));
  const suspenseRounds = rankedCounts(seasons.map((season) => String(season.titleLockedRound)));
  const uniqueOrders = finishingOrders.size;
  const uniqueChampions = championCounts.size;
  return {
    args,
    generatedAt: new Date().toISOString(),
    replayability: {
      totalRaces,
      uniqueChampions,
      championVarietyPct: pct(uniqueChampions / Math.max(1, args.seasons)),
      uniqueFinishingOrders: uniqueOrders,
      finishingOrderVarietyPct: pct(uniqueOrders / totalRaces),
      comebackRaceRate: pct(races.filter((race) => race.biggestComeback >= args.comeback).length / totalRaces),
      averageTitleLockedRound: roundNumber(seasons.reduce((sum, season) => sum + season.titleLockedRound, 0) / Math.max(1, seasons.length)),
      dominantClusters
    },
    funArc: {
      averageLeadChanges: roundNumber(races.reduce((sum, race) => sum + race.leadChanges, 0) / totalRaces),
      closeFinishRate: pct(races.filter((race) => race.closeFinish).length / totalRaces),
      boringRaceRate: pct(races.filter((race) => race.boring).length / totalRaces),
      averageOrderChanges: roundNumber(races.reduce((sum, race) => sum + race.orderChanges, 0) / totalRaces)
    },
    drillDown: {
      boringCircuits,
      suspenseKillingRounds: suspenseRounds,
      biggestComebacks: [...races].sort((left, right) => right.biggestComeback - left.biggestComeback).slice(0, args.limit),
      closestFinishes: races.filter((race) => race.winningGap > 0).sort((left, right) => left.winningGap - right.winningGap).slice(0, args.limit)
    },
    seasons,
    races
  };
}

function renderReport(payload: ReturnType<typeof buildPayload>) {
  return [
    "# Replayability And Fun Analytics",
    "",
    `- Date: ${payload.generatedAt}`,
    `- Seasons: ${args.seasons}`,
    `- Grand Prix per season: ${args.rounds}`,
    `- Agents: ${args.agents}`,
    "",
    "## Replayability",
    `- Unique champions: ${payload.replayability.uniqueChampions} (${payload.replayability.championVarietyPct}%)`,
    `- Unique finishing orders: ${payload.replayability.uniqueFinishingOrders} (${payload.replayability.finishingOrderVarietyPct}%)`,
    `- Comeback race rate: ${payload.replayability.comebackRaceRate}%`,
    `- Average title locked round: ${payload.replayability.averageTitleLockedRound}`,
    "",
    "## Dominant Strategy Clusters",
    table(["Cluster", "Wins", "Win %", "Dominant"], payload.replayability.dominantClusters.map((row) => [row.cluster, row.wins, row.winRate, row.dominant ? "yes" : "no"])),
    "",
    "## Fun Arc",
    `- Average lead changes: ${payload.funArc.averageLeadChanges}`,
    `- Average order changes: ${payload.funArc.averageOrderChanges}`,
    `- Close finish rate: ${payload.funArc.closeFinishRate}%`,
    `- Boring race rate: ${payload.funArc.boringRaceRate}%`,
    "",
    "## Boring Circuits",
    table(["Circuit", "Boring races"], payload.drillDown.boringCircuits.slice(0, args.limit).map((row) => [row.key, row.count])),
    "",
    "## Suspense Killing Rounds",
    table(["Title locked round", "Seasons"], payload.drillDown.suspenseKillingRounds.map((row) => [row.key, row.count])),
    "",
    "## Biggest Comebacks",
    table(["Season", "GP", "Circuit", "Comeback", "Winner"], payload.drillDown.biggestComebacks.map((row) => [row.season, row.round, row.circuit, row.biggestComeback, row.winner])),
    "",
    "## Closest Finishes",
    table(["Season", "GP", "Circuit", "Gap", "Winner"], payload.drillDown.closestFinishes.map((row) => [row.season, row.round, row.circuit, row.winningGap, row.winner]))
  ].join("\n") + "\n";
}

function clusterFor(decision: RaceDecision) {
  return `${decision.approach}/${decision.preparation}/${decision.pitStrategy}/${decision.cardId ?? "no_card"}`;
}

function rankedCounts(items: string[]) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts.entries()].map(([key, count]) => ({ key, count })).sort((left, right) => right.count - left.count || left.key.localeCompare(right.key));
}

function removeOne(cards: CardId[], cardId: CardId) {
  const next = [...cards];
  const index = next.indexOf(cardId);
  if (index >= 0) next.splice(index, 1);
  return next;
}

function sum(rows: RaceRow[], key: "leadChanges") {
  return rows.reduce((total, row) => total + row[key], 0);
}

function parseArgs() {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index]!;
    if (!arg.startsWith("--")) continue;
    values.set(arg.slice(2), process.argv[index + 1]?.startsWith("--") ? "true" : (process.argv[++index] ?? "true"));
  }
  return {
    seasons: integer(values, "seasons", 12, 1, 200),
    rounds: integer(values, "rounds", 6, 1, 24),
    agents: integer(values, "agents", 14, 4, 42),
    limit: integer(values, "limit", 8, 1, 50),
    closeGap: number(values, "close-gap", 1.2),
    comeback: number(values, "comeback", 4),
    dominance: number(values, "dominance", 0.25),
    report: values.get("report"),
    json: values.get("json")
  };
}

function integer(values: Map<string, string>, name: string, fallback: number, min: number, max: number) {
  const value = Number(values.get(name) ?? fallback);
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;
}

function number(values: Map<string, string>, name: string, fallback: number) {
  const value = Number(values.get(name) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

function dirname(path: string) {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) || "." : ".";
}

function roundNumber(value: number) {
  return Number(value.toFixed(2));
}

function pct(value: number) {
  return roundNumber(value * 100);
}

function table(headers: string[], rows: Array<Array<string | number>>) {
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((items) => `| ${items.join(" | ")} |`)].join("\n");
}
