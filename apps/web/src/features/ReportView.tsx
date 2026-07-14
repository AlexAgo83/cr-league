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

  return (
    <div className="view-stack">
      <section className="panel">
        <h2>{result.grandPrixName}</h2>
        <p>{resultHeadline(result, tt)}</p>
        <ol className="classification">
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
          <section>
            <h3>{tt("result_difference")}</h3>
            <p>{majorEvents[0] ? eventReportText(majorEvents[0], names, tt) : resultHeadline(result, tt)}</p>
          </section>
          <section>
            <h3>{tt("result_your_directive")}</h3>
            <p>{describeDecision(playerDecision, tt)}</p>
          </section>
          <section>
            <h3>{tt("result_next_lesson")}</h3>
            <p>{nextLesson(state, playerDecision, playerEvents, forecastPick, tt)}</p>
          </section>
        </div>
      </section>

      <section className="panel">
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
