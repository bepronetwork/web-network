import { ReactElement } from "react";

export default function CardItem({
  children,
  onClick,
  variant,
  hide = false
}: {
  children?: ReactElement;
  onClick?: () => void;
  variant?: "management";
  hide?: boolean;
}) {
  return (
    <div
      className={`${
        !hide && "bg-gray-900" || "bg-gray-950"
      } list-item border border-gray-800 ${
        variant ? "p-3 border-radius-4" : `p-3 p-list-item border-radius-8`
      } ${onClick && 'cursor-pointer' || ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
