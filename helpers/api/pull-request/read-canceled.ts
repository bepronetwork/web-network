
import { Network_v2 } from "@taikai/dappkit";
import getConfig from "next/config";
import { Octokit } from "octokit";

import models from "db/models";

import * as CommentsQueries from "graphql/comments";
import * as PullRequestQueries from "graphql/pull-request";

const { publicRuntimeConfig } = getConfig();

export default async function readPullRequestCanceled(events, network: Network_v2, customNetwork) {
  const canceled: string[] = [];

  for(const event of events) {
    const { bountyId, pullRequestId } = event.returnValues;

    try {
      const networkBounty = await network.getBounty(bountyId);
      const networkPullRequest = networkBounty.pullRequests[pullRequestId];

      const bounty = await models.issue.findOne({
        where: {
          issueId: networkBounty.cid,
          contractId: bountyId,
          network_id: customNetwork.id
        }
      });

      if (bounty) {
        const pullRequest = await models.pullRequest.findOne({
            where: {
                issueId: bounty.id,
                githubId: networkPullRequest.cid.toString(),
                contractId: networkPullRequest.id
            }
        });

        if (pullRequest) {
          pullRequest.status = "canceled";

          await pullRequest.save();

          const [owner, repo] = networkPullRequest.originRepo.split("/");

          const githubAPI = (new Octokit({ auth: publicRuntimeConfig.github.token })).graphql;

          const pullRequestDetails = await githubAPI(PullRequestQueries.Details, {
            repo,
            owner,
            id: +pullRequest.githubId
          });

          const pullRequestGithubId = pullRequestDetails["repository"]["pullRequest"]["id"];

          await githubAPI(PullRequestQueries.Close, {
            pullRequestId: pullRequestGithubId
          });

          const body = `This pull request was closed by @${pullRequest.githubLogin}`;

          await githubAPI(CommentsQueries.Create, {
            issueOrPullRequestId: pullRequestGithubId,
            body
          });

          canceled.push(pullRequest.githubId);

          if (!networkBounty.pullRequests.find(pr => pr.ready && !pr.canceled)) {
            bounty.state = "open";

            await bounty.save();
          }
        }
      }

    } catch (error) {
      console.error(`[ERROR_BOUNTY] Failed to save ${bountyId} from past-events`, event, error);
    }
  }

  return canceled;
}