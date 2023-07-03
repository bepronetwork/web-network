import Translation from "components/translation";

import PageActionsButton from "../action-button/view";

export default function CreatePullRequestButton({
    onClick,
    disabled
}: {
    onClick: () => void;
    disabled?: boolean;
}) {
  return (
    <PageActionsButton
      onClick={onClick}
      className={"read-only-button bounty-outline-button"}
      disabled={disabled}
    >
      <span>
        <Translation ns="pull-request" label="actions.create.title" />
      </span>
    </PageActionsButton>
  );
}
