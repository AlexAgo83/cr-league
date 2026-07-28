import { useT } from "../i18n/index.js";

export function RewardValue({ type, value, signed = false }: { type: "points" | "credits"; value: number; signed?: boolean }) {
  const tt = useT();
  const label = type === "points" ? tt("unit_points") : tt("unit_credits");
  const prefix = signed && value > 0 ? "+" : "";
  return (
    <span className={`reward-value reward-${type}`}>
      <span aria-hidden="true" className="reward-icon">
        {type === "points" ? "★" : "●"}
      </span>
      <span>
        {prefix}
        {value} <span className="reward-label">{label}</span>
      </span>
    </span>
  );
}
