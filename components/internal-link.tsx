import { ReactElement, ReactNode, CSSProperties } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import { UrlObject } from "url";
interface InternalLinkProps {
  href: string | UrlObject;
  label?: string | number | ReactElement;
  className?: string;
  transparent?: boolean;
  nav?: boolean;
  active?: boolean;
  icon?: ReactNode;
  uppercase?: boolean;
  iconBefore?: boolean;
  activeClass?: string;
  blank?: boolean;
  brand?: boolean;
  style?: CSSProperties;
  outline?: boolean;
  title?: string;
}

export default function InternalLink({
  className = "",
  nav = false,
  transparent = false,
  active = undefined,
  iconBefore = false,
  uppercase = false,
  blank = false,
  brand = false,
  activeClass,
  style,
  outline,
  ...props
}: InternalLinkProps) {
  const { asPath, pathname } = useRouter();

  function getClasses(): string {
    const isActive =
      active ||
      asPath.endsWith(String(props.href)) ||
      pathname === (props.href as UrlObject).pathname;

    let classes = `${className}`;

    if (!isActive && nav) classes += " text-gray-500 text-gray-50-hover ";

    if (isActive && nav && activeClass) classes += " " + activeClass;

    if (transparent || nav) classes += " bg-transparent border-transparent ";

    if (uppercase) classes += " text-uppercase ";

    if (props.icon) classes += " d-flex align-items-center justify-content-center ";

    return `${(!nav && `btn btn-${outline && "outline-" || ""}primary`) || " main-nav-link "} ${
      brand ? "" : " text-gray-50 "
    } bg-opacity-100 text-decoration-none shadow-none ${classes}`;
  }

  return (
    <Link href={props.href} passHref>
      <a
        className={getClasses()}
        target={`${blank ? "_blank" : ""}`}
        style={{ ...style }}
        title={props?.title}
      >
        {(iconBefore && props.icon) || ""}
        {(props.label && <span>{props.label}</span>) || ""}
        {(!iconBefore && props.icon) || ""}
      </a>
    </Link>
  );
}
