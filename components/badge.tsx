import { ReactElement } from "react";
import { Badge as ReactBadge } from "react-bootstrap";

interface BadgeProps {
  label?: string;
  color?: string;
  className?: string;
  children?: ReactElement
}

export default function Badge({
  label,
  color = "primary",
  className,
  children
}: BadgeProps) {
  return(
    <ReactBadge 
      className={className || "p-small family-Regular text-uppercase"}
      bg={color} 
    >
      {label ? label : children}
    </ReactBadge>
  );
}