import type { CardId } from "../domain/race.js";

export type CardDefinition = {
  name: string;
  family: "weather" | "reliability" | "attack" | "rival" | "comeback" | "economy";
  playerPromise: string;
};

export type CardStrengthBand = "weak" | "medium" | "strong";

export type CardDescriptor = {
  conditionKey: string;
  strength: CardStrengthBand;
  downsideKey: string;
};

export const CARD_DEFINITIONS: Record<CardId, CardDefinition> = {
  rain_grip: {
    name: "Rain Grip",
    family: "weather",
    playerPromise: "If the rain arrives, your team is ready. If it stays dry, you give up pace."
  },
  fleet_maintenance: {
    name: "Fleet Maintenance",
    family: "reliability",
    playerPromise: "The first mechanical scare becomes a delay, not a disaster."
  },
  launch_boost: {
    name: "Launch Boost",
    family: "attack",
    playerPromise: "Launch hard now. Pay the pressure later."
  },
  urban_draft: {
    name: "Urban Draft",
    family: "rival",
    playerPromise: "Use your rival's tow to force a move."
  },
  final_surge: {
    name: "Final Surge",
    family: "comeback",
    playerPromise: "Throw everything into the final stretch if you are outside the podium."
  },
  fleet_sponsorship: {
    name: "Fleet Sponsorship",
    family: "economy",
    playerPromise: "Sacrifice some pace for a stronger credit payout."
  },
  soft_tires: {
    name: "Soft Tires",
    family: "attack",
    playerPromise: "Gain launch and attack pace early, then manage weaker late endurance."
  },
  qualifying_focus: {
    name: "Qualifying Lap",
    family: "attack",
    playerPromise: "Focus the car on a faster qualifying attempt, with little race value."
  },
  defensive_order: {
    name: "Defensive Order",
    family: "reliability",
    playerPromise: "Protect your position under pressure, but give up attacking edge."
  },
  adjustable_wing: {
    name: "Adjustable Wing",
    family: "attack",
    playerPromise: "Open the car up on fast or urban roads, at the cost of stability."
  },
  rain_mapping: {
    name: "Rain Mapping",
    family: "weather",
    playerPromise: "Prepare the engine map for changing rain; still gives a small baseline if the track stays dry."
  },
  economy_mode: {
    name: "Economy Mode",
    family: "economy",
    playerPromise: "Start conservatively and convert a strong finish into extra credits."
  },
  pit_relay: {
    name: "Pit Relay",
    family: "reliability",
    playerPromise: "The wall steadies the car through the late race when pressure rises."
  },
  hard_tires: {
    name: "Hard Tires",
    family: "reliability",
    playerPromise: "Give up launch bite for a stronger closing stint."
  },
  calculated_attack: {
    name: "Calculated Attack",
    family: "rival",
    playerPromise: "Strike only when another car is close enough to pressure."
  }
};

export const CARD_DESCRIPTORS: Record<CardId, CardDescriptor> = {
  rain_grip: { conditionKey: "card_condition_rain_mid", strength: "strong", downsideKey: "card_downside_dry_pace" },
  fleet_maintenance: { conditionKey: "card_condition_first_mechanical", strength: "strong", downsideKey: "card_downside_none" },
  launch_boost: { conditionKey: "card_condition_start", strength: "medium", downsideKey: "card_downside_reliability" },
  urban_draft: { conditionKey: "card_condition_chosen_rival_mid", strength: "strong", downsideKey: "card_downside_needs_rival" },
  final_surge: { conditionKey: "card_condition_finish_outside_podium", strength: "strong", downsideKey: "card_downside_reliability" },
  fleet_sponsorship: { conditionKey: "card_condition_finish", strength: "weak", downsideKey: "card_downside_pace" },
  soft_tires: { conditionKey: "card_condition_early", strength: "medium", downsideKey: "card_downside_late_reliability" },
  qualifying_focus: { conditionKey: "card_condition_chrono", strength: "weak", downsideKey: "card_downside_low_race_value" },
  defensive_order: { conditionKey: "card_condition_late", strength: "weak", downsideKey: "card_downside_attack" },
  adjustable_wing: { conditionKey: "card_condition_fast_urban_early", strength: "medium", downsideKey: "card_downside_reliability" },
  rain_mapping: { conditionKey: "card_condition_rain_mid", strength: "strong", downsideKey: "card_downside_dry_baseline" },
  economy_mode: { conditionKey: "card_condition_top4_finish", strength: "weak", downsideKey: "card_downside_pace" },
  pit_relay: { conditionKey: "card_condition_late", strength: "medium", downsideKey: "card_downside_none" },
  hard_tires: { conditionKey: "card_condition_late", strength: "medium", downsideKey: "card_downside_start_pace" },
  calculated_attack: { conditionKey: "card_condition_close_car_mid", strength: "strong", downsideKey: "card_downside_needs_gap" }
};
