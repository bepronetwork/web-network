
import getConfig from "next/config";

import { Bus } from "helpers/bus";

import twitterTweet from "./handle-twitter-tweet";
const { publicRuntimeConfig } = getConfig()

export default async function readMergeProposalCreated(events,
                                                       { network, models, res, githubId, networkId }) {
  for (const event of events) {
    const { id: scIssueId, mergeID: scMergeId, creator } = event.returnValues;
    const issueId = await network
      .getIssueById(scIssueId)
      .then(({ cid }) => cid);

    const issue = await models.issue.findOne({
      where: { issueId, network_id: networkId }
    });
    if (!issue)
      return console.log("Failed to find an issue to add merge proposal",
                         event);

    const user = await models.user.findOne({
      where: { address: creator.toLowerCase() }
    });
    if (!user)
      return console.log(`Could not find a user for ${creator}`, event);

    const pr = await models.pullRequest.findOne({
      where: { issueId: issue?.id, githubId }
    });
    if (!pr)
      return console.log(`Could not find PR for db-issue ${issue?.id}`, event);

    const mergeExists = await models.mergeProposal.findOne({
      where: { scMergeId, issueId: issue?.id, pullRequestId: pr?.id }
    });
    if (mergeExists) {
      Bus.emit(`mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`,
               mergeExists);
      return console.log(`Event was already parsed. mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`);
    }

    const merge = await models.mergeProposal.create({
      scMergeId,
      issueId: issue?.id,
      pullRequestId: pr?.id,
      githubLogin: user?.githubLogin
    });

    if (network.contractAddress === publicRuntimeConfig.contract.address)
      twitterTweet({
        type: "proposal",
        action: "created",
        issue
      });

    console.log("Emitting ",
                `mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`);
    Bus.emit(`mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`,
             merge);
    res.status(204);
  }
}
