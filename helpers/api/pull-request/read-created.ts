
import { Network_v2 } from "@taikai/dappkit";
import getConfig from "next/config";
import { Octokit } from "octokit";

import models from "db/models";

import * as CommentsQueries from "graphql/comments";
import * as IssueQueries from "graphql/issue";

import { truncateAddress } from "helpers/truncate-address";

import { GraphQlResponse } from "types/octokit";

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export default async function readPullRequestCreated(events, network: Network_v2, customNetwork) {
  const created: string[] = [];

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
                status: "pending"
            }
        });

        if (pullRequest) {
          pullRequest.status = networkPullRequest.canceled ? "canceled" : 
            (networkPullRequest.ready ? "ready" : "draft");
          pullRequest.userRepo = networkPullRequest.userRepo;
          pullRequest.userBranch = networkPullRequest.userBranch;
          pullRequest.contractId = +networkPullRequest.id;

          await pullRequest.save();

          const [owner, repo] = networkPullRequest.originRepo.split("/");

          const issueLink = 
            `${publicRuntimeConfig?.urls?.home}/bounty?id=${bounty.githubId}&repoId=${bounty.repository_id}`;
          const creator = bounty?.creatorGithub ? "@"+bounty?.creatorGithub : truncateAddress(bounty?.creatorAddress)
          const body = 
            `${creator}, @${pullRequest.githubLogin} has a solution - [check your bounty](${issueLink})`;

          const githubAPI = (new Octokit({ auth: serverRuntimeConfig?.github?.token })).graphql;

          const issueDetails = await githubAPI<GraphQlResponse>(IssueQueries.Details, {
            repo,
            owner,
            issueId: +bounty.githubId
          });
    
          const issueGithubId = issueDetails.repository.issue.id;
    
          await githubAPI(CommentsQueries.Create, {
            issueOrPullRequestId: issueGithubId,
            body
          });

          created.push(pullRequest.githubId);
        }
      }

    } catch (error) {
      console.error(`[ERROR_BOUNTY] Failed to save ${bountyId} from past-events`, event, error);
    }
  }

  return created;
}