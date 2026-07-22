import {
  CITY_CIRCUIT_IDENTITIES,
  DEMO_RACE_INPUT,
  raceInputFromCircuit,
  simulateRace,
  trackSpeedProfileForCircuit,
  trackZonesForCircuit
} from "@cr-league/shared";

const targets = ["Prague", "Monaco", "Montreal"];

for (const city of targets) {
  const circuit = CITY_CIRCUIT_IDENTITIES.find((candidate) => candidate.city === city);
  if (!circuit) continue;
  const result = simulateRace({
    ...DEMO_RACE_INPUT,
    ...raceInputFromCircuit(circuit),
    seed: `inspect:${circuit.layoutKey}`,
    grandPrixName: `${city} Inspection GP`,
    traits: circuit.traits,
    laps: circuit.laps,
    pitLaneProgress: circuit.pitLaneProgress,
    trackZones: trackZonesForCircuit(circuit),
    speedProfile: trackSpeedProfileForCircuit(circuit)
  });
  const trace = result.replayTrace ?? [];
  const phases = new Set(trace.flatMap((point) => Object.values(point.cars ?? {}).map((car) => car.phase)));
  const sample = trace
    .filter((point) => [0, 0.25, 0.5, 0.75, 1].some((progress) => Math.abs(point.progress - progress) <= 0.005))
    .map((point) => {
      const leader = point.order[0] ?? "";
      const second = point.order[1] ?? "";
      return `${point.progress.toFixed(2)} L${point.lap} ${leader}/${second} gap=${point.gaps[second] ?? 0}s ${point.cars?.[leader]?.phase ?? "n/a"}`;
    });

  console.log(`${city}: ${trace.length} points, phases=${[...phases].sort().join(",")}`);
  console.log(sample.join("\n"));
}
