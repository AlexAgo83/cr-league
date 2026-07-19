import { CARD_DEFINITIONS, CARD_PRICE, type CardId, type TeamLivery } from "@cr-league/shared";

export const LEAGUE_CADENCES = ["manual", "fast", "weekly"] as const;
export const STARTING_CREDITS = 180;
export const STARTER_CARDS: CardId[] = [];
export const CARD_SHOP = Object.keys(CARD_DEFINITIONS).map((cardId) => ({ cardId: cardId as CardId, price: CARD_PRICE }));
export const DEFAULT_LIVERY: TeamLivery = { primary: "#16c784", secondary: "#38bdf8" };
export const PRIMARY_LIVERY_COLORS = ["#0f172a", "#1e1b4b", "#312e81", "#3f1d2d", "#1f2937", "#064e3b", "#451a03", "#172554"] as const;
export const SECONDARY_LIVERY_COLORS = ["#f8fafc", "#fde68a", "#bfdbfe", "#bbf7d0", "#fecdd3", "#ddd6fe", "#fed7aa", "#ccfbf1"] as const;
export const MAX_PRIMARY_LIVERY_CHANNEL = 120;
export const MIN_SECONDARY_LIVERY_CHANNEL = 150;
export const BOT_TEAM_NAMES = [
  "Apex Foundry",
  "Blackline GP",
  "Blue Harpoon",
  "Brake Point",
  "Carbon Yard",
  "Circuit Nord",
  "Coastal Apex",
  "Copperline",
  "Corsa Nova",
  "Delta Forge",
  "Drift Union",
  "Eagle Run",
  "Eastbound",
  "Falcon Works",
  "Fastlane",
  "Ferro Racing",
  "Grid Seven",
  "Harbor Sprint",
  "Helio Corse",
  "Iron Pulse",
  "Jetstream",
  "Kerbside",
  "Lane Eight",
  "Lunar Apex",
  "Metro Veloce",
  "Midnight GP",
  "Monarch Racing",
  "Neon Sector",
  "Northstar",
  "Nova Lane",
  "Omega Works",
  "Orbit Corse",
  "Pacific Line",
  "Piston Club",
  "Polecraft",
  "Quantum GP",
  "Rapid Vale",
  "Redshift",
  "Ridge Motors",
  "Silverline",
  "Skyline Works",
  "Slipstream",
  "South Gate",
  "Steel Apex",
  "Stormline",
  "Summit Corse",
  "Torque House",
  "Union Brake",
  "Vector Lane",
  "Westline"
] as const;
export const DEFAULT_MAX_PLAYERS = 8;
export const MAX_PLAYERS_LIMIT = 16;
export const DEFAULT_QUALIFYING_ATTEMPTS = 3;
export const MAX_QUALIFYING_ATTEMPTS = 5;
export const DEFAULT_GRAND_PRIX_PER_SEASON = 6;
export const MAX_GRAND_PRIX_PER_SEASON = 18;
export const TEAM_NAME_LIMIT = 32;
export const LEAGUE_NAME_LIMIT = 40;
export const QUALIFYING_REPLAY_SECONDS_PER_LAP = 10;
