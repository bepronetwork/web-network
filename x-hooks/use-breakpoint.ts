import { useEffect, useState } from "react";

import { useDebouncedCallback } from "use-debounce";

import { BOOTSTRAP_BREAKPOINTS } from "helpers/constants"

const isWindowUndefined = () => typeof window === "undefined";

const getCurrentBreakPoint = () => {
  if (isWindowUndefined()) return "xl";

  const currentWidth = window.innerWidth;

  if (currentWidth < BOOTSTRAP_BREAKPOINTS.sm) return "xs";
  else if (currentWidth < BOOTSTRAP_BREAKPOINTS.md) return "sm";
  else if (currentWidth < BOOTSTRAP_BREAKPOINTS.lg) return "md";
  else if (currentWidth < BOOTSTRAP_BREAKPOINTS.xl) return "lg";
  else if (currentWidth < BOOTSTRAP_BREAKPOINTS.xxl) return "xl";

  return "xxl";
}

const isMobileUserAgent = () => {
  if (isWindowUndefined()) return false;

  const mobileUserAgents = [/Android/i, /webOS/i, /iPhone/i,/iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];

  const userAgentMatch = agent => !!navigator.userAgent.match(agent);

  return mobileUserAgents.some(userAgentMatch);
}

export default function useBreakPoint(validateAgent = false) {
  const [currentBreakPoint, setCurrentBreakpoint] = useState<string>(getCurrentBreakPoint());
  const [userAgentCheck] = useState(validateAgent ? isMobileUserAgent() : true);

  const updateCurrentBreakpoint = () => setCurrentBreakpoint(getCurrentBreakPoint());
  const debouncedHandler = useDebouncedCallback(updateCurrentBreakpoint, 300);

  const isMobileView = ["xs", "sm"].includes(currentBreakPoint) && userAgentCheck;
  const isTabletView = ["lg", "md"].includes(currentBreakPoint)  && userAgentCheck;
  const isDesktopView = ["xl", "xxl"].includes(currentBreakPoint) && userAgentCheck;

  useEffect(() => {
    const observer = new ResizeObserver(debouncedHandler);
    
    observer.observe(document.documentElement);
    
    return () => observer.disconnect();
  }, []);

  return {
    currentBreakPoint,
    isMobileView,
    isTabletView,
    isDesktopView,
  };
}