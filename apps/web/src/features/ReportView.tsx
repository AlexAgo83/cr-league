import type { RaceResult } from "@cr-league/shared";
import {
  describeDecision,
  eventReportText,
  localizedReportBlocks,
  nextLesson,
  resultHeadline,
  teamNamesFromResult,
  type Translator
} from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";

export function ReportView({
  state,
  result,
  playerTeamId,
  playerDecision,
  forecastPick,
  tt
}: {
  state: LeagueState;
  result: RaceResult;
  playerTeamId: string | undefined;
  playerDecision: LeagueState["decisions"][number] | undefined;
  forecastPick: string;
  tt: Translator;
}) {
  const names = teamNamesFromResult(result);
  const majorEvents = result.events.filter((event) => event.severity === "major");
  const playerEvents = result.events.filter((event) => event.teamId === playerTeamId || event.relatedTeamId === playerTeamId);
  const winner = result.classification[0];
  const recap = [
    {
      className: "difference",
      title: tt("result_difference"),
      body: majorEvents[0] ? eventReportText(majorEvents[0], names, tt) : resultHeadline(result, tt)
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
        <div>
          <span className="section-kicker">{tt("result_race_report")}</span>
          <h2>{result.grandPrixName}</h2>
          <p>{resultHeadline(result, tt)}</p>
        </div>
        {winner ? (
          <div className="winner-badge">
            <span>P1</span>
            <strong>{winner.teamName}</strong>
            <small>
              {winner.points} {tt("unit_points")} · {winner.credits} {tt("unit_credits")}
            </small>
          </div>
        ) : null}
      </section>

      <section className="panel report-classification-panel">
        <ol className="classification report-classification">
          {result.classification.map((entry) => (
            <li key={entry.teamId} className={entry.teamId === playerTeamId ? "current-team" : undefined}>
              <span>
                <strong>P{entry.position}</strong> {entry.teamName}
              </span>
              <span>
                {entry.points} {tt("unit_points")} · {entry.credits} {tt("unit_credits")}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
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

      <section className="panel report-blocks">
        <h2>{tt("result_race_report")}</h2>
        {localizedReportBlocks(result, tt).map((block) => (
          <section key={block.title}>
            <h3>{block.title}</h3>
            <p>{block.body}</p>
          </section>
        ))}
      </section>
    </div>
  );
}
