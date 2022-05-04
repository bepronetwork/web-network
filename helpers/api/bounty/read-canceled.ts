
import { graphql } from "@octokit/graphql";
import { Network_v2 } from "@taikai/dappkit";
import getConfig from "next/config";

import models from "db/models";

import * as IssueQueries from "graphql/issue";

import twitterTweet from "helpers/api/handle-twitter-tweet";

import api from "services/api";


const { publicRuntimeConfig } = getConfig();

export default async function readBountyCanceled(events, network: Network_v2, customNetwork) {
  const canceledBounties: string[] = [];

  for(const event of events) {
    const { id } = event.returnValues;

    try {
      const networkBounty = await network.getBounty(id);

      const bounty = await models.issue.findOne({
        where: {
          contractId: id,
          issueId: networkBounty.cid,
          network_id: customNetwork.id
        }
      });
      
      if (bounty) {
        if (bounty.state !== "draft")
          console.warn(`[NOT_DRAFT_BOUNTY] ${bounty.issueId} is not in draft.`);
        else {
          const repository = await models.repositories.findOne({
            where: {
              githubPath: networkBounty.repoPath
            }
          });

          if (repository) {
            const [owner, repo] = repository.githubPath.split("/");

            const githubAPI = graphql.defaults({
              headers: {
                authorization: `token ${publicRuntimeConfig.github.token}`
              }
            });

            const issueDetails = await githubAPI(IssueQueries.Details, {
              repo,
              owner,
              issueId: +bounty.githubId
            });

            const issueGithubId = issueDetails["repository"]["issue"]["id"];

            await githubAPI(IssueQueries.Close, {
              issueId: issueGithubId
            });

            bounty.state = 'canceled';
          
            await bounty.save();

            canceledBounties.push(bounty.issueId);

            await api.post(`/seo/${networkBounty.cid}`).catch((e) => {
              console.log("Error creating SEO", e);
            });

            if (network.contractAddress === publicRuntimeConfig.contract.address)
              twitterTweet({
                type: "bounty",
                action: "changes",
                issuePreviousState: "draft",
                issue: bounty
              });
          }
        }
      }
    } catch (error) {
      console.error(`[ERROR_BOUNTY] Failed to cancel ${id} from past-events`, event, error);
    }
  }

  return canceledBounties;
}