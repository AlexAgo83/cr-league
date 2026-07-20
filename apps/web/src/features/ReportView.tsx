import { RACE_SEGMENTS, type RaceEvent, type RaceResult } from "@cr-league/shared";
import type { CityCircuit } from "../app/circuits.js";
import type { TranslationKey } from "../i18n/index.js";
import { displayLapForEvent, maxEventLap } from "../app/lapDisplay.js";
import {
  buildRaceVerdict,
  eventReportText,
  raceRecapCards,
  resultHeadline,
  teamNamesFromResult,
  translateLine,
  type Translator
} from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { PositionBadge } from "./PositionBadge.js";
import { RewardValue } from "./RewardValue.js";
import { VisualIcon } from "./VisualIcon.js";

export function ReportView({
  state,
  result,
  circuit,
  playerTeamId,
  playerDecision,
  onOpenReplay,
  onClose,
  tt
}: {
  state: LeagueState;
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  playerDecision: LeagueState["decisions"][number] | undefined;
  onOpenReplay?: () => void;
  onClose?: () => void;
  tt: Translator;
}) {
  const names = teamNamesFromResult(result);
  const raceTitle = `${circuit.city} ${tt(circuit.layoutKey)}`;
  const rawMaxLap = maxEventLap(result);
  const keyEvents = keyMomentEvents(result.events, rawMaxLap, circuit.laps);
  const recapCards = raceRecapCards(result, state, playerTeamId, playerDecision, raceTitle, tt, circuit.laps);
  const verdict = buildRaceVerdict(result, state, playerTeamId, playerDecision, raceTitle, tt, circuit.laps);
  const recap = [
    {
      className: "difference",
      title: tt("result_difference"),
      body: recapCards.difference
    },
    {
      className: "directive",
      title: tt("result_your_directive"),
      body: recapCards.directive
    },
    {
      className: "plan-read",
      title: tt("result_plan_read"),
      body: recapCards.planRead
    },
    {
      className: "lesson",
      title: tt("result_next_lesson"),
      body: recapCards.lesson
    }
  ];

  return (
    <div className="view-stack report-view">
      <section className="panel report-hero">
        <div className="report-headline">
          <span className="section-kicker">{tt("result_race_report")}</span>
          <h2>{raceTitle}</h2>
          <p>{resultHeadline(result, tt, raceTitle)}</p>
        </div>
        {onOpenReplay || onClose ? (
          <div className="report-actions">
            {onOpenReplay ? (
              <button type="button" className="report-replay-button" aria-label={tt("result_tab_replay")} title={tt("result_tab_replay")} onClick={onOpenReplay}>
                <svg className="report-play-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : null}
            {onClose ? (
              <button type="button" className="report-close-button" aria-label={tt("action_back_to_circuit")} title={tt("action_back_to_circuit")} onClick={onClose}>
                ×
              </button>
            ) : null}
          </div>
        ) : null}
        <section className="report-verdict" aria-label={tt("result_verdict")}>
          <strong>{translateLine(verdict.stance, tt)}</strong>
          <p>{translateLine(verdict.cause, tt)}</p>
          <small>{translateLine(verdict.tryNext, tt)}</small>
        </section>
        <ol className="report-podium">
          {result.classification.map((entry) => (
            <li key={entry.teamId} className={entry.teamId === playerTeamId ? "current-team" : undefined}>
              <PositionBadge position={entry.position} />
              <span>{entry.teamName}</span>
              <small>
                <RewardValue type="points" value={entry.points} tt={tt} /> <RewardValue type="credits" value={entry.credits} tt={tt} />
              </small>
            </li>
          ))}
        </ol>
      </section>

      <div className="report-main-grid">
        <div className="report-content-column">
          <section className="panel report-phases">
            <h3>{tt("report_phases")}</h3>
            <ol className="report-phases-list" aria-label={tt("report_phases")}>
              {RACE_SEGMENTS.map((segment, index) => (
                <li key={segment}>
                  <strong>
                    {tt("result_replay_phase")} {index + 1}
                  </strong>
                  <span>
                    <VisualIcon name={result.resolvedWeather[segment]} /> {tt(`weather_${result.resolvedWeather[segment]}` as TranslationKey)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel report-rewards">
            <h3>{tt("report_rewards")}</h3>
            <ol>
              {result.classification.map((entry) => (
                <li key={entry.teamId} className={entry.teamId === playerTeamId ? "current-team" : undefined}>
                  <PositionBadge position={entry.position} />
                  <span>{entry.teamName}</span>
                  <dl>
                    <div>
                      <dt>{tt("report_reward_points")}</dt>
                      <dd>
                        <RewardValue type="points" value={entry.points} tt={tt} />
                      </dd>
                    </div>
                    <div>
                      <dt>{tt("report_reward_credits")}</dt>
                      <dd>
                        <RewardValue type="credits" value={entry.credits} tt={tt} />
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel report-key-moments">
            <h3>{tt("report_key_moments")}</h3>
            {keyEvents.length ? (
              <ol>
                {keyEvents.map((event) => (
                  <li key={event.id || `${event.order}-${event.type}-${event.teamId}`}>
                    <span className="lap-marker">
                      {tt("unit_lap")} {displayLapForEvent(event, rawMaxLap, circuit.laps)}
                    </span>
                    <div>
                      <strong>{names.get(event.teamId) ?? tt("event_major")}</strong>
                      <p>{eventReportText(event, names, tt)}</p>
                      <small>{describeEventImpact(event, tt)}</small>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{tt("report_clean_race")}</p>
            )}
          </section>
        </div>

        <section className="panel report-side-recap">
          <h2>{tt("result_recap_title")}</h2>
          <div className="recap-grid">
            {recap.map((item) => (
              <section key={item.title} className={`recap-card ${item.className}`}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </section>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function keyMomentEvents(events: RaceEvent[], rawMaxLap: number, circuitLaps: number) {
  const deduped = events
    .filter((event) => event.severity === "major")
    .filter((event, index, all) => all.findIndex((candidate) => candidate.type === event.type && displayLapForEvent(candidate, rawMaxLap, circuitLaps) === displayLapForEvent(event, rawMaxLap, circuitLaps)) === index);
  const seenTypes = new Set<RaceEvent["type"]>();
  const varied: RaceEvent[] = [];
  const overflow: RaceEvent[] = [];
  for (const event of deduped) {
    (seenTypes.has(event.type) ? overflow : varied).push(event);
    seenTypes.add(event.type);
  }
  return [...varied, ...overflow].slice(0, 5).sort((left, right) => left.order - right.order);
}

function describeEventImpact(event: RaceEvent, tt: Translator) {
  const delta = event.positionDelta;
  if (event.cardId && delta > 0) return `${tt("report_event_boost")} +${delta}`;
  if (event.cardId && delta < 0) return `${tt("report_event_boost")} ${delta}`;
  if (delta > 0) return `${tt("report_event_impact")} +${delta}`;
  if (delta < 0) return `${tt("report_event_impact")} ${delta}`;
  return tt("report_event_neutral");
}
