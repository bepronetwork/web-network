import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import * as CommentsQueries from "graphql/comments";
import * as IssueQueries from "graphql/issue";

const { publicRuntimeConfig } = getConfig();

async function put(req: NextApiRequest, res: NextApiResponse) {
  const { issueId, pullRequestId, githubLogin, body, networkName } = req.body;

  try {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        }
      }
    });

    if (!network) return res.status(404).json("Invalid network");
    if (network.isClosed) return res.status(404).json("Invalid network");

    const issue = await models.issue.findOne({
      where: { issueId, network_id: network.id }
    });

    if (!issue) return res.status(404).json("Issue not found");

    const pullRequest = await models.pullRequest.findOne({
      where: { githubId: pullRequestId, issueId: issue.id }
    });

    if (!pullRequest) return res.status(404).json("Pull Request not found");

    const repository = await models.repositories.findOne({
      where: { id: issue.repository_id }
    });

    const [owner, repo] = repository.githubPath.split("/");

    const githubAPI = (new Octokit({ auth: publicRuntimeConfig.github.token })).graphql;

    const issueDetails = await githubAPI(IssueQueries.Details, {
      repo,
      owner,
      issueId: +issue.githubId
    });

    const issueGithubId = issueDetails["repository"]["issue"]["id"];

    const review = await githubAPI(CommentsQueries.Create, {
      issueOrPullRequestId: issueGithubId,
      body: `<p>@${githubLogin} reviewed this with the following message:</p><p>${body}</p>`
    });
    
    if (!pullRequest.reviewers.find((el) => el === String(githubLogin))) {
      pullRequest.reviewers = [...pullRequest.reviewers, githubLogin];

      await pullRequest.save();
    }

    return res.status(200).json(review);
  } catch (error) {
    return res.status(error.status || 500).json(error.response?.data || error);
  }
}

async function PullRequestReview(req: NextApiRequest,
                                 res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "put":
    await put(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default  withCors(PullRequestReview)