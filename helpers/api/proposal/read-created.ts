import { Network_v2 } from "@taikai/dappkit";
import getConfig from "next/config";
import { Op } from "sequelize";

import models from "db/models";

import twitterTweet from "../handle-twitter-tweet";

const { publicRuntimeConfig } = getConfig()

export default async function readProposalCreated(events, network: Network_v2, customNetwork) {
  const created = [];

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

          const user = await models.user.findOne({
            where: {
              address: {
                [Op.iLike]: networkProposal.creator.toLowerCase()
              }
            }
          });

          if (!proposal) {
            await models.mergeProposal.create({
              scMergeId: networkProposal.id,
              issueId: bounty.id,
              pullRequestId: pullRequest.id,
              githubLogin: user?.githubLogin,
              contractId: networkProposal.id,
              creator: networkProposal.creator
            });

            created.push(networkProposal.id);
        
            if (network.contractAddress === publicRuntimeConfig.contract.address)
              twitterTweet({
                type: "proposal",
                action: "created",
                issue: bounty
              });
          }
        }
      }

    } catch(error) {
      console.error("Failed to read BountyProposalCreated: ", { bountyId, prId,  proposalId}, error);
    }
  }

  return created;
}