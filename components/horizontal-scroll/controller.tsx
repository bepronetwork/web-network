import { ReactNode, useEffect, useRef, useState } from "react";

import HorizontalScrollView from "components/horizontal-scroll/view";

import useMouseHold from "x-hooks/use-mouse-hold";

interface HorizontalScrollProps {
  children?: ReactNode;
  className?: string;
}

type Direction = "left" | "right";

export default function HorizontalScroll({
  children,
  className
}: HorizontalScrollProps) {
  const divRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const HOLD_STEP = 2;
  const ARROW_WIDTH = 10;

  function updateCanScroll(entries) {
    const { isIntersecting, target } = entries.shift();

    const isFirstChild = target === target.parentNode?.firstChild;

    if (isFirstChild) setCanScrollLeft(!isIntersecting);
    else setCanScrollRight(!isIntersecting);
  }

  function handleScroll(direction: Direction) {
    return(() => {
      if (divRef.current) {
        const newScrollValue = divRef.current.scrollLeft + (direction === "left" ? -HOLD_STEP : HOLD_STEP);
        const maxScroll = divRef.current.scrollWidth - divRef.current.clientWidth;
  
        if (direction === "left" && newScrollValue >= -ARROW_WIDTH || 
            direction === "right" && newScrollValue <= (maxScroll + 2 * ARROW_WIDTH))
          divRef.current.scrollLeft = newScrollValue;
      }
    });
  }

  const mouseEventsLeft = useMouseHold(handleScroll("left"), { forceStop: !canScrollLeft });
  const mouseEventsRight = useMouseHold(handleScroll("right"), { forceStop: !canScrollRight });

  useEffect(() => {
    const observer = new IntersectionObserver(updateCanScroll, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0
    });

    const firstChild = divRef.current?.firstChild;
    const lastChild = divRef.current?.lastChild;

    if (firstChild) observer.observe(firstChild);
    if (lastChild) {
      observer.observe(lastChild);
      setCanScrollRight((lastChild.offsetLeft + lastChild.offsetWidth) > lastChild.parentElement?.clientWidth);
    }

    return () => {
      if (firstChild) observer.unobserve(firstChild);
      if (lastChild) observer.unobserve(lastChild);
    };
  }, [children]);

  return(
    <HorizontalScrollView
      className={className}
      canScrollLeft={canScrollLeft}
      canScrollRight={canScrollRight}
      mouseEventsLeft={mouseEventsLeft}
      mouseEventsRight={mouseEventsRight}
      divRef={divRef}
    >
      {children}
    </HorizontalScrollView>
  );
}