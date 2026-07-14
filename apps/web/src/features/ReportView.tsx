import type { RaceResult } from "@cr-league/shared";
import type { CityCircuit } from "../app/circuits.js";
import {
  describeDecision,
  eventReportText,
  nextLesson,
  resultHeadline,
  teamNamesFromResult,
  type Translator
} from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";

export function ReportView({
  state,
  result,
  circuit,
  playerTeamId,
  playerDecision,
  forecastPick,
  tt
}: {
  state: LeagueState;
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  playerDecision: LeagueState["decisions"][number] | undefined;
  forecastPick: string;
  tt: Translator;
}) {
  const names = teamNamesFromResult(result);
  const raceTitle = `${circuit.city} ${tt(circuit.layoutKey)}`;
  const majorEvents = result.events.filter((event) => event.severity === "major");
  const keyEvents = majorEvents.slice(0, 5);
  const playerEvents = result.events.filter((event) => event.teamId === playerTeamId || event.relatedTeamId === playerTeamId);
  const recap = [
    {
      className: "difference",
      title: tt("result_difference"),
      body: majorEvents[0] ? eventReportText(majorEvents[0], names, tt) : resultHeadline(result, tt, raceTitle)
    },
    {
      className: "directive",
      title: tt("result_your_directive"),
      body: describeDecision(playerDecision, tt)
    },
    {
      className: "lesson",
      title: tt("result_next_lesson"),
      body: nextLesson(state, playerDecision, playerEvents, forecastPick, tt)
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
        <ol className="report-podium">
          {result.classification.map((entry) => (
            <li key={entry.teamId} className={entry.teamId === playerTeamId ? "current-team" : undefined}>
              <strong>P{entry.position}</strong>
              <span>{entry.teamName}</span>
              <small>
                {entry.points} {tt("unit_points")} · {entry.credits} {tt("unit_credits")}
              </small>
            </li>
          ))}
        </ol>
      </section>

      <div className="report-main-grid">
        <section className="panel report-blocks">
          <h2>{tt("result_race_report")}</h2>
          <section className="report-key-moments">
            <h3>{tt("report_key_moments")}</h3>
            {keyEvents.length ? (
              <ol>
                {keyEvents.map((event) => (
                  <li key={event.id || `${event.order}-${event.type}-${event.teamId}`}>
                    <span className="lap-marker">
                      {tt("unit_lap")} {event.lap}
                    </span>
                    <div>
                      <strong>{names.get(event.teamId) ?? tt("event_major")}</strong>
                      <p>{eventReportText(event, names, tt)}</p>
                      <small>{describeEventImpact(event.positionDelta, tt)}</small>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{tt("report_clean_race")}</p>
            )}
          </section>

          <section className="report-rewards">
            <h3>{tt("report_rewards")}</h3>
            <ol>
              {result.classification.map((entry) => (
                <li key={entry.teamId} className={entry.teamId === playerTeamId ? "current-team" : undefined}>
                  <strong>P{entry.position}</strong>
                  <span>{entry.teamName}</span>
                  <dl>
                    <div>
                      <dt>{tt("report_reward_points")}</dt>
                      <dd>
                        {entry.points} {tt("unit_points")}
                      </dd>
                    </div>
                    <div>
                      <dt>{tt("report_reward_credits")}</dt>
                      <dd>
                        {entry.credits} {tt("unit_credits")}
                      </dd>
                    </div>
                    <div>
                      <dt>{tt("report_reward_movement")}</dt>
                      <dd>{describePositionChange(entry.positionChange, tt)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </section>
        </section>

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

function describeEventImpact(delta: number, tt: Translator) {
  if (delta > 0) return `${tt("report_event_impact")} +${delta}`;
  if (delta < 0) return `${tt("report_event_impact")} ${delta}`;
  return tt("report_event_neutral");
}

function describePositionChange(delta: number, tt: Translator) {
  if (delta > 0) return `${tt("report_position_gain")} +${delta}`;
  if (delta < 0) return `${tt("report_position_loss")} ${Math.abs(delta)}`;
  return tt("report_position_hold");
}
