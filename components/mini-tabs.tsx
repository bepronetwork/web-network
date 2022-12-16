import clsx from "clsx";

interface MiniTabsItem {
  onClick: () => void;
  label: string;
  active: boolean;
}

interface MiniTabsProps {
  items: MiniTabsItem[];
}

export function MiniTabs({
  items = []
} : MiniTabsProps) {
  return(
    <div className="mini-tabs">
      {items.map(item => (
        <div key={item.label} className={clsx("mini-tabs-item", item.active && "active")} onClick={item.onClick}>
        <span>{item.label}</span>
      </div>))}
    </div>
  );
}