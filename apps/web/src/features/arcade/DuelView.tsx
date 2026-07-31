import { useEffect, useMemo, useRef, useState } from "react";
import { useT, type TranslationKey } from "../../i18n/index.js";
import { SetupBackButton } from "../../app/SetupViews.js";
import { safeStorage } from "../../app/appStorage.js";
import { ONBOARDING_HELP_KEYS, OnboardingHelpModal } from "../../app/OnboardingShell.js";
import { randomTeamName } from "../../app/nameSeeds.js";
import { DEFAULT_DUEL_LIVERY, loadDuelLivery, loadDuelRegion, saveDuelLivery, saveDuelRegion, type DuelLivery } from "./arcadeStorage.js";
import { type WheelRegion } from "./destinyWheel.js";
import { Modal } from "../Modal.js";
import { CAR_ASSETS } from "../carAssets.js";
import { CITY_CIRCUITS, circuitsInRegion, regionsWithCircuits, withRoute, type CityCircuit } from "../../app/circuits.js";
import { useCircuitRoutesReady } from "../../app/circuitRoutes/index.js";
import { CircuitMap, type MapCar } from "../CircuitMap.js";
import { BoardIcon, CountryBadge, VisualIcon } from "../VisualIcon.js";
import { TeamCar } from "../TeamCar.js";
import {
  attackCost,
  createDuel,
  duelOutcome,
  duelGapDuring,
  duelOver,
  DUEL_CALLS,
  DUEL_MAX_ENGAGEMENT,
  playDuelRound,
  type Duel,
  type DuelCall,
  type DuelRound
} from "./duel.js";
import type { BotArchetype } from "@cr-league/shared";

/* The name comes from the same generator every other team in the game is named by, drawn per duel:
   six fixed drivers meant the third duel was against someone you had already beaten twice. */
const RIVALS: Array<{ archetype: BotArchetype; livery: { primary: string; secondary: string } }> = [
  { archetype: "sprinter", livery: { primary: "#ff6a1f", secondary: "#ffd166" } },
  { archetype: "gambler", livery: { primary: "#8b5cf6", secondary: "#22d3ee" } },
  { archetype: "prudent", livery: { primary: "#0ea5e9", secondary: "#f8fafc" } },
  { archetype: "mechanic", livery: { primary: "#16c784", secondary: "#38bdf8" } },
  { archetype: "rain_specialist", livery: { primary: "#60a5fa", secondary: "#1e3a8a" } },
  { archetype: "opportunist", livery: { primary: "#ef4444", secondary: "#facc15" } }
];

/** A lap of animation per call: long enough to watch it happen, short enough to keep asking. */
const LAP_MS = 4200;
/** A second of gap is this much of a lap on screen — enough to read, not enough to lap anyone. */
const GAP_TO_LAP = 0.045;
const PLAYER_ID = "you";
const RIVAL_ID = "rival";

/* Icons the board already ships: the boost for a charge, the balanced marker for holding station,
   the defensive order for shutting the door. */
const CALL_ICONS = { attack: "boost", manage: "balanced-approach", cover: "defensive-order" } as const;

/**
 * One rival, eight laps, three calls a lap. The whole game is guessing which call he is about to make,
 * which is why his tank and his last calls are on screen: they are the tells.
 */
