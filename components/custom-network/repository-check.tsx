import CloseIcon from "assets/icons/close-icon";

interface GithubInfoProps {
  label: string;
  hasIssues?: boolean;
  active?: boolean;
  usedByOtherNetwork?: boolean;
  onClick?: () => void;
}

export default function RepositoryCheck({
  label,
  hasIssues,
  usedByOtherNetwork,
  active = false,
  onClick
}: GithubInfoProps) {
  const XIcon = <CloseIcon width={8} height={8} />;
  const isDisabled = usedByOtherNetwork || hasIssues;
  const isActive = active && !isDisabled;

  const ClassCondition = (condition, trueValue, falseValue = "") => condition && trueValue || falseValue;

  const classes = [
    "d-flex flex-row align-items-center gap-2",
    "max-width-content caption-small font-weight-normal py-1 px-2 border-radius-4",
    ClassCondition(isActive, "bg-primary"),
    ClassCondition(!isActive && !isDisabled, "bg-dark-gray"),
    ClassCondition(isDisabled && hasIssues, "bg-info"),
    ClassCondition(isDisabled && usedByOtherNetwork, "bg-danger"),
    ClassCondition(isDisabled, "cursor-not-allowed", "cursor-pointer")
  ];

  function handleClick(event) {
    event.stopPropagation();

    if (!isDisabled) onClick?.();
  }

  return (
    <div key={label} className={classes.join(" ")} onClick={handleClick}>
      {XIcon}
      <span>{label}</span>
      {(active || isDisabled) && XIcon}
    </div>
  );
}
