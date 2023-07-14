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

  const pullRequestHref = getURLWithNetwork("pull-request", {
    id: issue?.githubId,
    repoId: issue?.repository_id,
    prId: pullRequest?.githubId,
  });

  return(
    <PullRequestDetailsView
      githubId={pullRequest?.githubId}
      creatorGithubLogin={pullRequest?.githubLogin}
      branch={pullRequest?.userBranch}
      repositoryPath={issue?.repository?.githubPath}
      createdAt={pullRequest?.createdAt}
      isMerged={pullRequest?.merged}
      isMergeable={pullRequest?.isMergeable}
      pullRequestHref={pullRequestHref}
    />
  );
}