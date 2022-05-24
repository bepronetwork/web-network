import { subMilliseconds } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import * as IssueQueries from "graphql/issue";
import * as RepositoryQueries from "graphql/repository";

import twitterTweet from "helpers/api/handle-twitter-tweet";

import api from "services/api";
import DAO from "services/dao-service";

import { GraphQlResponse } from "types/octokit";

const { publicRuntimeConfig } = getConfig();

async function get(req: NextApiRequest, res: NextApiResponse) {
  const customNetworks = await models.network.findAll({
    where: {
      name: {
        [Op.notILike]: `%${publicRuntimeConfig?.networkConfig?.networkName
}%`
      }
    }
  });

  const networks = [
    {
      id: 1,
      name: publicRuntimeConfig?.networkConfig?.networkName
,
      networkAddress: publicRuntimeConfig?.contract?.address,
    },
    ...customNetworks
  ];

  const DAOService = new DAO(true);

  if (!await DAOService.start()) return res.status(500).json("Failed to connect with chain");

  for (const customNetwork of networks) {
    if (!customNetwork.name) return;

    console.log(`Moving issues of ${customNetwork.name} - ${customNetwork.networkAddress} to OPEN`);
    
    if (!await DAOService.loadNetwork(customNetwork.networkAddress)) 
      return res.status(500).json("Failed to load network contract");

    const network = DAOService.network;

    const redeemTime = (await network.draftTime());

    const where = {
      createdAt: { [Op.lt]: subMilliseconds(+new Date(), redeemTime) },
      network_id: customNetwork.id,
      state: "draft"
    };

    const issues = await models.issue.findAll({ where });

    const githubAPI = (new Octokit({ auth: publicRuntimeConfig?.github?.token })).graphql;

    let currentRepo = '';
    let labelId = null;

    for (const issue of issues) {
      try {
        const repoInfo = await models.repositories.findOne({
          where: { id: issue.repository_id }
        });

        const [owner, repo] = repoInfo.githubPath.split("/");

        if (currentRepo !== `${owner}/${repo}`) {
          currentRepo = `${owner}/${repo}`;

          const repositoryDetails = await githubAPI<GraphQlResponse>(RepositoryQueries.Details, {
            repo,
            owner
          });

          labelId = 
            repositoryDetails.repository.labels.nodes.find(label => label.name.toLowerCase() === "draft")?.id;
        }

        const issueDetails = await githubAPI<GraphQlResponse>(IssueQueries.Details, {
          repo,
          owner,
          issueId: +issue.githubId
        });

        await githubAPI(IssueQueries.RemoveLabel, {
          issueId: issueDetails.repository.issue.id,
          labelId: [labelId]
        });
      } catch (error) {
        // label not exists, ignoring
      }
      issue.state = "open";
      console.log(`Moved ${issue.issueId} to open`);
      await issue.save();

      if (network.contractAddress === publicRuntimeConfig?.contract?.address)
        twitterTweet({
          type: "bounty",
          action: "changes",
          issuePreviousState: "draft",
          issue
        });

      await api.post(`/seo/${issue.issueId}`).catch((e) => {
        console.log("Error creating SEO", e);
      });
    }
  }

  return res.status(200).json("Issues Moved to Open");
}

export default async function MoveToOpen(req: NextApiRequest,
                                         res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
