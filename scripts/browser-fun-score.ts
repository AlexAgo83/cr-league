import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

type Round = {
  profile: string;
  gp: number;
  position: number;
  fun: number;
  frustration: number;
  comprehension: number;
};

const rounds = numberArg("--rounds", 2);
const profiles = stringArg("--profiles", "sprinter,rain-reader,banker,closer").split(",").map((profile) => profile.trim()).filter(Boolean);
const reportPath = stringArg("--report", "reports/playtest/browser-fun-score.md");
const runDir = stringArg("--runs-dir", "reports/playtest/browser-fun-score-runs");
const rows: Round[] = [];

await mkdir(runDir, { recursive: true });
for (const profile of profiles) {
  const profileReport = `${runDir}/${profile}.md`;
  await run("npx", ["tsx", "scripts/browser-playtest.ts", "--rounds", String(rounds), "--profile", profile, "--report", profileReport]);
  rows.push(...parseRounds(profile, await readFile(profileReport, "utf8")));
}

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport(rows), "utf8");
console.log(`Browser fun score: ${profiles.length} profiles x ${rounds} GP`);
console.log(`Report: ${reportPath}`);

function parseRounds(profile: string, markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => /^\| \d+ \|/.test(line))
    .map((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      return {
        profile,
        gp: Number(cells[0]),
        position: Number(cells[6]?.replace("P", "")),
        fun: Number(cells[7]),
        frustration: Number(cells[8]),
        comprehension: Number(cells[9])
      };
    })
    .filter((row) => Number.isFinite(row.gp) && Number.isFinite(row.position) && Number.isFinite(row.fun) && Number.isFinite(row.frustration) && Number.isFinite(row.comprehension));
}

function renderReport(roundRows: Round[]) {
  const byProfile = profiles.map((profile) => {
    const profileRows = roundRows.filter((row) => row.profile === profile);
    return {
      profile,
      races: profileRows.length,
      avgPosition: avg(profileRows.map((row) => row.position)),
      avgFun: avg(profileRows.map((row) => row.fun)),
      avgFrustration: avg(profileRows.map((row) => row.frustration)),
      avgComprehension: avg(profileRows.map((row) => row.comprehension)),
      lowFun: profileRows.filter((row) => row.fun <= 4).length,
      lowComprehension: profileRows.filter((row) => row.comprehension <= 6).length
    };
  });
  return [
    "# Browser Fun And Comprehension Score",
    "",
    `- Date: ${new Date().toISOString()}`,
    `- Profiles: ${profiles.join(", ")}`,
    `- GP per profile: ${rounds}`,
    "",
    "## Summary",
    table(
      ["Profile", "Races", "Avg pos", "Avg fun", "Avg frustration", "Avg comprehension", "Fun <= 4", "Comprehension <= 6"],
      byProfile.map((row) => [row.profile, row.races, row.avgPosition, row.avgFun, row.avgFrustration, row.avgComprehension, row.lowFun, row.lowComprehension])
    ),
    "",
    "## Low Fun Rounds",
    table(
      ["Profile", "GP", "Position", "Fun", "Frustration", "Comprehension"],
      roundRows.filter((row) => row.fun <= 4 || row.comprehension <= 6).map((row) => [row.profile, row.gp, `P${row.position}`, row.fun, row.frustration, row.comprehension])
    )
  ].join("\n") + "\n";
}

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited with ${code ?? "unknown"}`)));
  });
}

function numberArg(name: string, fallback: number) {
  const value = Number(stringArg(name, String(fallback)));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function stringArg(name: string, fallback: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

function avg(values: number[]) {
  return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)) : 0;
}

function dirname(path: string) {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) || "." : ".";
}

function table(headers: string[], tableRows: Array<Array<string | number>>) {
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...tableRows.map((items) => `| ${items.join(" | ")} |`)].join("\n");
}
