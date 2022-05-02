
import { Network_v2 } from "@taikai/dappkit";
import getConfig from "next/config";
import { Octokit } from "octokit";

import models from "db/models";

import api from "services/api";

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

          const octoKit = new Octokit({ auth: publicRuntimeConfig.github.token });

          const [owner, repo] = networkPullRequest.originRepo.split("/");

          await octoKit.rest.pulls.update({
            owner,
            repo,
            pull_number: pullRequest.githubId,
            state: "closed"
          });

          const body = 
            `This pull request was closed by @${pullRequest.githubLogin}`;

          await octoKit.rest.issues.createComment({
            owner,
            repo,
            issue_number: pullRequest.githubId,
            body
          });

          canceled.push(pullRequest.githubId);
        }
      }

    } catch (error) {
      console.error(`[ERROR_BOUNTY] Failed to save ${bountyId} from past-events`, event, error);
    }
  }

  return canceled;
}