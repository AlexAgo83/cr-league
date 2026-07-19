export function PositionBadge({ position, className = "" }: { position: number; className?: string }) {
  const podium = position >= 1 && position <= 3 ? ` top-${position}` : "";
  return <span className={`position-badge${podium}${className ? ` ${className}` : ""}`}>P{position}</span>;
}
