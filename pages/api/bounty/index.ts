import { graphql } from "@octokit/graphql";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Op } from "sequelize";

import models from "db/models";

import * as IssueQueries from "graphql/issue";
import * as RepositoryQueries from "graphql/repository";


const { publicRuntimeConfig } = getConfig();

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

  const [owner, repo] = repository.githubPath.split("/");

  const githubAPI = graphql.defaults({
    headers: {
      authorization: `token ${publicRuntimeConfig.github.token}`,
      accept: "application/vnd.github.bane-preview+json"
    }
  });

  const repositoryDetails = await githubAPI(RepositoryQueries.Details, {
    repo,
    owner
  });

  const repositoryGithubId = repositoryDetails["repository"]["id"];
  let draftLabelId = null;

  if (!repositoryDetails["repository"]["labels"]["nodes"].length) {
    const createdLabel = await githubAPI(RepositoryQueries.CreateLabel, {
      name: "draft",
      repositoryId: repositoryGithubId,
      color: "cfd3d7"
    });

    draftLabelId = createdLabel["createLabel"]["label"]["id"];
  } else draftLabelId = repositoryDetails["repository"]["labels"]["nodes"][0]["id"];


  const createdIssue = await githubAPI(IssueQueries.Create, {
    repositoryId: repositoryGithubId,
    title,
    body,
    labelId: [draftLabelId]
  });

  const githubId = createdIssue["createIssue"]["issue"]["number"];

  if (await models.issue.findOne({ where: { githubId: `${githubId}`, repository_id: repository.id } }))
    return res.status(409).json("issueId already exists on database");

  await models.issue.create({
    issueId: `${repository.id}/${githubId}`,
    githubId: `${githubId}`,
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
