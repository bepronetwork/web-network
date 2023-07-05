import Translation from "components/translation";

import PageActionsButton from "../action-button/view";

export default function ForkRepositoryLink({ path }:{path: string}) {
  return (
      <PageActionsButton
        forcePath={path}
        buttonType="github"
        className="btn btn-primary bounty-outline-button"
      >
        <Translation label="actions.fork-repository" />
      </PageActionsButton>
  );
}