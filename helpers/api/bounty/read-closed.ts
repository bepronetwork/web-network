import { Network_v2 } from "@taikai/dappkit";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import * as IssueQueries from "graphql/issue";
import * as PullRequestQueries from "graphql/pull-request";

import api from "services/api";

import { GraphQlResponse } from "types/octokit";

import twitterTweet from "../handle-twitter-tweet";

const { publicRuntimeConfig } = getConfig();

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
            
            const githubAPI = (new Octokit({ auth: publicRuntimeConfig.github.token })).graphql;

            const issueDetails = await githubAPI<GraphQlResponse>(IssueQueries.Details, {
              repo,
              owner,
              issueId: +bounty.githubId
            });

            const issueGithubId = issueDetails.repository.issue.id;

            const pullRequestDetails = await githubAPI<GraphQlResponse>(PullRequestQueries.Details, {
              repo,
              owner,
              id: +pullRequest.githubId
            });
  
            const pullRequestGithubId = pullRequestDetails.repository.pullRequest.id;


            await githubAPI(PullRequestQueries.Merge, {
              pullRequestId: pullRequestGithubId
            });

            await githubAPI(IssueQueries.Close, {
              issueId: issueGithubId
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
                const pullRequestDetails = await githubAPI<GraphQlResponse>(PullRequestQueries.Details, {
                  repo,
                  owner,
                  id: +pr.githubId
                });
      
                const pullRequestGithubId = pullRequestDetails.repository.pullRequest.id;
      
                await githubAPI(PullRequestQueries.Close, {
                  pullRequestId: pullRequestGithubId
                });
              } catch (e) {
                console.error(`Failed to update pull for ${pr.githubId}`, e);
              }
            }
        
            bounty.merged = proposal.scMergeId;
            bounty.state = "closed";
            await bounty.save();
            await Promise.all(networkBounty?.proposals?.[0].details.map(async(detail) =>
              await models.userPayments.create({
                address: detail?.['recipient'],
                ammount: Number((detail?.['percentage'] / 100) * networkBounty?.tokenAmount) || 0,
                issueId:  bounty?.id,
                transactionHash: event?.transactionHash || null
              })))

            closedBounties.push(bounty.issueId);
        
            if (network.contractAddress === publicRuntimeConfig.contract.address)
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