import BigNumber from "bignumber.js";

import { bountyReadyPRsHasNoInvalidProposals } from "helpers/proposal";

import { IssueBigNumberData, IssueData } from "interfaces/issue-data";

export const OPEN_STATES = ["draft", "open", "ready", "proposal"];

export const pullRequestParser = (issue: IssueData) => 
  issue.pullRequests.map(pullRequest => ({
    ...pullRequest,
    createdAt: new Date(pullRequest.createdAt),
    updatedAt: new Date(pullRequest.updatedAt),
    isCancelable: !issue.mergeProposals?.some(proposal => proposal.pullRequestId === pullRequest.id)
  }));

export const mergeProposalParser = (issue: IssueData) => 
  issue.mergeProposals?.map(proposal => ({
    ...proposal,
    disputeWeight: BigNumber(proposal.disputeWeight),
    isMerged: issue.merged !== null && +proposal?.contractId === +issue.merged,
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
    }))
  }));

export const benefactorsParser = (issue: IssueData) =>
  issue.benefactors?.map(benefactor => ({
    ...benefactor,
    amount: BigNumber(benefactor.amount)
  }));

export const issueParser = (issue: IssueData, overwritePr = true) : IssueBigNumberData => ({
  ...issue,
  createdAt: new Date(issue.createdAt),
  updatedAt: new Date(issue.updatedAt),
  fundedAt: new Date(issue.fundedAt),
  isReady: issue?.mergeProposals && bountyReadyPRsHasNoInvalidProposals(issue) !== 0,
  amount: BigNumber(issue.amount),
  fundingAmount: BigNumber(issue.fundingAmount),
  fundedAmount: BigNumber(issue.fundedAmount),
  rewardAmount: BigNumber(issue.rewardAmount),
  pullRequests: (issue?.pullRequests && overwritePr) && pullRequestParser(issue),
  mergeProposals: issue?.mergeProposals && mergeProposalParser(issue),
  benefactors: issue?.benefactors && benefactorsParser(issue)
});