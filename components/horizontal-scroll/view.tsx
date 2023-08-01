import { MutableRefObject, ReactNode } from "react";

import ChevronRightMediumIcon from "assets/icons/chevron-right-medium-icon";
import ChevronLeftIcon from "assets/icons/chevronleft-icon";

import Button from "components/button";
import If from "components/If";

import { MouseEvents } from "types/utils";

interface HorizontalScrollViewProps {
  children?: ReactNode;
  className?: string;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  mouseEventsLeft: MouseEvents;
  mouseEventsRight: MouseEvents;
  divRef: MutableRefObject<HTMLDivElement>;
}

export default function HorizontalScrollView({
  children,
  className,
  canScrollLeft,
  canScrollRight,
  mouseEventsLeft,
  mouseEventsRight,
  divRef,
}: HorizontalScrollViewProps) {
  return(
    <div className="horizontal-scroll">
      <If condition={canScrollLeft}>
        <Button 
          className="leftButton p-0 rounded-0 h-100 border-0 d-xl-none"
          {...mouseEventsLeft}
        >
          <ChevronLeftIcon />
        </Button>
      </If>
      
      <div className={`row flex-nowrap overflow-auto overflow-noscrollbar ${className}`} ref={divRef}>
        {children}
      </div>

      <If condition={canScrollRight}>
        <Button 
          className="rightButton p-0 rounded-0 h-100 border-0 d-xl-none"
          {...mouseEventsRight}
        >
          <ChevronRightMediumIcon />
        </Button>
      </If>
    </div>
  );
}