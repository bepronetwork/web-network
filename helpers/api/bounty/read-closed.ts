import { Network_v2 } from "@taikai/dappkit";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import api from "services/api";

import twitterTweet from "../handle-twitter-tweet";

const { publicRuntimeConfig } = getConfig()

export default async function readBountyClosed(events, network: Network_v2, customNetwork) {
  const closedBounties = [];

  for (const event of events) {
    const { id, proposalId } = event.returnValues;

    try {
      const networkBounty = await network.getBounty(id);

      const bounty = await models.issue.findOne({
        where: {
          contractId: id,
          issueId: networkBounty.cid,
          network_id: customNetwork.id
        },
        include: [
          { association: 'repository' }
        ]
      });

      if (bounty && networkBounty.closed && !networkBounty.canceled) {
        const proposal = await models.mergeProposal.findOne({
          where: {
            issueId: bounty.id,
            contractId: proposalId
          }
        });

        if (proposal) {
          const pullRequest = await models.pullRequest.findOne({
            where: {
              id: proposal.pullRequestId,
              issueId: proposal.issueId
            }
          });

          if (pullRequest) {
            const [owner, repo] = bounty.repository.githubPath.split("/");
            
            const octokit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN });

            await octokit.rest.pulls.merge({
              owner,
              repo,
              pull_number: pullRequest?.githubId
            });
            
            await octokit.rest.issues.update({
              owner,
              repo,
              issue_number: bounty.githubId,
              state: "closed"
            });

            const pullRequests = await models.pullRequest.findAll({
              where: {
                issueId: bounty.id,
                githubId: { [Op.not]: pullRequest.githubId }
              },
              raw: true
            });
        
            for (const pr of pullRequests) {
              try {
                await octokit.rest.pulls.update({
                  owner,
                  repo,
                  pull_number: pr.githubId,
                  state: "closed"
                });
              } catch (e) {
                console.error(`Failed to update pull for ${pr.githubId}`, e);
              }
            }
        
            bounty.merged = proposal.scMergeId;
            bounty.state = "closed";
            await bounty.save();

            closedBounties.push(bounty.issueId);
        
            if (network.contractAddress === publicRuntimeConfig.address.contract)
              twitterTweet({
                type: "bounty",
                action: "distributed",
                issue: bounty
              });
        
            await api.post(`/seo/${bounty.issueId}`).catch((e) => {
              console.log("Error creating SEO", e);
            });
          }
        }
      }
    } catch(error) {
      console.error("Failed to read closed bounty", { id, proposalId }, error);
    }
  }

  return closedBounties;
}