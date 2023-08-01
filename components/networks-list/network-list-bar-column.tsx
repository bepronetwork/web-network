import ChevronDownIcon from "assets/icons/chevrondown-icon";
import ChevronUpIcon from "assets/icons/chevronup-icon";

export default function NetworkListBarColumn({
  hideOrder = false,
  isColumnActive,
  columnOrder = "asc",
  label,
  onClick,
  className,
  labelWhite = false
}: {
  hideOrder: boolean;
  isColumnActive: boolean;
  columnOrder: string;
  label: string;
  onClick?: () => void;
  className?: string;
  labelWhite?: boolean;
}) {
  const textClass = hideOrder
    ? "text-primary"
    : "text-light-gray text-gray-hover";
  const ArrowComponent =
    columnOrder === "desc" || !isColumnActive ? (
      <ChevronDownIcon width={9.33} height={6.22} />
    ) : (
      <ChevronUpIcon width={9.33} height={6.22} />
    );

  return (
    <div
      className={`col cursor-pointer ${
        isColumnActive ? "text-primary" : textClass
      } ${className && className}`}
      onClick={onClick}
    >
      <div className="d-flex justify-content-center align-items-center">
        <span className={`${labelWhite ? 'text-white-30' : 'caption-medium'} mr-1`}>{label}</span>
        {(!hideOrder && ArrowComponent) || <></>}
      </div>
    </div>
  );
}
