import type { CardId } from "../domain/race.js";

export type CardDefinition = {
  id: CardId;
  name: string;
  family: "weather" | "reliability" | "attack" | "rival" | "comeback" | "economy";
  consumable: true;
  playerPromise: string;
};

export const CARD_DEFINITIONS: Record<CardId, CardDefinition> = {
  rain_grip: {
    id: "rain_grip",
    name: "Rain Grip",
    family: "weather",
    consumable: true,
    playerPromise: "If the rain arrives, your team is ready. If it stays dry, you give up pace."
  },
  fleet_maintenance: {
    id: "fleet_maintenance",
    name: "Fleet Maintenance",
    family: "reliability",
    consumable: true,
    playerPromise: "The first mechanical scare becomes a delay, not a disaster."
  },
  launch_boost: {
    id: "launch_boost",
    name: "Launch Boost",
    family: "attack",
    consumable: true,
    playerPromise: "Launch hard now. Pay the pressure later."
  },
  urban_draft: {
    id: "urban_draft",
    name: "Urban Draft",
    family: "rival",
    consumable: true,
    playerPromise: "Use your rival's tow to force a move."
  },
  final_surge: {
    id: "final_surge",
    name: "Final Surge",
    family: "comeback",
    consumable: true,
    playerPromise: "Throw everything into the final stretch if you are outside the podium."
  },
  fleet_sponsorship: {
    id: "fleet_sponsorship",
    name: "Fleet Sponsorship",
    family: "economy",
    consumable: true,
    playerPromise: "Sacrifice some pace for a stronger credit payout."
  },
  soft_tires: {
    id: "soft_tires",
    name: "Soft Tires",
    family: "attack",
    consumable: true,
    playerPromise: "Gain launch and attack pace early, then manage weaker late endurance."
  },
  qualifying_focus: {
    id: "qualifying_focus",
    name: "Qualifying Lap",
    family: "attack",
    consumable: true,
    playerPromise: "Focus the car on a faster qualifying attempt, with little race value."
  },
  defensive_order: {
    id: "defensive_order",
    name: "Defensive Order",
    family: "reliability",
    consumable: true,
    playerPromise: "Protect your position under pressure, but give up attacking edge."
  }
};
