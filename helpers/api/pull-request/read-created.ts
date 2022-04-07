
import { Network_v2 } from "@taikai/dappkit";
import { Octokit } from "octokit";

import models from "db/models";

import api from "services/api";

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
                githubId: networkPullRequest.cid,
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

          const octoKit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN });

          const [owner, repo] = networkPullRequest.originRepo.split("/");

          const issueLink = 
            `${process.env.NEXT_PUBLIC_HOME_URL}/bounty?id=${bounty.githubId}&repoId=${bounty.repository_id}`;
          const body = 
            `@${bounty.creatorGithub}, @${pullRequest.githubLogin} has a solution - [check your bounty](${issueLink})`;

          await octoKit.rest.issues.createComment({
            owner,
            repo,
            issue_number: bounty.githubId,
            body
          });

          bounty.state = "ready";


          await bounty.save();

          await api.post(`/seo/${bounty.issueId}`).catch((e) => {
            console.log("Error creating SEO", e);
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