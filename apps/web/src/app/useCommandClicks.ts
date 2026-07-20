import { useCallback, useState } from "react";

export type CommandClick = "qualifying" | "editPlan" | "directive" | "chronoReport" | "launchGrandPrix" | "resultReport" | "nextGrandPrix";

const COMMAND_CLICKS: CommandClick[] = ["qualifying", "editPlan", "directive", "chronoReport", "launchGrandPrix", "resultReport", "nextGrandPrix"];

function blankCommandClicks() {
  return Object.fromEntries(COMMAND_CLICKS.map((key) => [key, false])) as Record<CommandClick, boolean>;
}

export function useCommandClicks() {
  const [commandClicks, setCommandClicks] = useState<Record<CommandClick, boolean>>(blankCommandClicks);
  const markCommandClicked = useCallback((command: CommandClick) => setCommandClicks((clicks) => ({ ...clicks, [command]: true })), []);
  const resetCommandClicks = useCallback(() => setCommandClicks(blankCommandClicks()), []);

  return {
    commandClicks,
    markCommandClicked,
    resetCommandClicks
  };
}
