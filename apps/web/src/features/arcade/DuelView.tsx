import { useState } from "react";
import { useT, type TranslationKey } from "../../i18n/index.js";
import { SetupBackButton } from "../../app/SetupViews.js";
import { CITY_CIRCUITS, type CityCircuit } from "../../app/circuits.js";
import { BoardIcon, CountryBadge, VisualIcon } from "../VisualIcon.js";
import { TeamCar } from "../TeamCar.js";
import {
  attackCost,
  createDuel,
  duelOutcome,
  duelOver,
  DUEL_CALLS,
  DUEL_MAX_ENGAGEMENT,
  playDuelRound,
  type Duel
} from "./duel.js";
import type { BotArchetype } from "@cr-league/shared";

const RIVALS: Array<{ archetype: BotArchetype; name: string; livery: { primary: string; secondary: string } }> = [
  { archetype: "sprinter", name: "Nico Vandal", livery: { primary: "#ff6a1f", secondary: "#ffd166" } },
  { archetype: "gambler", name: "Rae Solano", livery: { primary: "#8b5cf6", secondary: "#22d3ee" } },
  { archetype: "prudent", name: "Ingrid Haas", livery: { primary: "#0ea5e9", secondary: "#f8fafc" } },
  { archetype: "mechanic", name: "Sam Okoro", livery: { primary: "#16c784", secondary: "#38bdf8" } },
  { archetype: "rain_specialist", name: "Yuki Farrow", livery: { primary: "#60a5fa", secondary: "#1e3a8a" } },
  { archetype: "opportunist", name: "Diego Pace", livery: { primary: "#ef4444", secondary: "#facc15" } }
];

/* Icons the board already ships: the boost for a charge, the balanced marker for holding station,
   the defensive order for shutting the door. */
const CALL_ICONS = { attack: "boost", manage: "balanced-approach", cover: "defensive-order" } as const;

/**
 * One rival, eight laps, three calls a lap. The whole game is guessing which call he is about to make,
 * which is why his tank and his last calls are on screen: they are the tells.
 */
export function DuelView({ onBack }: { onBack: () => void }) {
  const tt = useT();
  const [setup, setSetup] = useState(() => drawSetup(`duel-${Date.now()}`));
  const [duel, setDuel] = useState<Duel | null>(null);
  const rival = RIVALS.find((candidate) => candidate.archetype === setup.rival) ?? RIVALS[0]!;

  function start() {
    setDuel(createDuel(setup.seed, setup.rival, setup.circuit.likelyWeather));
  }

  function again() {
    const next = drawSetup(`duel-${Date.now()}`);
    setSetup(next);
    setDuel(null);
  }

  if (!duel) {
    return (
      <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="duel-title">
        <div className="panel setup-main-panel setup-hero-panel arcade-hero-panel">
          <SetupBackButton onBack={onBack} />
          <span className="section-kicker">{tt("duel_kicker")}</span>
          <h1 id="duel-title">{tt("duel_title")}</h1>
          <p className="status">{tt("duel_intro")}</p>
        </div>
        <div className="panel setup-main-panel setup-form-panel setup-choice-panel">
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
          <div className="actions">
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
  const last = duel.rounds.at(-1);
  const cost = attackCost(duel.weather);

  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="duel-board-title">
      <div className="panel setup-main-panel setup-hero-panel arcade-hero-panel">
        <SetupBackButton onBack={onBack} />
        <span className="section-kicker">{finished ? tt("duel_kicker") : tt("duel_lap", { lap: Math.min(duel.lap, duel.laps), laps: duel.laps })}</span>
        <h1 id="duel-board-title">{finished ? tt(duelOutcome(duel) === "player" ? "duel_win_title" : "duel_lose_title") : gapLabel(duel.gap, tt)}</h1>
        <p className="status">{finished ? tt("duel_result_gap", { gap: Math.abs(duel.gap).toFixed(1), rival: rival.name }) : tt("duel_board_intro", { rival: rival.name })}</p>
      </div>

      <div className="panel setup-main-panel setup-form-panel setup-choice-panel">
        <div className="duel-tanks">
          <EngagementBar label={tt("duel_engagement_you")} value={duel.playerEngagement} />
          <EngagementBar label={rival.name} value={duel.rivalEngagement} />
        </div>

        {last ? (
          <p className={last.swing > 0 ? "duel-reveal gain" : last.swing < 0 ? "duel-reveal loss" : "duel-reveal"} role="status">
            <BoardIcon className="duel-reveal-icon" name={CALL_ICONS[last.rivalCall]} />
            <span>
              {tt("duel_reveal", { rival: rival.name, call: tt(`duel_call_${last.rivalCall}` as TranslationKey) })}
              <b>{`${last.swing > 0 ? "+" : ""}${last.swing.toFixed(1)}s`}</b>
            </span>
            {last.overreach && last.overreach !== "rival" ? <em>{tt("duel_overreach")}</em> : null}
          </p>
        ) : null}

        {finished ? (
          <div className="actions">
            <button type="button" className="primary-button" onClick={again}>
              {tt("duel_again")}
            </button>
          </div>
        ) : (
          <div className="duel-calls">
            {DUEL_CALLS.map((call) => (
              <button key={call} type="button" className="duel-call" onClick={() => setDuel(playDuelRound(duel, call))}>
                <BoardIcon className="duel-call-icon" name={CALL_ICONS[call]} />
                <strong>{tt(`duel_call_${call}` as TranslationKey)}</strong>
                <small>{tt(`duel_call_${call}_hint` as TranslationKey)}</small>
                <em>{call === "attack" ? tt("duel_call_cost", { cost }) : tt("duel_call_refill")}</em>
              </button>
            ))}
          </div>
        )}

        {duel.rounds.length ? (
          <div className="duel-history">
            <h2>{tt("duel_history_title")}</h2>
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
          </div>
        ) : null}
      </div>
    </section>
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

/** A fresh circuit and rival per duel, so two runs never open on the same briefing. */
function drawSetup(seed: string): { seed: string; rival: BotArchetype; circuit: CityCircuit } {
  const rival = RIVALS[Math.floor(Math.random() * RIVALS.length)] ?? RIVALS[0]!;
  const circuit = CITY_CIRCUITS[Math.floor(Math.random() * CITY_CIRCUITS.length)] ?? CITY_CIRCUITS[0];
  return { seed, rival: rival.archetype, circuit };
}
