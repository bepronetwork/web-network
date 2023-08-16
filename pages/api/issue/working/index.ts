import {NextApiRequest, NextApiResponse} from "next";
import getConfig from "next/config";
import {Octokit} from "octokit";
import {Op} from "sequelize";

import models from "db/models";

import * as CommentsQueries from "graphql/comments";
import * as IssueQueries from "graphql/issue";

import {chainFromHeader} from "helpers/chain-from-header";
import {getPropertyRecursively} from "helpers/object";

import { withProtected } from "middleware";
import {WithValidChainId} from "middleware/with-valid-chain-id";

import {Logger} from "services/logging";

import {GraphQlQueryResponseData, GraphQlResponse} from "types/octokit";

const { serverRuntimeConfig } = getConfig();

async function put(req: NextApiRequest, res: NextApiResponse) {
  const { issueId, githubLogin, networkName } = req.body;

  const chain = await chainFromHeader(req);

  try {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
        },
        chain_id: { [Op.eq]: +chain?.chainId }
      }
    });

    if (!network) return res.status(404).json({message: "Invalid network"});

    const issue = await models.issue.findOne({
      where: { issueId, network_id: network.id }
    });

    if (!issue) return res.status(404).json({message: "Issue not found"});

    if (!issue.working.find((el) => el === String(githubLogin))) {
      const repository = await models.repositories.findOne({
        where: { id: issue.repository_id }
      });
      const [owner, repo] = repository.githubPath.split("/");

      issue.working = [...issue.working, githubLogin];

      await issue.save();

      const githubAPI = (new Octokit({ auth: serverRuntimeConfig?.github?.token })).graphql;

      const issueDetails = await githubAPI<GraphQlResponse>(IssueQueries.Details, {
        repo,
        owner,
        issueId: +issue.githubId
      });

      const issueGithubId = issueDetails.repository.issue.id;

      const commentEdge = 
        getPropertyRecursively<GraphQlQueryResponseData>("node", await githubAPI(CommentsQueries.Create, {
          issueOrPullRequestId: issueGithubId,
          body: `@${githubLogin} is working on this.`
        }));
      
      const comment = {
        id: commentEdge.id,
        body: commentEdge.body,
        updatedAt: commentEdge.updatedAt,
        author: commentEdge.author.login
      };

      return res.status(200).json(comment);
    }

    return res.status(409).json({message: "Already working"});
  } catch (error) {
    return res
      .status(error.response?.status || 500)
      .json(error.response?.data || error);
  }
}

async function Working(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "put":
    await put(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

Logger.changeActionName(`Issue/Working`);
export default withProtected(WithValidChainId(Working));
