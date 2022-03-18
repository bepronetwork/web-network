import { ComponentPropsWithRef, forwardRef } from "react";

import clsx from "clsx";

type Props = ComponentPropsWithRef<"span">;

const Icon = forwardRef<HTMLSpanElement, Props>(function Icon({ className, ...props },
  ref) {
  return (
    <span ref={ref} className={clsx("material-icons", className)} {...props} />
  );
});

Icon.displayName = "Icon";
export default Icon;
