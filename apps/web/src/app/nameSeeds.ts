import { TEAM_NAME_SUGGESTIONS } from "@cr-league/shared";

const LEAGUE_NAMES = [
  "Neon Apex League",
  "Turbo Canal Cup",
  "Voltage Derby",
  "Night Grid Series",
  "Harbor Dash Club",
  "Pulse Circuit League",
  "Metro Sprint Cup",
  "Rainline Racing",
  "Switchback Trophy",
  "Skyline GP Club",
  "Dockside Duel",
  "Rapid Loop League",
  "Battery Row Cup",
  "Overtake Society",
  "Storm Brake Series",
  "Gridlight Trophy",
  "Urban Torque Cup",
  "Pitlane Rebels",
  "Charge Point League",
  "Curbside Classic",
  "Final Lap Union",
  "Pocket Rocket Cup",
  "Apex Signal League",
  "Wetline Challenge",
  "Short Track Syndicate",
  "Tarmac Voltage Cup",
  "Late Brake League",
  "Slipstream Social",
  "Greenlight Rally",
  "City Pulse GP",
  "Micro Sprint League",
  "Rooftop Racing Cup",
  "Crosswalk Clash",
  "Rain Mode Series",
  "Fast Lane Foundry",
  "Midnight Sector Cup",
  "Boost Bay League",
  "Gridlock Grand Prix",
  "Relay Racing Club",
  "Torque Alley Cup",
  "Terminal Sprint",
  "Canal Charge Series",
  "Sharp Corner League",
  "Downtown Draft Cup",
  "Switchyard GP",
  "Last Meter League",
  "Flashpoint Trophy",
  "Signal Sprint Cup",
  "Inner Ring Series",
  "Metro Apex Club"
];

export function randomLeagueName() {
  return pick(LEAGUE_NAMES);
}

export function randomTeamName() {
  return pick(TEAM_NAME_SUGGESTIONS);
}

function pick(values: readonly string[]) {
  return values[Math.floor(Math.random() * values.length)] ?? values[0] ?? "";
}
