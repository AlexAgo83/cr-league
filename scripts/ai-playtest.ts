import { mkdir, writeFile } from "node:fs/promises";
import {
  CARD_PRICES,
  RACE_APPROACHES,
  circuitIdentityForRound,
  circuitSeasonSeed,
  raceInputFromCircuit,
  simulateRace,
  trackZonesForCircuit,
  type CardId,
  type CityCircuitIdentity,
  type PitStrategy,
  type RaceParticipant,
  type RaceResult
} from "../packages/shared/src/index.js";
import { frustrationScore, funScore, nextPlaytestCardPurchase, playtestCardIds, playtestDecisionForAgent, playtestProfiles, type PlaytestProfile } from "./playtestBrain.js";

type Agent = {
  id: string;
  name: string;
  profile: PlaytestProfile;
  nextBuyIndex: number;
  points: number;
  credits: number;
  cards: CardId[];
  starts: number;
  wins: number;
  podiums: number;
  positionSum: number;
  pointsSum: number;
  creditsSum: number;
  creditsSpent: number;
  positionDeltaSum: number;
  positionCounts: number[];
  fun: number;
  frustration: number;
};

type Counter = {
  starts: number;
  wins: number;
  podiums: number;
  positionSum: number;
  points: number;
  credits: number;
  creditsSpent: number;
  positionDeltaSum: number;
  positionCounts: number[];
  fun: number;
  frustration: number;
};

type CardRow = {
  card: CardId;
  played: number;
  triggered: number;
  bought: number;
  avgImpact: number;
  triggerRate: number;
};

type ZoneRow = {
  zone: string;
  events: number;
  major: number;
};

const cardIds = playtestCardIds;
const profiles = playtestProfiles;

const args = parseArgs();
const agents = Array.from({ length: args.agents }, (_, index) => ({
  id: `agent_${index + 1}`,
  name: `AI ${String(index + 1).padStart(2, "0")}`,
  profile: profiles[index % profiles.length]!,
  nextBuyIndex: 0,
  points: 0,
  credits: 120,
  cards: [cardIds[index % cardIds.length]!] as CardId[],
  starts: 0,
  wins: 0,
  podiums: 0,
  positionSum: 0,
  pointsSum: 0,
  creditsSum: 0,
  creditsSpent: 0,
  positionDeltaSum: 0,
  positionCounts: [],
  fun: 0,
  frustration: 0
}));
const profileStats = new Map(profiles.map((profile) => [profile.name, emptyCounter()]));
const approachStats = new Map(RACE_APPROACHES.map((approach) => [approach, emptyCounter()]));
const pitStats = new Map<PitStrategy, Counter>([
  ["heavy_pack", emptyCounter()],
  ["standard", emptyCounter()],
  ["mini_pack", emptyCounter()]
]);
const cardStats = new Map(cardIds.map((cardId) => [cardId, { played: 0, triggered: 0, bought: 0, impact: 0 }]));
const zoneStats = new Map<string, { events: number; major: number }>();
let missingZoneEvents = 0;
const incidents: string[] = [];
const champions: string[] = [];

for (let season = 1; season <= args.seasons; season += 1) {
  agents.forEach((agent) => {
    agent.points = 0;
  });

  for (let round = 1; round <= args.rounds; round += 1) {
    const circuit = circuitIdentityForRound(round, circuitSeasonSeed("ai-playtest", season));
    for (const group of chunks(agents, args.leagueSize)) {
      runRace(season, round, circuit, group);
    }
    agents.forEach(buyNextCard);
  }

  champions.push([...agents].sort((left, right) => right.points - left.points || right.credits - left.credits)[0]?.name ?? "Unknown");
}

const reportPath = args.report ?? `reports/playtest/${new Date().toISOString().slice(0, 10)}-ai-playtest.md`;
const profileRows = rows(profileStats);
const approachRows = rows(approachStats);
const cardRows: CardRow[] = [...cardStats.entries()].map(([card, stats]) => {
  const triggered = Math.min(stats.triggered, stats.played);
  return { card, played: stats.played, triggered, bought: stats.bought, avgImpact: round(stats.impact / Math.max(1, stats.triggered)), triggerRate: pct(triggered / Math.max(1, stats.played)) };
});
const zoneRows: ZoneRow[] = [...zoneStats.entries()].map(([zone, stats]) => ({ zone, ...stats })).sort((left, right) => right.events - left.events || left.zone.localeCompare(right.zone));
const alertRows = alerts(profileRows, cardRows);
const payload = {
  args,
  generatedAt: new Date().toISOString(),
  champions,
  profiles: profileRows,
  approaches: approachRows,
  pits: rows(pitStats),
  cards: cardRows,
  zones: zoneRows,
  missingZoneEvents,
  agents: agents.map((agent) => row(agent.name, counterFromAgent(agent))),
  alerts: alertRows
};

