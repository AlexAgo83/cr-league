import type { CardId } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { Translator } from "../app/helpers.js";

const CARD_BADGES: Record<CardId, Array<{ trait: "grip" | "overtaking" | "energy"; sign: "+" | "-"; icon: string; label: TranslationKey }>> = {
  rain_grip: [
    { trait: "grip", sign: "+", icon: "◆", label: "circuit_grip" },
    { trait: "overtaking", sign: "-", icon: "↗", label: "circuit_overtaking" }
  ],
  fleet_maintenance: [{ trait: "energy", sign: "+", icon: "⚡", label: "circuit_energy" }],
  launch_boost: [
    { trait: "overtaking", sign: "+", icon: "↗", label: "circuit_overtaking" },
    { trait: "energy", sign: "-", icon: "⚡", label: "circuit_energy" }
  ],
  urban_draft: [{ trait: "overtaking", sign: "+", icon: "↗", label: "circuit_overtaking" }],
  final_surge: [
    { trait: "energy", sign: "+", icon: "⚡", label: "circuit_energy" },
    { trait: "overtaking", sign: "+", icon: "↗", label: "circuit_overtaking" }
  ],
  fleet_sponsorship: [{ trait: "overtaking", sign: "-", icon: "↗", label: "circuit_overtaking" }]
};

export function CardStatBadges({ cardId, tt }: { cardId: CardId; tt: Translator }) {
  return (
    <span className="card-stat-badges">
      {CARD_BADGES[cardId].map((badge) => (
        <span key={`${badge.sign}-${badge.trait}`} className={`card-stat-badge map-trait-${badge.trait} ${badge.sign === "-" ? "weakness" : "bonus"}`}>
          <i aria-hidden="true">{badge.icon}</i>
          <span>
            {badge.sign} {tt(badge.label)}
          </span>
        </span>
      ))}
    </span>
  );
}
