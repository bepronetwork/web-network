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
        !hide && "bg-gray-900" || ""
      } list-item border border-gray-800 ${
        variant ? "px-3 py-2 border-radius-4" : `p-3 p-list-item border-radius-8`
      } ${onClick && 'cursor-pointer' || ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
