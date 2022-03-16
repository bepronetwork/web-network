import React, { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  textClass?: string;
  outline?: boolean;
  transparent?: boolean;
  rounded?: boolean;
  upperCase?: boolean;
  asAnchor?: boolean;
  applyTextColor?: boolean;
}

export default function Button({
  children,
  color = "primary",
  outline,
  transparent,
  rounded,
  className = ``,
  asAnchor = false,
  applyTextColor = true,
  textClass,
  ...rest
}: ButtonProps) {
  function getClass(): string {
    const type = `btn-${outline ? `outline-${color}` : color}`;
    const textColor =
      textClass || (!outline && color !== "white" && "text-white") || ``;
    let append = className;

    if (transparent) append += " bg-transparent border-transparent";

    if (rounded) append += ` circle-2 p-0`;

    if (outline) append += ` bg-opac-hover-25`;

    return `btn ${type} ${
      applyTextColor ? textColor : ""
    } d-flex align-items-center justify-content-center text-uppercase shadow-none ${append}`;
  }

  return (
    <>
      {!asAnchor ? (
        <button className={getClass()} {...rest}>
          {children}
        </button>
      ) : (
        <a className={getClass()}>{children}</a>
      )}
    </>
  );
}
