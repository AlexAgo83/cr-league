import { BoardIcon, type BoardIconName } from "./VisualIcon.js";

export type SectionSwitchItem<T extends string> = {
  key: T;
  label: string;
  displayLabel?: string;
  icon: BoardIconName;
};

export function SectionSwitch<T extends string>({
  label,
  items,
  activeKey,
  className = "",
  itemDataAttribute,
  onSelect
}: {
  label: string;
  items: Array<SectionSwitchItem<T>>;
  activeKey: T;
  className?: string;
  itemDataAttribute?: string;
  onSelect: (key: T) => void;
}) {
  return (
    <div className={`plan-steps section-switch ${className}`.trim()} role="tablist" aria-label={label}>
      {items.map((item) => {
        const active = activeKey === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-label={item.label}
            aria-selected={active}
            className={active ? "plan-step active" : "plan-step"}
            data-section-tab={item.key}
            title={item.label}
            {...(itemDataAttribute ? { [itemDataAttribute]: item.key } : {})}
            onClick={() => onSelect(item.key)}
          >
            <BoardIcon className="section-switch-icon" name={item.icon} />
            <span className="section-switch-label plan-step-label">{item.displayLabel ?? item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
