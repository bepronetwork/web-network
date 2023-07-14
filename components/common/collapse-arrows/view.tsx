import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";

interface CollapseArrowsProps {
  isCollapsed?: boolean;
}

export default function CollapseArrows({
  isCollapsed
}: CollapseArrowsProps) {
  if (isCollapsed) return <ArrowDown width={14} height={14} />;

  return <ArrowUp width={14} height={14} />;
}