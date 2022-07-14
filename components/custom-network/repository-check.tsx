import CloseIcon from "assets/icons/close-icon";

interface GithubInfoProps {
  label: string;
  color?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function RepositoryCheck({
  label,
  color,
  disabled,
  active = false,
  onClick
}: GithubInfoProps) {
  const XIcon = <CloseIcon width={8} height={8} />;

  const classes = [
    "d-flex flex-row align-items-center gap-2",
    "max-width-content caption-small font-weight-normal py-1 px-2 border-radius-4",
    active && "bg-primary" || "bg-dark-gray",
    disabled && "cursor-not-allowed" || "cursor-pointer"
  ];

  function handleClick(event) {
    event.stopPropagation();

    if (!disabled) onClick?.();
  }

  return (
    <div key={label} className={classes.join(" ")} onClick={handleClick}>
      {XIcon}
      <span>{label}</span>
      {active && XIcon}
    </div>
  );
}
