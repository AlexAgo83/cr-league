import { useState, type CSSProperties } from "react";
import { safeHex, type RaceDecision, type TeamLivery } from "@cr-league/shared";
import { MapStatsToggle } from "../CircuitMap.js";
import { BoardIcon } from "../VisualIcon.js";

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
  teamLiveries,
  focusedTeamId,
  focusLabel,
  onTeamFocus
}: {
  entries: ReplayTowerEntry[];
  playerTeamId?: string;
  positionPops: Record<string, { delta: number; key: number }>;
  title: string;
  onReport?: () => void;
  reportLabel: string;
  teamLiveries: Record<string, TeamLivery>;
  focusedTeamId?: string;
  focusLabel?: string;
  onTeamFocus?: (teamId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const focusedEntry = focusedTeamId ? entries.find((entry) => entry.teamId === focusedTeamId) : undefined;
  const focusedLivery = focusedEntry ? teamLiveries[focusedEntry.teamId] : undefined;
  return (
    <section className={expanded ? "replay-tower" : "replay-tower map-list-collapsed"} aria-label={title}>
      <header>
        <strong>{title}</strong>
        {/* The flag carries the meaning on its own, so narrow screens drop the label rather than
            paying for a button twice as wide over the map. */}
        {onReport ? (
          <button className="map-plan-edit-button map-result-button" type="button" aria-label={reportLabel} title={title} onClick={onReport}>
            <BoardIcon className="map-result-icon" name="finish-flag-icon" />
            <span className="map-result-label">{reportLabel}</span>
          </button>
        ) : null}
      </header>
      {focusedEntry && focusedLivery ? (
        <div className="replay-focus-chip">
          <TeamHelmet className="replay-focus-helmet" livery={focusedLivery} />
          <span>{focusedEntry.teamName}</span>
        </div>
      ) : null}
      <ol>
        {entries.map((entry, index) => {
          const positionPop = positionPops[entry.teamId];
          const positionDelta = positionPop?.delta ?? 0;
          const badgeClass = `replay-tower-livery position-badge${index < 3 ? ` top-${index + 1}` : ""}`;
          const primary = safeHex(teamLiveries[entry.teamId]?.primary, "#38bdf8");
          const secondary = safeHex(teamLiveries[entry.teamId]?.secondary, "#16c784");
          const badgeStyle = {
            "--livery-primary": primary,
            "--livery-secondary": secondary
          } as CSSProperties & Record<string, string>;
          return (
            <li
              key={entry.id ?? entry.teamId}
              className={[
                entry.teamId === playerTeamId ? "player" : "",
                entry.teamId === focusedTeamId ? "focused" : "",
                positionDelta ? "position-change" : "",
                positionDelta > 0 ? "gain" : positionDelta < 0 ? "loss" : ""
              ].filter(Boolean).join(" ") || undefined}
            >
              {onTeamFocus ? (
                <button
                  type="button"
                  className={`${badgeClass} replay-tower-focus`}
                  data-team-id={entry.teamId}
                  aria-label={`${focusLabel ?? title}: ${entry.teamName}`}
                  aria-pressed={entry.teamId === focusedTeamId}
                  style={badgeStyle}
                  onClick={() => onTeamFocus(entry.teamId)}
                >
                  <HelmetToken />
                  <span className="replay-tower-rank">{index + 1}</span>
                </button>
              ) : (
                <span className={badgeClass} data-team-id={entry.teamId} aria-label={`P${index + 1}`} style={badgeStyle}>
                  <HelmetToken />
                  <span className="replay-tower-rank">{index + 1}</span>
                </span>
              )}
              {entry.decision ? <ReplayPlanAsset decision={entry.decision} /> : <span className="replay-tower-plan-placeholder" aria-hidden="true" />}
              <span className="replay-tower-team">{entry.teamName}</span>
              <span className={positionDelta ? "replay-tower-delta" : "replay-tower-delta empty"}>{positionDelta > 0 ? `+${positionDelta}` : positionDelta || "0"}</span>
              {entry.value ? <span className="replay-tower-value">{entry.value}</span> : <span className="replay-tower-value empty" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
      <MapStatsToggle className="map-list-toggle" collapseKey="action_collapse_list" expandKey="action_expand_list" expanded={expanded} onToggle={setExpanded} />
    </section>
  );
}

export function HelmetToken() {
  return (
    <span className="replay-tower-helmet" aria-hidden="true">
      <img src="/assets/crl/helmet-token-primary.png" alt="" />
    </span>
  );
}

export function TeamHelmet({ className = "", livery }: { className?: string; livery: TeamLivery }) {
  return (
    <span className={`team-helmet ${className}`.trim()} style={{ "--livery-primary": safeHex(livery.primary, "#38bdf8"), "--livery-secondary": safeHex(livery.secondary, "#16c784") } as CSSProperties & Record<string, string>}>
      <HelmetToken />
    </span>
  );
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
