import models from "db/models";
import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import api from "services/api";

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

      const octokit = new Octokit({
        auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
      });

      const response = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issue.githubId,
        body: `@${githubLogin} is working on this.`
      });

      await api.post(`/seo/${issue?.issueId}`).catch((e) => {
        console.log("Error creating SEO", e);
      });

      return res.status(response.status).json(response.data);
    }

    return res.status(409).json("Already working");
  } catch (error) {
    return res
      .status(error.response?.status || 500)
      .json(error.response?.data || error);
  }
}

export default async function Working(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method.toLowerCase()) {
    case "put":
      await put(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}
