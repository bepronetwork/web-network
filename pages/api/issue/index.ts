import { graphql } from "@octokit/graphql";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Op } from "sequelize";

import models from "db/models";

import * as IssueQueries from "graphql/issue";
import * as RepositoryQueries from "graphql/repository";

import twitterTweet from "helpers/api/handle-twitter-tweet";

import api from "services/api";

import { GraphQlResponse } from "types/octokit";

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

  const githubAPI = (new Octokit({ auth: publicRuntimeConfig.github.token })).graphql;

  const repositoryDetails = await githubAPI<GraphQlResponse>(RepositoryQueries.Details, {
    repo,
    owner
  });

  const repositoryGithubId = repositoryDetails.repository.id;
  let draftLabelId = null;

  if (!repositoryDetails.repository.labels.nodes.length) {
    const createdLabel = await githubAPI<GraphQlResponse>(RepositoryQueries.CreateLabel, {
      name: "draft",
      repositoryId: repositoryGithubId,
      color: "cfd3d7",
      headers: {
        accept: "application/vnd.github.bane-preview+json"
      }
    });

    draftLabelId = createdLabel.createLabel.label.id;
  } else draftLabelId = repositoryDetails.repository.labels.nodes[0].id;


  const createdIssue = await githubAPI<GraphQlResponse>(IssueQueries.Create, {
    repositoryId: repositoryGithubId,
    title,
    body,
    labelId: [draftLabelId]
  });

  const githubId = createdIssue.createIssue.issue.number;

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

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const {
    repoId: repository_id,
    githubId,
    scId: issueId,
    networkName
  } = req.body;

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  });

  if (!network) return res.status(404).json("Invalid network");
  if (network.isClosed) return res.status(404).json("Invalid network");

  return models.issue
    .update({ issueId, state: "draft" },
            {
        where: {
          githubId: githubId,
          repository_id,
          issueId: null,
          network_id: network.id
        }
            })
    .then(async (result) => {
      if (!result[0]) return res.status(422).json("nok");

      const issue = await models.issue.findOne({
        where: { issueId }
      });
      await api.post(`/seo/${issueId}`).catch((e) => {
        console.log("Error creating SEO", e);
      });
      if (network.contractAddress === publicRuntimeConfig.contract.address)
        twitterTweet({
          type: "bounty",
          action: "created",
          issue
        });

      return res.status(200).json("ok");
    })
    .catch(() => res.status(422).json("nok"));
}

export default async function Issue(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  case "patch":
    await patch(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}
