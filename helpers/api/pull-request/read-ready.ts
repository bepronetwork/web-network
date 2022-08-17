
import { Network_v2 } from "@taikai/dappkit";

import models from "db/models";

export default async function readPullRequestReady(events, network: Network_v2, customNetwork) {
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
                status: "draft"
            }
        });

        if (pullRequest) {
          pullRequest.status = networkPullRequest.canceled ? "canceled" : 
            (networkPullRequest.ready ? "ready" : "draft");
          pullRequest.userRepo = networkPullRequest.userRepo;
          pullRequest.userBranch = networkPullRequest.userBranch;
          pullRequest.contractId = +networkPullRequest.id;

          await pullRequest.save();

          bounty.state = "ready";

          await bounty.save();

          created.push(pullRequest.githubId);
        }
      }

    } catch (error) {
      console.error(`[ERROR_BOUNTY] Failed to save ${bountyId} from past-events`, event, error);
    }
  }

  return created;
}