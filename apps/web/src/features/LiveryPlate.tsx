import type { CSSProperties } from "react";
import { safeHex, type TeamLivery } from "@cr-league/shared";

export { safeHex };

export function LiveryPlate({ className = "", livery, name, wins = 0 }: { className?: string; livery: TeamLivery; name: string; wins?: number }) {
  const marks = Array.from({ length: Math.min(wins, 5) });
  const primary = safeHex(livery.primary, "#38bdf8");
  const secondary = safeHex(livery.secondary, "#16c784");
  return (
    <span className={className} style={{ "--livery-primary": primary, "--livery-secondary": secondary } as CSSProperties & Record<string, string>}>
      <span className="livery-plate-text">{name.slice(0, 3).toUpperCase()}</span>
      {marks.length ? <span className="livery-plate-stars">{marks.map((_, index) => <i key={index} />)}</span> : null}
    </span>
  );
}
