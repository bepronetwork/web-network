import Translation from "components/translation";

import PageActionsButton from "../action-button/view";

export default function CreateProposalButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <PageActionsButton
      className="read-only-button bounty-outline-button"
      onClick={onClick}
      disabled={disabled}
    >
      <Translation ns="proposal" label="actions.create" />
    </PageActionsButton>
  );
}
