import { graphql } from "@octokit/graphql";
import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Op } from "sequelize";

import models from "db/models";

import * as CommentsQueries from "graphql/comments";
import * as IssueQueries from "graphql/issue";

import { getPropertyRecursively } from "helpers/object";

import api from "services/api";

const { publicRuntimeConfig } = getConfig();

async function put(req: NextApiRequest, res: NextApiResponse) {
  const { issueId, githubLogin, networkName } = req.body;

  try {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        }
      }
    });

    if (!network) return res.status(404).json("Invalid network");

    const issue = await models.issue.findOne({
      where: { issueId, network_id: network.id }
    });

    if (!issue) return res.status(404).json("Issue not found");

    if (!issue.working.find((el) => el === String(githubLogin))) {
      const repository = await models.repositories.findOne({
        where: { id: issue.repository_id }
      });
      const [owner, repo] = repository.githubPath.split("/");

      issue.working = [...issue.working, githubLogin];

      await issue.save();

      const githubAPI = graphql.defaults({
        headers: {
          authorization: `token ${publicRuntimeConfig.github.token}`
        }
      });

      const issueDetails = await githubAPI(IssueQueries.Details, {
        repo,
        owner,
        issueId: +issue.githubId
      });

      const issueGithubId = issueDetails["repository"]["issue"]["id"];

      const commentEdge = getPropertyRecursively("node", await githubAPI(CommentsQueries.Create, {
        issueOrPullRequestId: issueGithubId,
        body: `@${githubLogin} is working on this.`
      }));
      
      const comment = {
        id: commentEdge["id"],
        body: commentEdge["body"],
        updatedAt: commentEdge["updatedAt"],
        author: commentEdge["author"]["login"]
      };

      await api.post(`/seo/${issue?.issueId}`).catch((e) => {
        console.log("Error creating SEO", e);
      });

      return res.status(200).json(comment);
    }

    return res.status(409).json("Already working");
  } catch (error) {
    return res
      .status(error.response?.status || 500)
      .json(error.response?.data || error);
  }
}

async function Working(req: NextApiRequest,
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

export default withCors(Working)