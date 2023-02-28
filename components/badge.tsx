import { CSSProperties, ReactElement } from "react";
import { Badge as ReactBadge } from "react-bootstrap";

interface BadgeProps {
  label?: string;
  color?: string;
  className?: string;
  children?: ReactElement;
  style?: CSSProperties;
}

export default function Badge({
  label,
  color = "primary",
  className,
  children,
  style
}: BadgeProps) {
  return(
    <ReactBadge 
      className={className || "p-small family-Regular text-uppercase"}
      bg={style ? null : color} 
      style={style}
    >
      {label ? label : children}
    </ReactBadge>
  );
}