export function DuelView({ onBack, onRacingChange }: { onBack: () => void; onRacingChange?: (racing: boolean) => void }) {
  const tt = useT();
  const [setup, setSetup] = useState(() => drawSetup(`duel-${Date.now()}`, loadDuelRegion()));
  /**
   * Re-taken whenever the route cache fills, never frozen. Opening /arcade/duel cold mounts this
   * view before the route chunk has landed, and a snapshot taken then is an empty polyline that
   * stays empty: the map drew nothing for the whole duel.
   */
  const routesReady = useCircuitRoutesReady();
  const hydrated = useMemo(() => (routesReady ? withRoute(setup.circuit) : setup.circuit), [routesReady, setup.circuit]);
  const [duel, setDuel] = useState<Duel | null>(null);
  // The lap being driven: the board waits on it, and the cars are placed from it every frame.
  const [lap, setLap] = useState<{ round: DuelRound; gapBefore: number; next: Duel } | null>(null);
  const [recapDismissed, setRecapDismissed] = useState(false);
  const [livery, setLivery] = useState<DuelLivery>(() => loadDuelLivery());
  const [region, setRegion] = useState<WheelRegion>(() => loadDuelRegion());
  const [pickingCar, setPickingCar] = useState(false);
  // The same arrival help every other screen gets, opened when the duel does. Not on the briefing:
  // that screen is about who you drew, and the rules only matter once you are on the grid.
  const [helpOpen, setHelpOpen] = useState(false);
  const carProgressRef = useRef<Record<string, number>>({ [PLAYER_ID]: 0, [RIVAL_ID]: 0 });
  const rival = { ...(RIVALS.find((candidate) => candidate.archetype === setup.rival) ?? RIVALS[0]!), name: setup.rivalName };

  // The briefing keeps its panel and its ambient circuit; the board takes the screen.
  useEffect(() => {
    onRacingChange?.(Boolean(duel));
  }, [duel, onRacingChange]);

  useEffect(() => {
    if (!lap) return;
    const startedAt = performance.now();
    const lapIndex = lap.round.lap - 1;
    let frame = 0;
    const drive = (now: number) => {
      const time = Math.min(1, (now - startedAt) / LAP_MS);
      const gap = duelGapDuring(lap.round, lap.gapBefore, time);
      // The player runs the lap; the rival sits at the gap behind or ahead of him.
      carProgressRef.current = { [PLAYER_ID]: lapIndex + time, [RIVAL_ID]: lapIndex + time - gap * GAP_TO_LAP };
      if (time < 1) {
        frame = requestAnimationFrame(drive);
        return;
      }
      setDuel(lap.next);
      setLap(null);
    };
    frame = requestAnimationFrame(drive);
    return () => cancelAnimationFrame(frame);
  }, [lap]);

  function call(playerCall: DuelCall) {
    if (!duel || lap) return;
    const next = playDuelRound(duel, playerCall);
    const round = next.rounds.at(-1);
    if (round) setLap({ round, gapBefore: duel.gap, next });
  }

  function start() {
    setRecapDismissed(false);
    setHelpOpen(safeStorage.get(ONBOARDING_HELP_KEYS.duel) !== "1");
    carProgressRef.current = { [PLAYER_ID]: 0, [RIVAL_ID]: 0 };
    setDuel(createDuel(setup.seed, setup.rival, setup.circuit.likelyWeather));
  }

  function again() {
    const next = drawSetup(`duel-${Date.now()}`, region);
    carProgressRef.current = { [PLAYER_ID]: 0, [RIVAL_ID]: 0 };
    setSetup(next);
    setLap(null);
    setDuel(null);
    setRecapDismissed(false);
  }

  const help = helpOpen ? (
    <OnboardingHelpModal
      topic="duel"
      onClose={(dismiss) => {
        if (dismiss) safeStorage.set(ONBOARDING_HELP_KEYS.duel, "1");
        setHelpOpen(false);
      }}
    />
  ) : null;

  function updateLivery(change: Partial<DuelLivery>) {
    const next = { ...livery, ...change };
    setLivery(next);
    saveDuelLivery(next);
  }

  if (!duel) {
    return (
      <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="duel-title">
        {pickingCar ? (
          <Modal label={tt("duel_pick_car")} closeLabel={tt("action_close")} showCloseButton onClose={() => setPickingCar(false)}>
            <h3>{tt("duel_pick_car")}</h3>
            <div className="wheel-car-grid">
              {CAR_ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className={asset.id === (livery.carAssetId ?? DEFAULT_DUEL_LIVERY.carAssetId) ? "wheel-car-option selected" : "wheel-car-option"}
                  aria-pressed={asset.id === livery.carAssetId}
                  aria-label={asset.name}
                  onClick={() => {
                    updateLivery({ carAssetId: asset.id });
                    setPickingCar(false);
                  }}
                >
                  <TeamCar className="wheel-car-option-car" livery={{ ...livery, carAssetId: asset.id }} />
                </button>
              ))}
            </div>
          </Modal>
        ) : null}
        <div className="panel setup-main-panel setup-hero-panel arcade-hero-panel">
          <SetupBackButton onBack={onBack} />
          <span className="section-kicker">{tt("duel_kicker")}</span>
          <h1 id="duel-title">{tt("duel_title")}</h1>
          <p className="status">{tt("duel_intro")}</p>
        </div>
        <div className="panel setup-main-panel setup-form-panel setup-choice-panel">
          {/* Both cards, so the screen says who is racing rather than only who is being raced. */}
          <div className="duel-rival-card duel-player-card">
            <button type="button" className="wheel-participant-car-button" aria-label={tt("duel_pick_car")} onClick={() => setPickingCar(true)}>
              <TeamCar className="duel-rival-car" livery={livery} />
            </button>
            <div>
              <strong>{tt("duel_you")}</strong>
              <small>{tt("duel_you_hint")}</small>
            </div>
            <span className="wheel-participant-colours">
              {(["primary", "secondary"] as const).map((slot) => (
                <input
                  key={slot}
                  type="color"
                  aria-label={tt(slot === "primary" ? "garage_livery_primary" : "garage_livery_secondary")}
                  value={livery[slot]}
                  onChange={(event) => updateLivery({ [slot]: event.target.value })}
                />
              ))}
            </span>
          </div>
          <div className="duel-rival-card">
            <TeamCar className="duel-rival-car" livery={rival.livery} />
            <div>
              <strong>{rival.name}</strong>
              <small>{tt(`duel_tell_${rival.archetype}` as TranslationKey)}</small>
            </div>
          </div>
          <dl className="duel-briefing">
            <div>
              <dt>{tt("duel_circuit_label")}</dt>
              <dd>
                <CountryBadge country={setup.circuit.country} /> {setup.circuit.city}
              </dd>
            </div>
            <div>
              <dt>{tt("duel_weather_label")}</dt>
              <dd>
                <VisualIcon name={setup.circuit.likelyWeather} /> {tt(`weather_${setup.circuit.likelyWeather}` as TranslationKey)}
              </dd>
            </div>
          </dl>
          <label className="wheel-region">
            <span>{tt("wheel_region_label")}</span>
            <select
              className="circuit-filter-region"
              value={region}
              onChange={(event) => {
                const next = event.target.value as WheelRegion;
                setRegion(next);
                saveDuelRegion(next);
                // The drawn circuit belongs to the old pool, so redraw rather than leave a mismatch.
                setSetup(drawSetup(`duel-${Date.now()}`, next));
              }}
            >
              <option value="all">{tt("circuit_region_all")}</option>
              {regionsWithCircuits().map((option) => (
                <option key={option} value={option}>{tt(`circuit_region_${option}` as TranslationKey)}</option>
              ))}
            </select>
          </label>

          <div className="actions arcade-actions">
            <button type="button" className="secondary-button" onClick={again}>
              {tt("duel_redraw")}
            </button>
            <button type="button" className="primary-button" onClick={start}>
              {tt("duel_start")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const finished = duelOver(duel);
  const cost = attackCost(duel.weather);
  const driving = Boolean(lap);
  const cars: MapCar[] = [
    { id: PLAYER_ID, label: duel.gap >= 0 ? "1" : "2", player: true, delay: 0, duration: 30, progress: carProgressRef.current[PLAYER_ID] ?? 0, livery },
    { id: RIVAL_ID, label: duel.gap >= 0 ? "2" : "1", player: false, delay: 0, duration: 30, progress: carProgressRef.current[RIVAL_ID] ?? 0, livery: rival.livery }
  ];

  // Full screen once the duel is on: the map is the board, and every read-out is a corner of it.
  return (
    <div className="duel-race" aria-labelledby="duel-board-title">
      {help}
      <CircuitMap
        className="duel-map"
        circuit={hydrated}
        cars={cars}
        carProgressRef={carProgressRef}
        weather={duel.weather}
        showHeading={false}
        framed={false}
        showTraits={false}
        // Two cars trading a second of gap are the whole picture, so the camera stays on them.
        camera={{ enabled: true, car: cars[0], zoom: 3.4 }}
        overlay={
          <>
            {/* One band across the top of the map: the standing on the left, the tells on the right.
                Laid out rather than pinned, so neither has to guess how tall the other is. */}
            <div className="duel-hud">
              <div className="duel-status">
                <span className="section-kicker">{tt("duel_lap", { lap: Math.min(duel.lap, duel.laps), laps: duel.laps })}</span>
                <h1 id="duel-board-title">{gapLabel(duel.gap, tt)}</h1>
              </div>

              <div className="duel-hud-side">
                {/* Always on the board, so the corner it will fill does not appear out of nowhere
                    after the first lap. */}
                <div className="duel-history">
                  <h2>{tt("duel_history_title")}</h2>
                  {duel.rounds.length ? (
                    <ol>
                      {duel.rounds.map((round) => (
                        <li key={round.lap} className={round.swing > 0 ? "gain" : round.swing < 0 ? "loss" : undefined}>
                          <span className="duel-history-lap">{round.lap}</span>
                          <BoardIcon className="duel-history-icon" name={CALL_ICONS[round.playerCall]} />
                          <BoardIcon className="duel-history-icon rival" name={CALL_ICONS[round.rivalCall]} />
                          <b>{`${round.swing > 0 ? "+" : ""}${round.swing.toFixed(1)}`}</b>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="duel-history-empty">{tt("duel_history_empty")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom of the screen: both tanks capping the calls they are about to pay for. */}
            <div className="duel-controls">
              <div className="duel-tanks">
                <EngagementBar label={tt("duel_engagement_you")} value={duel.playerEngagement} />
                <EngagementBar label={rival.name} value={duel.rivalEngagement} />
              </div>
              {finished ? null : (
                <div className="duel-calls">
                  {DUEL_CALLS.map((option) => {
                    // Attacking on an empty tank only ever cost time, so the call is closed rather
                    // than offered as a trap.
                    const spent = option === "attack" && duel.playerEngagement < cost;
                    return (
                      <button key={option} type="button" className="duel-call" disabled={driving || spent} onClick={() => call(option)}>
                        <BoardIcon className="duel-call-icon" name={CALL_ICONS[option]} />
                        <strong>{tt(`duel_call_${option}` as TranslationKey)}</strong>
                        <small>{tt(`duel_call_${option}_hint` as TranslationKey)}</small>
                        <em>{option === "attack" ? tt("duel_call_cost", { cost }) : tt("duel_call_refill")}</em>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {finished ? (
              <button type="button" className="primary-button duel-again-button" onClick={again}>
                {tt("duel_again")}
              </button>
            ) : null}

            {/* The verdict pops in the middle of the map, the way a Grand Prix and a chrono end. */}
            {finished && !recapDismissed ? (
              <div className="replay-finish-recap">
                <div className="replay-finish-recap-panel">
                  <div className="replay-finish-flag" aria-hidden="true" />
                  <button type="button" className="context-panel-close replay-finish-recap-close" aria-label={tt("action_close")} onClick={() => setRecapDismissed(true)}>
                    ×
                  </button>
                  <div className="duel-recap">
                    <strong>{tt(duelOutcome(duel) === "player" ? "duel_win_title" : "duel_lose_title")}</strong>
                    <p>{tt("duel_result_gap", { gap: Math.abs(duel.gap).toFixed(1), rival: rival.name })}</p>
                    <p className="duel-recap-tally">
                      {tt("duel_result_tally", {
                        won: duel.rounds.filter((round) => round.swing > 0).length,
                        lost: duel.rounds.filter((round) => round.swing < 0).length
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        }
      />
    </div>
  );
}

function EngagementBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="duel-tank">
      <small>{label}</small>
      <span className="duel-tank-pips" aria-label={`${label}: ${value}/${DUEL_MAX_ENGAGEMENT}`}>
        {Array.from({ length: DUEL_MAX_ENGAGEMENT }, (_, index) => (
          <i key={index} className={index < value ? "filled" : undefined} />
        ))}
      </span>
    </div>
  );
}

function gapLabel(gap: number, tt: ReturnType<typeof useT>) {
  if (gap === 0) return tt("duel_gap_level");
  return tt(gap > 0 ? "duel_gap_lead" : "duel_gap_behind", { gap: Math.abs(gap).toFixed(1) });
}

/** A fresh circuit, rival and name per duel, so two runs never open on the same briefing. */
function drawSetup(seed: string, region: WheelRegion): { seed: string; rival: BotArchetype; rivalName: string; circuit: CityCircuit } {
  const rival = RIVALS[Math.floor(Math.random() * RIVALS.length)] ?? RIVALS[0]!;
  const pool = circuitsInRegion(region);
  const circuit = pool[Math.floor(Math.random() * pool.length)] ?? CITY_CIRCUITS[0];
  return { seed, rival: rival.archetype, rivalName: randomTeamName(), circuit };
}
