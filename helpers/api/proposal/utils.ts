import { Network_v2 } from "@taikai/dappkit";
import { Bounty } from "@taikai/dappkit";

/**
 * @returns <number> 0: No ready PRs, 1: Invalid proposals, 2: Valid proposals, 3: No proposals
 * @throws Error
 */
export const bountyReadyPRsHasNoInvalidProposals = async (bounty: Bounty, network: Network_v2) : Promise<number> => {
  const readyPRsIds = bounty.pullRequests.filter(pr => pr.ready).map(pr => pr.id);

  if (!readyPRsIds.length) return 0;

  const readyPRsWithoutProposals = readyPRsIds.filter(pr => !bounty.proposals.find(p => p.prId === pr));

  if (readyPRsWithoutProposals.length) return 3;

  const proposalsWithDisputeState = 
    await Promise.all(bounty.proposals
      .filter(p => readyPRsIds.includes(p.prId))
      .map(async p => ({
        ...p,
        isDisputed: await network.isProposalDisputed(bounty.id, p.id)
      })));

  const invalidProposals = proposalsWithDisputeState.filter(p =>  p.isDisputed || p.refusedByBountyOwner);

  if (invalidProposals.length && proposalsWithDisputeState.length === invalidProposals.length) return 1;

  return 2;
}