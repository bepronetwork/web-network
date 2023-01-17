import { ReactElement } from "react";

export default function CardItem({ children, onClick }: {
    children?: ReactElement;
    onClick?: () => void;
}) {
  return (
    <div
      className="bg-shadow list-item p-3"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
