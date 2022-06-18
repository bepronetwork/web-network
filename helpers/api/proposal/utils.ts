import { Network_v2 } from "@taikai/dappkit";
import { Bounty } from "@taikai/dappkit";

/**
 * @returns * -1: Error
 *  *  0 : No Ready PRs
 *  *  1: Ready PRs with invalid proposals
 *  *  2: Ready PRs with valid proposals
 *  *  3: Ready PRs without proposals
 */
export const bountyReadyPRsHasNoInvalidProposals = async (bounty: Bounty, network: Network_v2) : Promise<number> => {
  try {
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

    if (invalidProposals.length) return 1;

    return 2;
  } catch(error) {
    console.log("bountyReadyPRsHasNoInvalidProposals", error);
  }

  return -1;
}