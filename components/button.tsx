import React, { ButtonHTMLAttributes } from "react";

import LockedIcon from "assets/icons/locked-icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  textClass?: string;
  outline?: boolean;
  transparent?: boolean;
  rounded?: boolean;
  asAnchor?: boolean;
  applyTextColor?: boolean;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  withLockIcon?: boolean;
  align?: "left" | "center" | "right";
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button({
  children,
  color = "primary",
  outline,
  transparent,
  rounded,
  className = "",
  asAnchor = false,
  applyTextColor = true,
  textClass,
  isLoading,
  align = "center",
  withLockIcon = false,
  ...rest
}: ButtonProps) {
  function getClass(): string {
    const type = `btn-${outline ? `outline-${color}` : color}`;
    const textColor =
      textClass || (!outline && color !== "white" && "text-white") || "";
    let append = className;

    if (transparent) append += " bg-transparent border-transparent";

    if (rounded) append += " circle-2 p-0";

    if (outline) append += " bg-opac-hover-25";

    return `btn ${type} ${
      applyTextColor ? textColor : ""
    } d-flex align-items-center justify-content-${align} text-uppercase shadow-none ${append}`;
  }

  function handleSpinner() {
    return isLoading && (<span className="spinner-border spinner-border-xs ml-1" />)
  }

  return (
    <>
      {!asAnchor ? (
        <button className={getClass()} {...rest}>
          {withLockIcon && <LockedIcon className="me-2" />}
          {children}
          {handleSpinner()}
        </button>
      ) : (
        <a className={getClass()}>
          {withLockIcon && <LockedIcon className="me-2" />}
          {children}
          {handleSpinner()}
        </a>
      )}
    </>
  );
}
