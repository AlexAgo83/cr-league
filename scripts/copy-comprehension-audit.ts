import { mkdir, readFile, writeFile } from "node:fs/promises";

type Locale = "en" | "fr";
type Issue = {
  locale: Locale;
  key: string;
  severity: "high" | "medium" | "low";
  reason: string;
  text: string;
};

const reportPath = stringArg("--report", "reports/ux/copy-comprehension.md");
const files: Record<Locale, string> = {
  en: "apps/web/src/i18n/en.json",
  fr: "apps/web/src/i18n/fr.json"
};
const jargon: Record<Locale, string[]> = {
  en: ["directive", "chrono", "pit wall", "stint"],
  fr: ["directive", "setup", "playtest", "panel", "replay", "pit", "chrono card", "micro-EV", "muret"]
};

const issues: Issue[] = [];
for (const locale of Object.keys(files) as Locale[]) {
  const entries = Object.entries(JSON.parse(await readFile(files[locale], "utf8")) as Record<string, string>);
  for (const [key, text] of entries) auditEntry(locale, key, text);
}

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, render(), "utf8");
console.log(`Copy comprehension audit: ${issues.length} issue(s)`);
console.log(`Report: ${reportPath}`);

function auditEntry(locale: Locale, key: string, text: string) {
  const words = text.replace(/\{[^}]+}/g, "").trim().split(/\s+/).filter(Boolean);
  const isBody = /(body|explainer|hint|help|intro|recommendation|report|summary|confirm|lesson|recap)/.test(key);
  const isShortUi = !isBody && /^(action|field|rail|race_step|trait_level|engine_stat|weather|segment)_/.test(key);
  const maxWords = isShortUi ? 5 : isBody ? 28 : 18;
  if (words.length > maxWords) add(locale, key, words.length > maxWords + 12 ? "high" : "medium", `${words.length} words; target <= ${maxWords}`, text);
  if (/[.?!]$/.test(text) && isShortUi) add(locale, key, "low", "Short UI label ends like a sentence", text);
  if (/\.\.\./.test(text)) add(locale, key, "low", "Uses three dots instead of ellipsis or a shorter loading label", text);
  if (/\b[A-Z]{3,}\b/.test(text) && !/\{[A-Z0-9_]+}/.test(text)) add(locale, key, "low", "All-caps word can read like shouting", text);
  for (const term of jargon[locale]) {
    if (new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(text)) add(locale, key, key.includes("title") ? "low" : "medium", `Possible jargon: "${term}"`, text);
  }
}

function add(locale: Locale, key: string, severity: Issue["severity"], reason: string, text: string) {
  issues.push({ locale, key, severity, reason, text });
}

function render() {
  const sorted = [...issues].sort((left, right) => rank(left.severity) - rank(right.severity) || left.locale.localeCompare(right.locale) || left.key.localeCompare(right.key));
  const summary = (locale: Locale, severity: Issue["severity"]) => issues.filter((issue) => issue.locale === locale && issue.severity === severity).length;
  return [
    "# Copy Comprehension Audit",
    "",
    `- Date: ${new Date().toISOString()}`,
    "",
    "## Summary",
    table(
      ["Locale", "High", "Medium", "Low"],
      (["en", "fr"] as Locale[]).map((locale) => [locale, summary(locale, "high"), summary(locale, "medium"), summary(locale, "low")])
    ),
    "",
    "## Findings",
    table(["Severity", "Locale", "Key", "Reason", "Text"], sorted.slice(0, 80).map((issue) => [issue.severity, issue.locale, issue.key, issue.reason, issue.text]))
  ].join("\n") + "\n";
}

function rank(severity: Issue["severity"]) {
  return severity === "high" ? 0 : severity === "medium" ? 1 : 2;
}

function stringArg(name: string, fallback: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

function dirname(path: string) {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) || "." : ".";
}

function table(headers: string[], rows: Array<Array<string | number>>) {
  // Backslash first, then the pipe: escaping only the pipe left `\|` in a cell reading as an escaped
  // backslash followed by a column break, which splits the row.
  const cell = (value: string | number) => String(value).replace(/[\\|]/g, "\\$&");
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((items) => `| ${items.map(cell).join(" | ")} |`)].join("\n");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
