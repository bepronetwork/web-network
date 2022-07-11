import { Badge as ReactBadge } from "react-bootstrap";

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export default function Badge({
  label,
  color = "primary",
  className
}: BadgeProps) {
  return(
    <ReactBadge 
      className={className || "p-small family-Regular text-uppercase"}
      bg={color}
    >
      {label}
    </ReactBadge>
  );
}