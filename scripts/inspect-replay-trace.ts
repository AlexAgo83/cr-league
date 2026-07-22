import {
  CITY_CIRCUIT_IDENTITIES,
  DEMO_RACE_INPUT,
  raceInputFromCircuit,
  simulateRace,
  trackSpeedProfileForCircuit,
  trackZonesForCircuit
} from "@cr-league/shared";
import { createQualifyingRuns } from "../apps/api/src/features/leagues/qualifying.js";

const targets = ["Prague", "Monaco", "Montreal"];
const chronoForecasts = {
  Prague: { dry: 100, light_rain: 0, heavy_rain: 0 },
  Monaco: { dry: 0, light_rain: 100, heavy_rain: 0 },
  Montreal: { dry: 0, light_rain: 0, heavy_rain: 100 }
} as const;

for (const city of targets) {
  const circuit = CITY_CIRCUIT_IDENTITIES.find((candidate) => candidate.city === city);
  if (!circuit) continue;
  const speedProfile = trackSpeedProfileForCircuit(circuit);
  const result = simulateRace({
    ...DEMO_RACE_INPUT,
    ...raceInputFromCircuit(circuit),
    seed: `inspect:${circuit.layoutKey}`,
    grandPrixName: `${city} Inspection GP`,
    traits: circuit.traits,
    laps: circuit.laps,
    pitLaneProgress: circuit.pitLaneProgress,
    trackZones: trackZonesForCircuit(circuit),
    speedProfile
  });
  const trace = result.replayTrace ?? [];
  const phases = new Set(trace.flatMap((point) => Object.values(point.cars ?? {}).map((car) => car.phase)));
  const sample = trace
    .filter((point) => [0, 0.25, 0.5, 0.75, 1].some((progress) => Math.abs(point.progress - progress) <= 0.005))
    .map((point) => {
      const leader = point.order[0] ?? "";
      const second = point.order[1] ?? "";
      const car = point.cars?.[leader];
      return `${point.progress.toFixed(2)} L${point.lap} ${leader}/${second} gap=${point.gaps[second] ?? 0}s ${car?.phase ?? "n/a"} speed=${car?.speed ?? 0}`;
    });

  console.log(`${city}: ${trace.length} points, phases=${[...phases].sort().join(",")}`);
  console.log(sample.join("\n"));

  const circuitInput = raceInputFromCircuit(circuit);
  const [chrono] = createQualifyingRuns({
    seed: `inspect:${circuit.layoutKey}:chrono`,
    teamId: "chrono-team",
    teamName: `${city} Chrono`,
    decision: { approach: "balanced", preparation: "speed" },
    primaryTrait: circuitInput.primaryTrait,
    secondaryTrait: circuitInput.secondaryTrait,
    traits: circuit.traits,
    trackLengthMeters: circuit.trackLengthMeters,
    speedProfile,
    forecast: chronoForecasts[city as keyof typeof chronoForecasts],
    laps: Math.min(3, circuit.laps)
  });
  const chronoTrace = chrono?.result.replayTrace ?? [];
  const chronoPhases = new Set(chronoTrace.flatMap((point) => Object.values(point.cars ?? {}).map((car) => car.phase)));
  const chronoSample = chronoTrace
    .filter((point) => [0, 0.25, 0.5, 0.75, 1].some((progress) => Math.abs(point.progress - progress) <= 0.005))
    .map((point) => {
      const car = point.cars?.["chrono-team"];
      return `${point.progress.toFixed(2)} L${point.lap} weather=${chrono?.result.resolvedWeather[point.segment] ?? "dry"} ${car?.phase ?? "n/a"} speed=${car?.speed ?? 0}`;
    });

  console.log(`${city} chrono: ${chronoTrace.length} points, phases=${[...chronoPhases].sort().join(",")}, final=${chrono?.time.toFixed(2)}s`);
  console.log(chronoSample.join("\n"));
}
