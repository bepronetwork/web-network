import { Network_v2 } from "@taikai/dappkit";
import getConfig from "next/config";

import models from "db/models";

import twitterTweet from "../handle-twitter-tweet";

const { publicRuntimeConfig } = getConfig();

export default async function readProposalRefused(events, network: Network_v2, customNetwork) {
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
        }
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
            if (network.contractAddress === publicRuntimeConfig.contract.address) {
              twitterTweet({
                type: "proposal",
                action: "failed",
                issue: bounty
              });

              disputed.push(networkProposal.id);
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