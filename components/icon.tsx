import clsx from "clsx";
import { ComponentPropsWithRef, forwardRef } from "react";

interface Props extends ComponentPropsWithRef<"span"> {}

const Icon = forwardRef<HTMLSpanElement, Props>(function Icon(
  { className, ...props },
  ref,
) {
  return (
    <span ref={ref} className={clsx("material-icons", className)} {...props} />
  );
});

Icon.displayName = "Icon";
export default Icon;
