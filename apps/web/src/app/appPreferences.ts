import { DIRECTIVE_STEP_KEY } from "../features/DirectivePanel.js";
import { DISMISSED_REPLAY_HELP_KEY, REPLAY_FOCUS_KEY, REPLAY_SPEED_KEY } from "../features/ReplayView.js";
import { ONBOARDING_HELP_KEYS, type OnboardingHelpTopic } from "./OnboardingShell.js";
import { CHAMPIONSHIP_RECORD_TAB_KEY, GARAGE_PANEL_KEY } from "./viewPreferences.js";

export const UI_PREFERENCE_KEYS = [
  DISMISSED_REPLAY_HELP_KEY,
  REPLAY_SPEED_KEY,
  REPLAY_FOCUS_KEY,
  GARAGE_PANEL_KEY,
  CHAMPIONSHIP_RECORD_TAB_KEY,
  DIRECTIVE_STEP_KEY,
  "cr-league-card-consumption-help",
  "cr-league-card-consumption-help-v2",
  ...Object.values(ONBOARDING_HELP_KEYS)
] as const;

export const LEAGUE_SCOPED_HELP_TOPICS = new Set<OnboardingHelpTopic>(["leagueIntro", "race", "plan", "garage"]);
