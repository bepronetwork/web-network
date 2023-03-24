import { ReactElement } from "react";

export default function CardItem({ children, onClick }: {
    children?: ReactElement;
    onClick?: () => void;
}) {
  return (
    <div
      className="bg-gray-900 list-item p-3 border border-gray-800"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
