import { useState } from "react";
import { useT } from "../i18n/index.js";
import { BoardIcon } from "./VisualIcon.js";

const changelogFiles = import.meta.glob("../../../../changelogs/CHANGELOGS_*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const CHANGELOGS = Object.entries(changelogFiles)
  .map(([path, text]) => {
    const version = path.match(/CHANGELOGS_(\d+_\d+_\d+)\.md$/)?.[1]?.replaceAll("_", ".") ?? "0.0.0";
    return { version, title: titleOf(text, version), lines: bodyLines(text) };
  })
  .sort((left, right) => compareVersions(left.version, right.version));

/** Enough to see what changed lately without scrolling through a year of releases. */
const CHANGELOGS_SHOWN = 3;

export function ChangelogView({ currentVersion, onBack }: { currentVersion: string; onBack?: () => void }) {
  const tt = useT();
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? CHANGELOGS : CHANGELOGS.slice(0, CHANGELOGS_SHOWN);

  return (
    <div className="plan-view changelog-view">
      <section className="panel changelog-hero">
        {/* Reached from the profile menu, from either shell, and there was no way out of it. */}
        {onBack ? (
          <button type="button" className="secondary-button changelog-back" onClick={onBack}>
            <BoardIcon className="wheel-share-icon" name="previous-action" />
            {tt("changelog_back")}
          </button>
        ) : null}
        <span className="section-kicker">{tt("changelog_kicker")}</span>
        <h2>{tt("changelog_title")}</h2>
        <p>{tt("changelog_current", { version: currentVersion })}</p>
        {/* In the hero rather than under the list: three releases run to some three thousand pixels,
            and a button at the bottom of that is a button nobody finds. */}
        {showAll || CHANGELOGS.length <= CHANGELOGS_SHOWN ? null : (
          <button type="button" className="secondary-button changelog-more" onClick={() => setShowAll(true)}>
            {tt("changelog_show_all", { count: CHANGELOGS.length - CHANGELOGS_SHOWN })}
          </button>
        )}
      </section>
      <div className="changelog-list">
        {shown.map((entry) => (
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
  return text.match(/^#\s+(.+)$/m)?.[1] ?? `CR League ${version}`;
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
