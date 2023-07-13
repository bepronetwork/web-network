import {NextApiRequest, NextApiResponse} from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import {Op, Sequelize} from "sequelize";

import models from "db/models";

import * as IssueQueries from "graphql/issue";

import { chainFromHeader } from "helpers/chain-from-header";
import { getPropertyRecursively } from "helpers/object";

import { IssueRoute } from "middleware/issue-route";

import { GraphQlQueryResponseData, GraphQlResponse } from "types/octokit";

const { serverRuntimeConfig } = getConfig();

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { ids: [repoId, ghId, networkName, chainName], chainId } = req.query;

  const issueId = [repoId, ghId].join("/");

  let network_id: number;

  const include = [
    { association: "developers" },
    { association: "pullRequests", where: { status: { [Op.notIn]: ["pending", "canceled"] } }, required: false },
    { association: "mergeProposals", include: [{ association: "distributions" }, { association: "disputes" }]  },
    { association: "repository" },
    { association: "transactionalToken" },
    { association: "rewardToken" },
    { association: "benefactors" },
    { association: "disputes" },
    { association: "network", include: [{ association: "chain", attributes: [ "chainShortName" ] }] },
  ];

  const chainHeader = await chainFromHeader(req);

  const chain = chainHeader && !chainName ? chainHeader : await models.chain.findOne({
    where: {
      chainShortName: Sequelize.where(Sequelize.fn("lower", Sequelize.col("chain.chainShortName")), 
                                      chainName?.toString()?.toLowerCase())
    }
  });

  if(networkName && (chainId || chain)) {

    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
        },
        chain_id: { [Op.eq]: chainId || chain?.chainId }
      }
    });

    if (!network) return res.status(404).json("Invalid network");

    network_id = network?.id;
  }

  const issue = await models.issue.findOne({
    where: {
      issueId,
      ... network_id ? { network_id } : {}
    },
    include
  });

  if (!issue) return res.status(404).json("Issue not found");

  return res.status(200).json(issue);
}

async function put(req: NextApiRequest, res: NextApiResponse) {
  const {
    ids: [repoId, ghId, networkName],
  } = req.query;

  const {
    body,
    tags
  } = req.body;

  const issueId = [repoId, ghId].join("/");

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
      }
    }
  });

  if (!network) return res.status(404).json({message:"Invalid network"});

  const issue = await models.issue.findOne({
    where: {
      issueId,
      network_id: network?.id
    },
    include: [{ association: "repository" }]
  });

  if (!issue) return res.status(404).json({message: "bounty not found"});

  if(issue.state === 'draft'){
    if(body) issue.body = body
    if(tags) issue.tags = tags
    await issue.save()

    const [owner, repo] = issue.repository.githubPath.split("/");

    const githubAPI = (new Octokit({ auth: serverRuntimeConfig?.github?.token })).graphql;

    const issueDetails = await githubAPI<GraphQlResponse>(IssueQueries.Details, {
      repo,
      owner,
      issueId: +issue.githubId
    });
  
    const issueGithubId = issueDetails.repository.issue.id;
    
    const updateIssue = getPropertyRecursively<GraphQlQueryResponseData>("node",
                                                                         await githubAPI(IssueQueries.Update, {
                                                                            body: body,
                                                                            issueId: issueGithubId,
                                                                         }));

    return res.status(200).json(updateIssue);
  } else{
    return res.status(400).json({message: 'bounty not in draft'})
  } 
}

async function IssuesMethods(req: NextApiRequest,
                             res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;
  case "put":
    await put(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default IssueRoute(IssuesMethods)
