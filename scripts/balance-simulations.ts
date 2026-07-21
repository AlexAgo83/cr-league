import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  CARD_DEFINITIONS,
  CARD_PRICE,
  CARD_PRICES,
  createPrng,
  simulateRace,
  type BotArchetype,
  type CardId,
  type CircuitTrait,
  type RaceApproach,
  type RaceDecision,
  type RaceInput,
  type RaceParticipant,
  type TechnicalPreparation,
  type Weather
} from "../packages/shared/src/index.js";
import { CITY_CIRCUITS } from "../apps/web/src/app/circuits.js";

type Strategy = {
  id: string;
  approach: RaceApproach;
  preparation: TechnicalPreparation;
  cardId?: CardId;
};

const QUALIFYING_CARD_DELTAS: Partial<Record<CardId, number>> = {
  qualifying_focus: -0.3,
  launch_boost: -0.6,
  soft_tires: -0.4,
  adjustable_wing: -0.2,
  hard_tires: 0.2,
  economy_mode: 0.4,
  pit_relay: 0.2,
  calculated_attack: -0.1
};

type Row = {
  strategy: string;
  races: number;
  avgGrid: number;
  avgPos: number;
  winRate: number;
  podiumRate: number;
  avgPoints: number;
  avgScore: number;
  avgCredits: number;
  avgCardPrice: number;
  avgCreditMargin: number;
  nextCardRate: number;
  avgGpsPerCard: number;
  cardEventRate: number;
};

type Totals = {
  races: number;
  grid: number;
  position: number;
  wins: number;
  podiums: number;
  points: number;
  score: number;
  credits: number;
  cardPrice: number;
  creditMargin: number;
  nextCardBuys: number;
  cardEvents: number;
};

const approaches: RaceApproach[] = ["prudent", "balanced", "aggressive"];
const preparations: TechnicalPreparation[] = ["speed", "reliability", "weather"];
const cards = Object.keys(CARD_DEFINITIONS) as CardId[];
const minCardPrice = CARD_PRICE;
const args = parseArgs();
const selectedCircuits = CITY_CIRCUITS.slice(0, args.circuits);
const circuitTotals = new Map(selectedCircuits.map((circuit) => [String(circuit.layoutKey), emptyTotals()]));
const strategies = approaches.flatMap((approach) =>
  preparations.flatMap((preparation) => [
    strategy({ approach, preparation }),
    ...cards.map((cardId) => strategy({ approach, preparation, cardId }))
  ])
);

const rows = strategies.map(runStrategy).sort((left, right) => right.avgPoints - left.avgPoints);
const baseline = rows.find((row) => row.strategy === "balanced/speed/no_card");
const circuitRows = summarizeCircuits();

console.log(`Balance simulation: ${args.runs} runs x ${selectedCircuits.length} circuits x ${strategies.length} strategies`);
console.log("");
printTable("Top strategies", rows.slice(0, args.limit));
console.log("");
printTable("Bottom strategies", rows.slice(-args.limit).reverse());
console.log("");
printTable("Card summary", summarizeCards(rows));
console.log("");
printTable("Economy summary", summarizeCards(rows).sort((left, right) => right.avgCreditMargin - left.avgCreditMargin));
console.log("");
printTable("Circuit summary", circuitRows);

if (baseline) {
  const outliers = rows.filter((row) => Math.abs(row.avgPoints - baseline.avgPoints) >= args.outlier);
  console.log("");
  printTable(`Outliers vs ${baseline.strategy} (+/- ${args.outlier} pts)`, outliers);
}

if (args.json) {
  mkdirSync(dirname(args.json), { recursive: true });
  writeFileSync(args.json, JSON.stringify({ args, rows, circuitRows }, null, 2));
  console.log(`\nWrote ${args.json}`);
}

function runStrategy(candidate: Strategy): Row {
  const totals = emptyTotals();

  for (const circuit of selectedCircuits) {
    for (let run = 0; run < args.runs; run += 1) {
      addRun(totals, candidate, circuit, run);
    }
  }

  return rowFromTotals(candidate.id, totals);
}

function summarizeCircuits(): Row[] {
  return [...circuitTotals.entries()].map(([name, totals]) => rowFromTotals(name, totals)).sort((left, right) => left.avgPoints - right.avgPoints);
}

function emptyTotals(): Totals {
  return {
    races: 0,
    grid: 0,
    position: 0,
    wins: 0,
    podiums: 0,
    points: 0,
    score: 0,
    credits: 0,
    cardPrice: 0,
    creditMargin: 0,
    nextCardBuys: 0,
    cardEvents: 0
  };
}

