import type { CSSProperties } from "react";
import type { TeamLivery } from "@cr-league/shared";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type ReplayTowerEntry = { id?: string; teamId: string; teamName: string; value: string };

export function ReplayTower({
  entries,
  playerTeamId,
  positionPops,
  teamLiveries
}: {
  entries: ReplayTowerEntry[];
  playerTeamId?: string;
  positionPops: Record<string, { delta: number; key: number }>;
  teamLiveries: Record<string, TeamLivery>;
}) {
  return (
    <ol className="replay-tower">
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
            <span className="replay-tower-team">{entry.teamName}</span>
            {entry.value ? <span className="replay-tower-value">{entry.value}</span> : null}
            {positionDelta ? <span className="replay-tower-delta">{positionDelta > 0 ? `+${positionDelta}` : positionDelta}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

function safeHex(value: string | undefined, fallback: string) {
  return value && HEX_COLOR.test(value) ? value : fallback;
}
