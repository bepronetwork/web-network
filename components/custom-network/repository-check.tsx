import clsx from "clsx";

import CloseIcon from "assets/icons/close-icon";

interface GithubInfoProps {
  label: string;
  hasIssues?: boolean;
  active?: boolean;
  usedByOtherNetwork?: boolean;
  mergeCommitAllowed?: boolean;
  userPermission?: "ADMIN" | "MAINTAIN" | "READ" | "TRIAGE" | "WRITE";
  onClick?: () => void;
}

export default function RepositoryCheck({
  label,
  hasIssues,
  usedByOtherNetwork,
  userPermission,
  active = false,
  mergeCommitAllowed,
  onClick
}: GithubInfoProps) {
  const XIcon = <CloseIcon width={8} height={8} className="opacity-75" />;
  const isDisabled = usedByOtherNetwork || hasIssues || userPermission && userPermission !== "ADMIN";
  const isActive = active && !isDisabled;

  const classes = clsx([
    "d-flex flex-row align-items-center gap-2",
    "max-width-content caption-small font-weight-normal py-1 px-2 border-radius-4",
    isDisabled && "cursor-not-allowed" || "cursor-pointer",
    {
      "bg-primary": isActive && mergeCommitAllowed,
      "bg-dark-gray": !isActive && !isDisabled,
      "bg-info": isDisabled && hasIssues,
      "bg-danger": isDisabled && usedByOtherNetwork,
      "bg-warning": (isDisabled && userPermission && userPermission !== "ADMIN") || !mergeCommitAllowed,

    }
  ]);

  function handleClick(event) {
    event.stopPropagation();

    if (!isDisabled) onClick?.();
  }

  return (
    <div key={label} className={classes} onClick={handleClick}>
      <span>{label}</span>
      {(active || isDisabled) && XIcon}
    </div>
  );
}
