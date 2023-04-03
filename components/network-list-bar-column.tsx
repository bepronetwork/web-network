import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";

export default function NetworkListBarColumn({
  hideOrder = false,
  isColumnActive,
  columnOrder = "asc",
  label,
  onClick,
  col = 3,
  className,
  labelWhite = false
}: {
  hideOrder: boolean;
  isColumnActive: boolean;
  columnOrder: string;
  label: string;
  onClick?: () => void;
  col?: number;
  className?: string;
  labelWhite?: boolean;
}) {
  const textClass = hideOrder
    ? "text-primary"
    : "text-light-gray text-gray-hover";
  const ArrowComponent =
    columnOrder === "desc" || !isColumnActive ? (
      <ArrowDown width={9.33} height={6.22} />
    ) : (
      <ArrowUp width={9.33} height={6.22} />
    );

  return (
    <div
      className={`col-${col} d-flex flex-row justify-content-start cursor-pointer align-items-center ${
        isColumnActive ? "text-primary" : textClass
      } ${className && className}`}
      onClick={onClick}
    >
      <span className={`${labelWhite ? 'text-white-30' : 'caption-medium'} mr-1`}>{label}</span>
      {(!hideOrder && ArrowComponent) || <></>}
    </div>
  );
}
