import PullRequestDetailsView from "components/proposal/pull-request-details/view";

import { IssueBigNumberData, IssueData, PullRequest } from "interfaces/issue-data";

import { useNetwork } from "x-hooks/use-network";

interface ProposalPullRequestDetailsProps {
  pullRequest: PullRequest;
  issue: IssueData | IssueBigNumberData;
}

export default function ProposalPullRequestDetails({
  pullRequest,
  issue,
}: ProposalPullRequestDetailsProps) {
  const { getURLWithNetwork } = useNetwork();

  // TODO BEPRO-1679: Change pull request path /pull-request/[id]
  const pullRequestHref = getURLWithNetwork("pull-request", {
    id: issue?.id,
    repoId: "",
    prId: pullRequest?.githubId,
  });

  return(
    <PullRequestDetailsView
      githubId={pullRequest?.githubId}
      creatorGithubLogin={pullRequest?.githubLogin}
      branch={pullRequest?.userBranch}
      createdAt={pullRequest?.createdAt}
      isMerged={pullRequest?.merged}
      isMergeable={pullRequest?.isMergeable}
      pullRequestHref={pullRequestHref}
    />
  );
}