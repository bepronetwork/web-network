import BigNumber from "bignumber.js";

import { bountyReadyPRsHasNoInvalidProposals } from "helpers/proposal";

import { IssueBigNumberData, IssueData, IssueDataComment, PullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

export const OPEN_STATES = ["draft", "open", "ready", "proposal"];

export const pullRequestParser = (pr: PullRequest, proposals?: Proposal[]) => ({
  ...pr,
  createdAt: new Date(pr.createdAt),
  updatedAt: new Date(pr.updatedAt),
  isCancelable: !proposals?.some(proposal => proposal.pullRequestId === pr.id)
});

export const mergeProposalParser = (proposal: Proposal, mergedProposal?: string) => ({
  ...proposal,
  disputeWeight: BigNumber(proposal.disputeWeight),
  isMerged: mergedProposal !== null && +proposal?.contractId === +mergedProposal,
  createdAt: new Date(proposal.createdAt),
  updatedAt: new Date(proposal.updatedAt),
  contractCreationDate: new Date(+proposal.contractCreationDate),
  distributions: proposal.distributions?.map(distribution => ({
    ...distribution,
    createdAt: new Date(distribution.createdAt),
    updatedAt: new Date(distribution.updatedAt)
  })),
  disputes: proposal.disputes?.map(dispute => ({
    ...dispute,
    createdAt: new Date(dispute.createdAt),
    updatedAt: new Date(dispute.updatedAt),
    weight: BigNumber(dispute.weight)
  })),
  pullRequest: proposal?.pullRequest ? pullRequestParser(proposal?.pullRequest, [proposal]) : undefined
});

export const benefactorsParser = (issue: IssueData) =>
  issue.benefactors?.map(benefactor => ({
    ...benefactor,
    amount: BigNumber(benefactor.amount)
  }));

export const issueParser = (issue: IssueData) : IssueBigNumberData => ({
  ...issue,
  createdAt: new Date(issue.createdAt),
  updatedAt: new Date(issue.updatedAt),
  fundedAt: new Date(issue.fundedAt),
  isReady: issue?.mergeProposals && bountyReadyPRsHasNoInvalidProposals(issue) !== 0,
  amount: BigNumber(issue.amount),
  fundingAmount: BigNumber(issue.fundingAmount),
  fundedAmount: BigNumber(issue.fundedAmount),
  rewardAmount: BigNumber(issue.rewardAmount),
  pullRequests: issue?.pullRequests && issue?.pullRequests?.map(p => pullRequestParser(p, issue?.mergeProposals)),
  mergeProposals: issue?.mergeProposals && issue?.mergeProposals?.map(p => mergeProposalParser(p, issue?.merged)),
  benefactors: issue?.benefactors && benefactorsParser(issue)
});

export const commentsParser = (comments: IssueDataComment[]) => {
  return comments.map(comment => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
    updatedAt: new Date(comment.updatedAt)
  }))
}