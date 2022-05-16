import { Badge as ReactBadge } from "react-bootstrap";

interface BadgeProps {
  label: string;
  color?: string;
}

export default function Badge({
  label,
  color = "primary"
}: BadgeProps) {
  return(
    <ReactBadge 
      className="p-small family-Regular text-uppercase" 
      bg={color}
    >
      {label}
    </ReactBadge>
  );
}