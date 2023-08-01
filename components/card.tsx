import { ReactNode } from "react";
import BootstrapCard from "react-bootstrap/Card";

interface CardProps {
  bg?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export default function Card({
  children,
  bg = "gray-900",
  bodyClassName,
  className
}: CardProps) {
  return(
    <BootstrapCard 
      bg={bg}
      className={`border border-radius-8 border-gray-800 p-1 ${className}`}
    >
      <BootstrapCard.Body className={bodyClassName}>
        {children}
      </BootstrapCard.Body>
    </BootstrapCard>
  );
}