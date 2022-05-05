import getConfig from "next/config";
import { Op } from "sequelize";

import * as IssueQueries from "graphql/issue";
import * as PullRequestQueries from "graphql/pull-request";

import { Bus } from "helpers/bus";

import api from "services/api";

import twitterTweet from "./handle-twitter-tweet";


const { publicRuntimeConfig } = getConfig()

export default async function readCloseIssues(events,
                                              { network, models, octokit, res, customNetworkId }) {
  for (const event of events) {
    const eventData = event.returnValues;
    // Merge PR and close issue on github
    const issueId = await network
      .getIssueById(eventData.id)
      .then(({ cid }) => cid);
    const issue = await models.issue.findOne({
      where: { issueId, network_id: customNetworkId },
      include: ["mergeProposals"]
    });

    if (!issue || issue?.state === "closed") {
      console.log(`Emitting closeIssue:created:${issueId}`);
      Bus.emit(`closeIssue:created:${issueId}`, issue);
      console.log("Failed to find an issue to close or already closed", event);
      return res.status(204);
    }

    const merge = issue?.mergeProposals?.find((mp) => mp.scMergeId == eventData.mergeID);
    const mergeProposal = await models.mergeProposal.findOne({
      where: { id: merge.id },
      include: ["pullRequest"]
    });

    const pullRequest = mergeProposal.pullrequest;

    const repoInfo = await models.repositories.findOne({
      where: { id: issue?.repository_id }
    });
    const [owner, repo] = repoInfo.githubPath.split("/");

    const issueDetails = await octokit(IssueQueries.Details, {
      repo,
      owner,
      issueId: +issue.githubId
    });

    const issueGithubId = issueDetails["repository"]["issue"]["id"];

    const pullRequestDetails = await octokit(PullRequestQueries.Details, {
      repo,
      owner,
      id: +pullRequest.githubId
    });

    const pullRequestGithubId = pullRequestDetails["repository"]["pullRequest"]["id"];


    await octokit(PullRequestQueries.Merge, {
      pullRequestId: pullRequestGithubId
    });

    await octokit(IssueQueries.Close, {
      issueId: issueGithubId
    });

    const pullRequests = await models.pullRequest.findAll({
      where: {
        issueId: issue.id,
        githubId: { [Op.not]: pullRequest.githubId }
      },
      raw: true
    });

    for (const pr of pullRequests) {
      try {
        const pullRequestDetails = await octokit(PullRequestQueries.Details, {
          repo,
          owner,
          id: +pr.githubId
        });

        const pullRequestGithubId = pullRequestDetails["repository"]["pullRequest"]["id"];

        await octokit(PullRequestQueries.Close, {
          pullRequestId: pullRequestGithubId
        });
      } catch (e) {
        console.error(`Failed to update pull for ${pr.githubId}`, e);
      }
    }

    issue.merged = mergeProposal.scMergeId;
    issue.state = "closed";
    await issue.save();

    if (network.contractAddress === publicRuntimeConfig.contract.address)
      twitterTweet({
        type: "bounty",
        action: "distributed",
        issue
      });

    await api.post(`/seo/${issueId}`).catch((e) => {
      console.log("Error creating SEO", e);
    });
    console.log(`Emitting closeIssue:created:${issueId}`);
    Bus.emit(`closeIssue:created:${issueId}`, issue);
  }
  if (events.length) return res.status(200);
  else return res.status(204);
}
