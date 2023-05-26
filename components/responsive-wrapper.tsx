import { ReactNode } from "react";

import clsx from "clsx";

interface ResponsiveWrapperProps {
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  xxl?: boolean;
  children?: ReactNode;
}

export default function ResponsiveWrapper({
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  children
} : ResponsiveWrapperProps) {
  function getClass(condition, ifTrue, ifFalse) {
    if (typeof condition === "boolean")
      return condition ? ifTrue : ifFalse;

    return "";
  }

  return(
    <div 
      className={clsx([
        getClass(xs, "d-flex", "d-none"),
        getClass(sm, "d-sm-flex", "d-sm-none"),
        getClass(md, "d-md-flex", "d-md-none"),
        getClass(lg, "d-lg-flex", "d-lg-none"),
        getClass(xl, "d-xl-flex", "d-xl-none"),
        getClass(xxl, "d-xxl-flex", "d-xxl-none"),
      ])}
    >
      {children}
    </div>
  );
}