function addRun(totals: Totals, candidate: Strategy, circuit: (typeof selectedCircuits)[number], run: number) {
  const seed = `${candidate.id}-${circuit.layoutKey}-${run}`;
  const decision = decisionFor(candidate);
  const participants = buildParticipants(decision, gridRank(seed, decision, circuit.traits, circuit.likelyWeather));
  const result = simulateRace({
    seed,
    grandPrixName: String(circuit.layoutKey),
    primaryTrait: primaryTrait(circuit.traits),
    secondaryTrait: secondaryTrait(circuit.traits),
    traits: circuit.traits,
    forecast: forecastFor(circuit.likelyWeather),
    participants
  });
  const entry = result.classification.find((item) => item.teamId === "candidate");
  if (!entry) throw new Error("Candidate missing from classification.");
  const grid = participants.find((participant) => participant.teamId === "candidate")?.standingsRank ?? 0;
  const cardTriggered = Boolean(candidate.cardId && result.events.some((event) => event.teamId === "candidate" && event.cardId === candidate.cardId));
  const cardPrice = candidate.cardId ? CARD_PRICES[candidate.cardId] : 0;

  const circuitTotal = circuitTotals.get(String(circuit.layoutKey));
  addResult(totals, entry.position, entry.points, entry.score, entry.credits, cardPrice, grid, cardTriggered);
  if (circuitTotal) addResult(circuitTotal, entry.position, entry.points, entry.score, entry.credits, cardPrice, grid, cardTriggered);
}

function addResult(totals: Totals, position: number, points: number, score: number, credits: number, cardPrice: number, grid: number, cardTriggered: boolean) {
  totals.races += 1;
  totals.grid += grid;
  totals.position += position;
  totals.wins += position === 1 ? 1 : 0;
  totals.podiums += position <= 3 ? 1 : 0;
  totals.points += points;
  totals.score += score;
  totals.credits += credits;
  totals.cardPrice += cardPrice;
  totals.creditMargin += credits - cardPrice;
  totals.nextCardBuys += credits >= minCardPrice ? 1 : 0;
  totals.cardEvents += cardTriggered ? 1 : 0;
}

function rowFromTotals(strategy: string, totals: Totals): Row {
  return {
    strategy,
    races: totals.races,
    avgGrid: round(totals.grid / totals.races),
    avgPos: round(totals.position / totals.races),
    winRate: pct(totals.wins / totals.races),
    podiumRate: pct(totals.podiums / totals.races),
    avgPoints: round(totals.points / totals.races),
    avgScore: round(totals.score / totals.races),
    avgCredits: round(totals.credits / totals.races),
    avgCardPrice: round(totals.cardPrice / totals.races),
    avgCreditMargin: round(totals.creditMargin / totals.races),
    nextCardRate: pct(totals.nextCardBuys / totals.races),
    avgGpsPerCard: round(minCardPrice / (totals.credits / totals.races)),
    cardEventRate: pct(totals.cardEvents / totals.races)
  };
}

function buildParticipants(candidateDecision: RaceDecision, candidateGrid: number): RaceParticipant[] {
  const bots = botTemplates().map((bot, index) => ({
    ...bot,
    teamId: `bot_${index + 1}`,
    standingsRank: index + 1 >= candidateGrid ? index + 2 : index + 1
  }));

  return [
    {
      teamId: "candidate",
      teamName: "Candidate",
      kind: "human" as const,
      standingsRank: candidateGrid,
      decision: candidateDecision
    },
    ...bots
  ].sort((left, right) => left.standingsRank - right.standingsRank);
}

function botTemplates(): RaceParticipant[] {
  const botPlans: Array<{ decision: RaceDecision; botArchetype: BotArchetype }> = [
    { botArchetype: "sprinter", decision: { approach: "aggressive", preparation: "speed", cardId: "adjustable_wing" } },
    { botArchetype: "sprinter", decision: { approach: "aggressive", preparation: "speed", cardId: "launch_boost" } },
    { botArchetype: "prudent", decision: { approach: "balanced", preparation: "speed", cardId: "calculated_attack" } },
    { botArchetype: "rain_specialist", decision: { approach: "prudent", preparation: "weather", cardId: "rain_mapping" } },
    { botArchetype: "mechanic", decision: { approach: "prudent", preparation: "reliability", cardId: "hard_tires" } },
    { botArchetype: "mechanic", decision: { approach: "balanced", preparation: "reliability", cardId: "pit_relay" } },
    { botArchetype: "gambler", decision: { approach: "aggressive", preparation: "weather", cardId: "soft_tires" } }
  ];

  return Array.from({ length: 7 }, (_, index) => {
    const plan = botPlans[index % botPlans.length]!;
    return {
      teamId: `bot_${index + 1}`,
      teamName: `Bot ${index + 1}`,
      kind: "bot",
      standingsRank: index + 1,
      botArchetype: plan.botArchetype,
      decision: plan.decision
    };
  });
}

function gridRank(seed: string, decision: RaceDecision, traits: RaceInput["traits"], likelyWeather: Weather) {
  const prng = createPrng(`${seed}-qualifying`);
  const time = qualifyingTime(decision, traits, likelyWeather, prng.next);
  const botTimes = botTemplates().map((bot, index) => qualifyingTime(bot.decision, traits, likelyWeather, createPrng(`${seed}-bot-${index}`).next));
  return 1 + botTimes.filter((botTime) => botTime < time).length;
}

