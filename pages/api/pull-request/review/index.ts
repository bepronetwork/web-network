import {NextApiRequest, NextApiResponse} from "next";
import getConfig from "next/config";
import {Octokit} from "octokit";
import {Op} from "sequelize";

import models from "db/models";

import * as PullRequestQueries from "graphql/pull-request";

import {chainFromHeader} from "helpers/chain-from-header";
import {resJsonMessage} from "helpers/res-json-message";

import { withProtected } from "middleware";
import {WithValidChainId} from "middleware/with-valid-chain-id";

import {error} from "services/logging";

import {GraphQlResponse} from "types/octokit";

const { serverRuntimeConfig } = getConfig();

async function put(req: NextApiRequest, res: NextApiResponse) {
  const { issueId, pullRequestId, githubLogin, body, networkName, event } = req.body;

  const chain = await chainFromHeader(req);

  try {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        },
        chain_id: {[Op.eq]: +chain?.chainId}
      }
    });

    if (!network || network?.isClosed)
      return resJsonMessage("Invalid network", res, 404);

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

    const githubAPI = (new Octokit({ auth: serverRuntimeConfig?.github?.token })).graphql;
    
    const pullRequestDetails = await githubAPI<GraphQlResponse>(PullRequestQueries.Details, {
      repo,
      owner,
      id: +pullRequest.githubId
    });
    
    const pullRequestGithubId = pullRequestDetails.repository.pullRequest.id;

    const response = await githubAPI<GraphQlResponse>(PullRequestQueries.AddReview, {
      pullRequestId: pullRequestGithubId,
      body: `<p>@${githubLogin} reviewed this Pull Request with the following message:</p><p>${body}</p>`,
      event: event.toUpperCase()
    });

    const { addPullRequestReview: { pullRequestReview } } = response;

    const review = {
      id: pullRequestReview.id,
      body: pullRequestReview.body,
      updatedAt: pullRequestReview.updatedAt,
      author: pullRequestReview.author.login
    }
    
    if (!pullRequest.reviewers.find((el) => el === String(githubLogin))) {
      pullRequest.reviewers = [...pullRequest.reviewers, githubLogin];

      await pullRequest.save();
    }

    return res.status(200).json(review);
  } catch (e) {
    error(e);
    return res.status(e.status || 500).json(e?.errors && {
      data: e.response?.data,
      errors: e.response?.error
    } || e);
  }
}

async function PullRequestReview(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "put":
    await put(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default withProtected(WithValidChainId(PullRequestReview));
