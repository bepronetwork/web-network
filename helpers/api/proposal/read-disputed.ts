import { Network_v2 } from "@taikai/dappkit";

import models from "db/models";

import { bountyReadyPRsHasNoInvalidProposals } from "./utils";

export default async function readProposalDisputed(events, network: Network_v2, customNetwork) {
  const disputed = [];

  for (const event of events) {
    const { bountyId, prId,  proposalId } = event.returnValues;

    try {
      const networkBounty = await network.getBounty(bountyId);
      const networkPullRequest = networkBounty.pullRequests.find(pr => +pr.id === +prId);
      const networkProposal = networkBounty.proposals.find(pr => +pr.id === +proposalId);

      const bounty =  await models.issue.findOne({
        where: {
          contractId: +networkBounty.id,
          issueId: networkBounty.cid,
          creatorAddress: networkBounty.creator,
          creatorGithub: networkBounty.githubUser,
          network_id: customNetwork.id
        },
        include: [
          { association: "token" }
        ]
      });

      if (bounty) {
        const pullRequest = await models.pullRequest.findOne({
          where: {
            issueId: bounty.id,
            contractId: +networkPullRequest.id,
            githubId: networkPullRequest.cid.toString()
          }
        });

        if (pullRequest) {
          const proposal = await models.mergeProposal.findOne({
            where: {
              pullRequestId: pullRequest.id,
              issueId: bounty.id,
              contractId: +networkProposal.id
            }
          });

          if (proposal) {
            disputed.push(networkProposal.id);

            const validation = await bountyReadyPRsHasNoInvalidProposals(networkBounty, network).catch(() => -1);
            let newState = bounty.state;

            if ([0, 1].includes(validation)) newState = "open";
            if ([2].includes(validation)) newState = "proposal";
            if ([3].includes(validation)) newState = "ready";

            if (newState !== bounty.state) {
              bounty.state = newState;
              await bounty.save();
            }
          }
        }
      }

    } catch(error) {
      console.error("Failed to read BountyProposalDisputed: ", { bountyId, prId,  proposalId}, error);
    }
  }

  return disputed;
}