function qualifyingTime(decision: RaceDecision, traits: RaceInput["traits"], weather: Weather, next: () => number) {
  const profile = traits ?? { grip: 62, overtaking: 62, energy: 62 };
  const traitBonus = (profile.grip + profile.overtaking + profile.energy - 180) / 18;
  const weatherPenalty = weather === "heavy_rain" ? 2.8 : weather === "light_rain" ? 1.2 : 0;
  const approachDelta = decision.approach === "aggressive" ? -0.3 : decision.approach === "prudent" ? 0.2 : 0;
  const prepDelta = decision.preparation === "speed" ? -0.8 : decision.preparation === "weather" && weather !== "dry" ? -0.9 : decision.preparation === "reliability" ? 0.1 : 0;
  const rainCardDelta = decision.cardId === "rain_grip" && weather !== "dry" ? -0.7 : decision.cardId === "rain_mapping" && weather !== "dry" ? -0.4 : 0;
  const cardDelta = rainCardDelta || (decision.cardId ? QUALIFYING_CARD_DELTAS[decision.cardId] ?? 0 : 0);
  return Math.max(72, 91 - traitBonus + weatherPenalty + approachDelta + prepDelta + cardDelta + (next() - 0.5) * 2.4);
}

function strategy(input: Omit<Strategy, "id">): Strategy {
  return {
    ...input,
    id: `${input.approach}/${input.preparation}/${input.cardId ?? "no_card"}`
  };
}

function decisionFor(input: Strategy): RaceDecision {
  return {
    approach: input.approach,
    preparation: input.preparation,
    cardId: input.cardId,
    rivalTeamId: input.cardId === "urban_draft" ? "bot_1" : undefined
  };
}

function forecastFor(weather: Weather): RaceInput["forecast"] {
  if (weather === "heavy_rain") return { dry: 20, light_rain: 30, heavy_rain: 50 };
  if (weather === "light_rain") return { dry: 35, light_rain: 50, heavy_rain: 15 };
  return { dry: 75, light_rain: 20, heavy_rain: 5 };
}

function primaryTrait(traits: NonNullable<RaceInput["traits"]>): CircuitTrait {
  if (traits.overtaking >= traits.grip && traits.overtaking >= traits.energy) return "urban";
  if (traits.grip >= traits.energy) return "technical";
  return "fast";
}

function secondaryTrait(traits: NonNullable<RaceInput["traits"]>): CircuitTrait {
  if (traits.energy <= 58) return "high_wear";
  if (traits.grip >= 68) return "weather_sensitive";
  return "fast";
}

function summarizeCards(rows: Row[]): Row[] {
  return ["no_card", ...cards].map((cardId) => averageRows(cardId, rows.filter((row) => row.strategy.endsWith(`/${cardId}`)))).sort((left, right) => right.avgPoints - left.avgPoints);
}

function averageRows(strategyName: string, rows: Row[]): Row {
  const races = rows.reduce((sum, row) => sum + row.races, 0) || 1;
  return {
    strategy: strategyName,
    races,
    avgGrid: weighted(rows, "avgGrid", races),
    avgPos: weighted(rows, "avgPos", races),
    winRate: weighted(rows, "winRate", races),
    podiumRate: weighted(rows, "podiumRate", races),
    avgPoints: weighted(rows, "avgPoints", races),
    avgScore: weighted(rows, "avgScore", races),
    avgCredits: weighted(rows, "avgCredits", races),
    avgCardPrice: weighted(rows, "avgCardPrice", races),
    avgCreditMargin: weighted(rows, "avgCreditMargin", races),
    nextCardRate: weighted(rows, "nextCardRate", races),
    avgGpsPerCard: weighted(rows, "avgGpsPerCard", races),
    cardEventRate: weighted(rows, "cardEventRate", races)
  };
}

function weighted(rows: Row[], key: keyof Omit<Row, "strategy" | "races">, races: number) {
  return round(rows.reduce((sum, row) => sum + row[key] * row.races, 0) / races);
}

function printTable(title: string, data: Row[]) {
  console.log(title);
  console.table(
    data.map((row) => ({
      strategy: row.strategy,
      races: row.races,
      grid: row.avgGrid,
      pos: row.avgPos,
      "win%": row.winRate,
      "podium%": row.podiumRate,
      pts: row.avgPoints,
      score: row.avgScore,
      credits: row.avgCredits,
      price: row.avgCardPrice,
      margin: row.avgCreditMargin,
      "buy%": row.nextCardRate,
      "gp/card": row.avgGpsPerCard,
      "card%": row.cardEventRate
    }))
  );
}

function parseArgs() {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index]!;
    if (!arg.startsWith("--")) continue;
    values.set(arg.slice(2), process.argv[index + 1]?.startsWith("--") ? "true" : (process.argv[++index] ?? "true"));
  }

  return {
    runs: Number(values.get("runs") ?? 100),
    circuits: Math.min(CITY_CIRCUITS.length, Number(values.get("circuits") ?? CITY_CIRCUITS.length)),
    limit: Number(values.get("limit") ?? 12),
    outlier: Number(values.get("outlier") ?? 2),
    json: values.get("json")
  };
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function pct(value: number) {
  return round(value * 100);
}
