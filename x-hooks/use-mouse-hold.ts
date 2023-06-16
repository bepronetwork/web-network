import { useEffect, useRef } from "react";

interface useMouseHoldProps {
  delay?: number;
  forceStop?: boolean;
}

export default function useMouseHold(fn: () => void, props: useMouseHoldProps = {
  delay: 5,
  forceStop: false,
}) {
  const intervalRef = useRef(null);

  const { delay, forceStop } = props;

  function onHold() {
    if (intervalRef.current || !fn) return;

    intervalRef.current = setInterval(() => {
      fn();
    }, delay);
  }

  function onUp() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => {
    if (forceStop) onUp();
  }, [forceStop]);

  return {
    onMouseDown: onHold,
    onTouchStart: onHold,
    onMouseUp: onUp,
    onMouseLeave: onUp,
    onTouchEnd: onUp,
  }
}