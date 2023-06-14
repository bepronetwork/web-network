import Translation from "components/translation";

import useBreakPoint from "x-hooks/use-breakpoint";

import PageActionsButton from "../action-button/view";


export default function StartWorkingButton({
    onClick,
    isExecuting = false
}: {
    onClick: () => void;
    isExecuting?: boolean;
}) {
  const { isMobileView, isTabletView } = useBreakPoint();
  
  return (
    <PageActionsButton
      onClick={onClick}
      className={`read-only-button ${
        (isTabletView || isMobileView) ? "col-12" : "bounty-outline-button"
      }`}
      disabled={isExecuting}
      isLoading={isExecuting}
    >
      <span>
        <Translation ns="bounty" label="actions.start-working.title" />
      </span>
    </PageActionsButton>
  );
}
