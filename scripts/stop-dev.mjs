import { execFileSync } from "node:child_process";

const ports = [4873, 4874];
const pids = new Set();

for (const port of ports) {
  try {
    const output = execFileSync("lsof", ["-ti", `tcp:${port}`], { encoding: "utf8" });
    for (const pid of output.split(/\s+/).filter(Boolean)) pids.add(Number(pid));
  } catch {
    // No listener on this port.
  }
}

if (!pids.size) {
  console.log("No CR League dev servers found on ports 4873/4874.");
  process.exit(0);
}

for (const pid of pids) {
  try {
    process.kill(pid, "SIGTERM");
    console.log(`Stopped dev server pid ${pid}.`);
  } catch {
    console.log(`Dev server pid ${pid} was already stopped.`);
  }
}
