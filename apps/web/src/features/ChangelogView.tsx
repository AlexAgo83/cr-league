import type { Translator } from "../app/helpers.js";

const changelogFiles = import.meta.glob("../../../../changelogs/CHANGELOGS_*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const CHANGELOGS = Object.entries(changelogFiles)
  .map(([path, text]) => {
    const version = path.match(/CHANGELOGS_(\d+_\d+_\d+)\.md$/)?.[1]?.replaceAll("_", ".") ?? "0.0.0";
    return { version, title: titleOf(text, version), lines: bodyLines(text) };
  })
  .sort((left, right) => compareVersions(left.version, right.version));

export function ChangelogView({ currentVersion, tt }: { currentVersion: string; tt: Translator }) {
  return (
    <div className="plan-view changelog-view">
      <section className="panel changelog-hero">
        <span className="section-kicker">{tt("changelog_kicker")}</span>
        <h2>{tt("changelog_title")}</h2>
        <p>{tt("changelog_current", { version: currentVersion })}</p>
      </section>
      <div className="changelog-list">
        {CHANGELOGS.map((entry) => (
          <article key={entry.version} className="panel changelog-entry">
            <header>
              <span>v{entry.version}</span>
              <h3>{entry.title}</h3>
            </header>
            <ChangelogBody lines={entry.lines} />
          </article>
        ))}
      </div>
    </div>
  );
}

function ChangelogBody({ lines }: { lines: string[] }) {
  return (
    <div className="changelog-body">
      {lines.map((line, index) => {
        const key = `${index}-${line}`;
        if (line.startsWith("## ")) return <h4 key={key}>{line.slice(3)}</h4>;
        if (line.startsWith("- ")) return <p key={key} className="changelog-bullet">{cleanInline(line.slice(2))}</p>;
        return <p key={key}>{cleanInline(line)}</p>;
      })}
    </div>
  );
}

function titleOf(text: string, version: string) {
  return bodyLines(text).find((line) => !line.startsWith("## ") && !line.startsWith("- "))?.replace(/\s+release for CR League\.$/i, "") ?? `CR League ${version}`;
}

function bodyLines(text: string) {
  let skip = false;
  return text
    .split(/\r?\n/)
    .filter((line) => {
      if (line.startsWith("# ")) return false;
      if (/^##\s+Validation\s*$/i.test(line)) {
        skip = true;
        return false;
      }
      if (skip && line.startsWith("## ")) skip = false;
      return !skip && line.trim();
    });
}

function cleanInline(text: string) {
  return text.replace(/`([^`]+)`/g, "$1");
}

function compareVersions(left: string, right: string) {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const diff = (rightParts[index] ?? 0) - (leftParts[index] ?? 0);
    if (diff) return diff;
  }
  return 0;
}
