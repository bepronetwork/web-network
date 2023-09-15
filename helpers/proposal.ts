import { addSeconds } from "date-fns";

import { IssueBigNumberData, IssueData } from "interfaces/issue-data";

export function isProposalDisputable(createdAt: Date | number, disputableTime: number, chainTime?: number): boolean {
  return (chainTime && new Date(chainTime) || (new Date())) <= addSeconds(new Date(createdAt), disputableTime);
}

/**
 * @returns <number> 0: No ready PRs, 1: Invalid proposals, 2: Valid proposals, 3: No proposals
 * @throws Error
 */
export const bountyReadyPRsHasNoInvalidProposals = (bounty: IssueData | IssueBigNumberData) : number => {
  const readyPRsIds = bounty.deliverables.filter(pr => pr.markedReadyForReview && !pr.canceled).map(pr => pr.id);

  if (!readyPRsIds.length) return 0;

  const readyPRsWithoutProposals = readyPRsIds.filter(pr => !bounty.mergeProposals.find(p => p.deliverableId === pr));

  if (readyPRsWithoutProposals.length) return 3;

  const proposalsWithDisputeState = bounty.mergeProposals.filter(p => readyPRsIds.includes(p.deliverableId));

  const invalidProposals = proposalsWithDisputeState.filter(p =>  p.isDisputed || p.refusedByBountyOwner);

  if (invalidProposals.length && proposalsWithDisputeState.length === invalidProposals.length) return 1;

  return 2;
}