import type { CSSProperties } from "react";
import type { RaceDecision, TeamLivery } from "@cr-league/shared";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const CHRONO_PLAN_MARKERS = {
  approach: { prudent: 1, balanced: 2, aggressive: 3 },
  preparation: { speed: 1, reliability: 2, weather: 3 },
  pitStrategy: { heavy_pack: 1, standard: 2, mini_pack: 3 }
} as const;

type ReplayTowerEntry = { id?: string; teamId: string; teamName: string; value: string; decision?: RaceDecision };

export function ReplayTower({
  entries,
  playerTeamId,
  positionPops,
  title,
  onReport,
  reportLabel,
  teamLiveries
}: {
  entries: ReplayTowerEntry[];
  playerTeamId?: string;
  positionPops: Record<string, { delta: number; key: number }>;
  title: string;
  onReport?: () => void;
  reportLabel: string;
  teamLiveries: Record<string, TeamLivery>;
}) {
  return (
    <section className="replay-tower" aria-label={title}>
      <header>
        <strong>{title}</strong>
        {onReport ? (
          <button className="map-plan-edit-button" type="button" aria-label={reportLabel} title={title} onClick={onReport}>
            {reportLabel}
          </button>
        ) : null}
      </header>
      <ol>
        {entries.map((entry, index) => {
          const positionPop = positionPops[entry.teamId];
          const positionDelta = positionPop?.delta ?? 0;
          return (
            <li
              key={entry.id ?? entry.teamId}
              className={[
                entry.teamId === playerTeamId ? "player" : "",
                positionDelta ? "position-change" : "",
                positionDelta > 0 ? "gain" : positionDelta < 0 ? "loss" : ""
              ].filter(Boolean).join(" ") || undefined}
            >
              <span
                className={`replay-tower-livery position-badge${index < 3 ? ` top-${index + 1}` : ""}`}
                aria-label={`P${index + 1}`}
                style={
                  {
                    "--livery-primary": safeHex(teamLiveries[entry.teamId]?.primary, "#38bdf8"),
                    "--livery-secondary": safeHex(teamLiveries[entry.teamId]?.secondary, "#16c784")
                  } as CSSProperties & Record<string, string>
                }
              >
                {index + 1}
              </span>
              {entry.decision ? <ReplayPlanAsset decision={entry.decision} /> : <span className="replay-tower-plan-placeholder" aria-hidden="true" />}
              <span className="replay-tower-team">{entry.teamName}</span>
              <span className={positionDelta ? "replay-tower-delta" : "replay-tower-delta empty"}>{positionDelta > 0 ? `+${positionDelta}` : positionDelta || "0"}</span>
              {entry.value ? <span className="replay-tower-value">{entry.value}</span> : <span className="replay-tower-value empty" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function safeHex(value: string | undefined, fallback: string) {
  return value && HEX_COLOR.test(value) ? value : fallback;
}

function ReplayPlanAsset({ decision }: { decision: RaceDecision }) {
  return (
    <span className="chrono-plan-asset replay-tower-plan" aria-hidden="true">
      <ReplayPlanDots className="approach" value={CHRONO_PLAN_MARKERS.approach[decision.approach]} />
      <ReplayPlanDots className="preparation" value={CHRONO_PLAN_MARKERS.preparation[decision.preparation]} />
      <ReplayPlanDots className="pit" value={CHRONO_PLAN_MARKERS.pitStrategy[decision.pitStrategy ?? "standard"]} />
      <i className={decision.cardId ? "card active" : "card"} />
    </span>
  );
}

function ReplayPlanDots({ className, value }: { className: string; value: 1 | 2 | 3 }) {
  return (
    <i className={className}>
      {[1, 2, 3].map((step) => (
        <i key={step} className={step === value ? "active" : undefined} />
      ))}
    </i>
  );
}
