import {ReactElement, ReactNode} from "react";

export interface TabbedNavigationItem {
  eventKey: string;
  title: string | ReactElement;
  isEmpty?: boolean;
  component: ReactNode;
  description?: string;
}

export interface TabbedNavigationProps {
  className?: string;
  forceActiveKey?: string;
  collapsable?: boolean;
  tabs: TabbedNavigationItem[];
  defaultActiveKey?: string;
  onTransition?: (goingTo: string) => void;
}
