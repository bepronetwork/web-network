import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {
    title,
    body,
    repositoryId,
    creator,
    networkName
  } = req.body;

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  });

  if (!network || network?.isClosed) return res.status(404).json("Invalid network");

  if (!creator) return res.status(422).json("Invalid Github user");

  const repository = await models.repositories.findOne({
    where: { id: repositoryId, network_id: network.id }
  });

  if (!repository) return res.status(404).json("Repository not found");

  const octokit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN });

  const [owner, repo] = repository.githubPath.split("/");

  const githubId = (
    await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
      labels: ["draft"]
    })
  )?.data?.number?.toString();

  if (await models.issue.findOne({ where: { githubId, repository_id: repository.id } }))
    return res.status(409).json("issueId already exists on database");

  await models.issue.create({
    issueId: `${repository.id}/${githubId}`,
    githubId,
    repository_id: repository.id,
    creatorAddress: '',
    creatorGithub: '',
    amount: 0,
    branch: '',
    state: "pending",
    title: '',
    body: body,
    network_id: network.id
  });

  return res.status(200).json(`${repository.id}/${githubId}`);
}

export default async function Bounty(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}