await writeReport(reportPath);
if (args.json) {
  await mkdir(dirname(args.json), { recursive: true });
  await writeFile(args.json, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

console.log(`AI playtest: ${args.agents} agents x ${args.seasons} seasons x ${args.rounds} GP`);
console.log(`Report: ${reportPath}`);
if (args.json) console.log(`JSON: ${args.json}`);

function runRace(season: number, round: number, circuit: CityCircuitIdentity, group: Agent[]) {
  const raceInput = raceInputFromCircuit(circuit);
  const participants = group
    .slice()
    .sort((left, right) => right.points - left.points || left.name.localeCompare(right.name))
    .map<RaceParticipant>((agent, index, ranked) => ({
      teamId: agent.id,
      teamName: agent.name,
      kind: "human",
      standingsRank: index + 1,
      decision: playtestDecisionForAgent(agent, circuit, ranked, (cardId) => cardStats.get(cardId)!.played)
    }));
  const result = simulateRace({
    seed: `ai-playtest-s${season}-r${round}-${group[0]?.id}`,
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

  for (const entry of result.classification) {
    const agent = group.find((candidate) => candidate.id === entry.teamId);
    const participant = participants.find((candidate) => candidate.teamId === entry.teamId);
    if (!agent || !participant) continue;
    const raceFun = funScore(entry.position, result, agent.id);
    const raceFrustration = frustrationScore(entry.position, result, agent.id);
    agent.starts += 1;
    agent.wins += entry.position === 1 ? 1 : 0;
    agent.podiums += entry.position <= 3 ? 1 : 0;
    agent.positionSum += entry.position;
    agent.points += entry.points;
    agent.pointsSum += entry.points;
    agent.credits += entry.credits;
    agent.creditsSum += entry.credits;
    agent.positionDeltaSum += entry.positionChange;
    agent.positionCounts[entry.position] = (agent.positionCounts[entry.position] ?? 0) + 1;
    agent.fun += raceFun;
    agent.frustration += raceFrustration;
    addCounter(profileStats.get(agent.profile.name)!, entry, raceFun, raceFrustration);
    addCounter(approachStats.get(participant.decision.approach)!, entry, raceFun, raceFrustration);
    addCounter(pitStats.get(participant.decision.pitStrategy ?? "standard")!, entry, raceFun, raceFrustration);
  }

  for (const participant of participants) {
    if (participant.decision.cardId) cardStats.get(participant.decision.cardId)!.played += 1;
  }
  for (const event of result.events) {
    if (event.cardId) {
      const stats = cardStats.get(event.cardId)!;
      stats.triggered += 1;
      stats.impact += event.positionDelta;
    }
    if (event.zoneLabel) {
      const stats = zoneStats.get(event.zoneLabel) ?? { events: 0, major: 0 };
      stats.events += 1;
      stats.major += event.severity === "major" ? 1 : 0;
      zoneStats.set(event.zoneLabel, stats);
    } else {
      missingZoneEvents += 1;
    }
  }
  for (const consumed of result.consumedCards) {
    const agent = group.find((candidate) => candidate.id === consumed.teamId);
    if (agent) agent.cards = removeOne(agent.cards, consumed.cardId);
  }
  const traceErrors = result.replayTrace && result.replayTrace.length < 2 ? [`${circuit.city} round ${round}: replay trace too short`] : [];
  incidents.push(...traceErrors);
}

function buyNextCard(agent: Agent) {
  const purchase = nextPlaytestCardPurchase(agent, (cardId) => cardStats.get(cardId)!.bought);
  if (!purchase) return;
  const cardId = purchase.cardId;
  agent.nextBuyIndex = purchase.nextBuyIndex;
  spendCredits(agent, CARD_PRICES[cardId]);
  agent.cards.push(cardId);
  cardStats.get(cardId)!.bought += 1;
}

function spendCredits(agent: Agent, credits: number) {
  agent.credits -= credits;
  agent.creditsSpent += credits;
  profileStats.get(agent.profile.name)!.creditsSpent += credits;
}

function alerts(profileRows: ReturnType<typeof rows>, cardRows: CardRow[]) {
  const raceEventCards = new Set<CardId>(cardIds.filter((cardId) => cardId !== "qualifying_focus"));
  const avgWin = profileRows.reduce((sum, item) => sum + item.winRate, 0) / Math.max(1, profileRows.length);
  const avgPlayed = cardRows.reduce((sum, item) => sum + item.played, 0) / Math.max(1, cardRows.length);
  const missingZoneRate = missingZoneEvents / Math.max(1, zoneRows.reduce((sum, row) => sum + row.events, 0) + missingZoneEvents);
  const found = profileRows.filter((item) => item.winRate >= avgWin + 15).map((item) => `dominant profile: ${item.name} win ${item.winRate}% vs avg ${round(avgWin)}%`);
  found.push(...profileRows.filter((item) => item.winRate <= avgWin - 10 || item.fun < 5).map((item) => `weak profile: ${item.name} win ${item.winRate}%, fun ${item.fun}`));
  found.push(...cardRows.filter((item) => item.played >= Math.max(30, avgPlayed * 3)).map((item) => `overplayed card: ${item.card} played ${item.played} times`));
  found.push(...cardRows.filter((item) => raceEventCards.has(item.card) && item.played >= 5 && item.triggered === 0).map((item) => `dead card trigger: ${item.card} played ${item.played} times, triggered 0`));
  found.push(...cardRows.filter((item) => item.triggered >= 5 && Math.abs(item.avgImpact) >= 12).map((item) => `swingy card: ${item.card} avg impact ${item.avgImpact}`));
  found.push(...cardRows.filter((item) => item.played === 0).map((item) => `never played: ${item.card}`));
  if (missingZoneRate > 0.05) found.push(`missing zone coverage: ${pct(missingZoneRate)}% of events`);
  if (incidents.length) found.push(...incidents);
  return found.length ? found : ["none"];
}

function writeReport(path: string) {
  const profileRows = payload.profiles.sort((left, right) => right.points - left.points);
  const cardRows = payload.cards.sort((left, right) => right.played - left.played);
  return mkdir(dirname(path), { recursive: true }).then(() =>
    writeFile(
      path,
      [
        "# AI Playtest Report",
        "",
        `- Date: ${payload.generatedAt}`,
        `- Agents: ${args.agents}`,
        `- Seasons: ${args.seasons}`,
        `- Grand Prix per season: ${args.rounds}`,
        `- League size: ${args.leagueSize}`,
        "",
        "## Verdict",
        ...payload.alerts.map((alert) => `- ${alert === "none" ? "PASS: no automatic balance or replay alert." : `CHECK: ${alert}`}`),
        "",
        "## Strategy Profiles",
        table(["Profile", "Starts", "Win %", "Podium %", "Avg pos", "Avg +/-", "Pos dist", "Pts/race", "Credits/race", "Net credits", "Fun", "Frustration"], profileRows.map((item) => [item.name, item.starts, item.winRate, item.podiumRate, item.avgPosition, item.avgDelta, item.positionDistribution, item.points, item.credits, item.netCredits, item.fun, item.frustration])),
        "",
        "## Cards",
        table(["Card", "Bought", "Played", "Triggered", "Trigger %", "Avg impact"], cardRows.map((item) => [item.card, item.bought, item.played, item.triggered, item.triggerRate, item.avgImpact])),
        "",
        "## Track Zones",
        table(["Zone", "Events", "Major"], payload.zones.map((item) => [item.zone, item.events, item.major])),
        `Missing zone events: ${payload.missingZoneEvents}`,
        "",
        "## Approach Mix",
        table(["Approach", "Starts", "Win %", "Podium %", "Avg pos", "Pts/race"], payload.approaches.map((item) => [item.name, item.starts, item.winRate, item.podiumRate, item.avgPosition, item.points])),
        "",
        "## Pit Strategy Mix",
        table(["Pit strategy", "Starts", "Win %", "Podium %", "Avg pos", "Pts/race"], payload.pits.map((item) => [item.name, item.starts, item.winRate, item.podiumRate, item.avgPosition, item.points])),
        "",
        "## Season Champions",
        ...champions.map((name, index) => `- Season ${index + 1}: ${name}`),
        "",
        "## Notes",
        "- Fun, frustration, average delta, card impact, and zone usage are deterministic scores from finish position plus concrete race events.",
        "- This is a mechanics runner; use browser QA for layout, animation, and copy."
      ].join("\n") + "\n",
      "utf8"
    )
  );
}

function emptyCounter(): Counter {
  return { starts: 0, wins: 0, podiums: 0, positionSum: 0, points: 0, credits: 0, creditsSpent: 0, positionDeltaSum: 0, positionCounts: [], fun: 0, frustration: 0 };
}

function counterFromAgent(agent: Agent): Counter {
  return {
    starts: agent.starts,
    wins: agent.wins,
    podiums: agent.podiums,
    positionSum: agent.positionSum,
    points: agent.pointsSum,
    credits: agent.creditsSum,
    creditsSpent: agent.creditsSpent,
    positionDeltaSum: agent.positionDeltaSum,
    positionCounts: agent.positionCounts,
    fun: agent.fun,
    frustration: agent.frustration
  };
}

function addCounter(counter: Counter, entry: RaceResult["classification"][number], fun: number, frustration: number) {
  counter.starts += 1;
  counter.wins += entry.position === 1 ? 1 : 0;
  counter.podiums += entry.position <= 3 ? 1 : 0;
  counter.positionSum += entry.position;
  counter.points += entry.points;
  counter.credits += entry.credits;
  counter.positionDeltaSum += entry.positionChange;
  counter.positionCounts[entry.position] = (counter.positionCounts[entry.position] ?? 0) + 1;
  counter.fun += fun;
  counter.frustration += frustration;
}

function rows(counters: Map<string, Counter>) {
  return [...counters.entries()].map(([name, counter]) => row(name, counter));
}

function row(name: string, counter: Counter) {
  return {
    name,
    starts: counter.starts,
    winRate: pct(counter.wins / Math.max(1, counter.starts)),
    podiumRate: pct(counter.podiums / Math.max(1, counter.starts)),
    avgPosition: round(counter.positionSum / Math.max(1, counter.starts)),
    avgDelta: round(counter.positionDeltaSum / Math.max(1, counter.starts)),
    positionDistribution: positionDistribution(counter.positionCounts),
    points: round(counter.points / Math.max(1, counter.starts)),
    credits: round(counter.credits / Math.max(1, counter.starts)),
    netCredits: round((counter.credits - counter.creditsSpent) / Math.max(1, counter.starts)),
    fun: round(counter.fun / Math.max(1, counter.starts)),
    frustration: round(counter.frustration / Math.max(1, counter.starts))
  };
}

function positionDistribution(counts: number[]) {
  return counts
    .map((count, position) => count ? `P${position}:${count}` : "")
    .filter(Boolean)
    .join(" ");
}

function table(headers: string[], rows: Array<Array<string | number>>) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((items) => `| ${items.join(" | ")} |`)
  ].join("\n");
}

function chunks<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));
}

function removeOne(cards: CardId[], cardId: CardId) {
  const next = [...cards];
  const index = next.indexOf(cardId);
  if (index >= 0) next.splice(index, 1);
  return next;
}

function parseArgs() {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index]!;
    if (!arg.startsWith("--")) continue;
    values.set(arg.slice(2), process.argv[index + 1]?.startsWith("--") ? "true" : (process.argv[++index] ?? "true"));
  }
  return {
    agents: integerArg(values, "agents", 50, 2, 200),
    seasons: integerArg(values, "seasons", 3, 1, 20),
    rounds: integerArg(values, "rounds", 6, 1, 24),
    leagueSize: integerArg(values, "league-size", 8, 2, 16),
    report: values.get("report"),
    json: values.get("json")
  };
}

function integerArg(values: Map<string, string>, name: string, fallback: number, min: number, max: number) {
  const value = Number(values.get(name) ?? fallback);
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;
}

function dirname(path: string) {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) || "." : ".";
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function pct(value: number) {
  return round(value * 100);
}
