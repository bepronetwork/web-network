import clsx from "clsx";

import { MiniTabsItem } from "types/components";

interface MiniTabsProps {
  items: MiniTabsItem[];
}

export default function MiniTabs({
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