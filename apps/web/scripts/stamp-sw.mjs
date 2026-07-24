// Stamp sw.js with the built app bundle hash so the service worker file changes
// exactly when the app changes — that byte difference is what makes the browser
// detect an update and surface the "Update app" button. No change => same hash => no false prompt.
import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const dist = new URL("../dist/", import.meta.url);
const html = await readFile(new URL("index.html", dist), "utf8");
const match = html.match(/assets\/index-([^.]+)\.js/);
const build = match ? match[1] : "dev";

const swPath = new URL("sw.js", dist);
const original = await readFile(swPath, "utf8");
const stamped = original.replaceAll("__BUILD__", build);

assert(stamped.includes(`crl-shell-${build}`), "stamp failed: CACHE_VERSION token not replaced");
assert(!stamped.includes("__BUILD__"), "stamp failed: leftover __BUILD__ token");

await writeFile(swPath, stamped);
console.log(`Stamped sw.js build=${build}`);
