import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import * as PullRequestQueries from "graphql/pull-request";
import * as RepositoryQueries from "graphql/repository";

import { handleNetworkAddress } from "helpers/custom-network";
import paginate from "helpers/paginate";

import DAO from "services/dao-service";

import { GraphQlResponse } from "types/octokit";

const { serverRuntimeConfig } = getConfig();

interface propsWhere {
  githubLogin?: string | string[];
  issueId?: string | number;
  status?: { [ key: string ]: string[]; };
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { login, issueId, networkName } = req.query;
  const where = {} as propsWhere;

  if (login) where.githubLogin = login;

  if (issueId) {
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

    where.issueId = issue.id;
  }

  where.status = {
    [Op.notIn]: ["pending", "canceled"]
  };

  const prs = await models.pullRequest.findAndCountAll({
    ...paginate({ where }, req.query, [
      [req.query.sortBy || "updatedAt", req.query.order || "DESC"]
    ])
    // include
  });

  if (!issueId)
    for (const pr of prs.rows) {
      pr.issue = await models.issue.findOne({ where: { id: pr.issueId } });
    }

  return res.status(200).json(prs);
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {
    repoId: repository_id,
    githubId,
    title,
    description: body,
    username,
    branch
  } = req.body;

  const issue = await models.issue.findOne({
    where: { githubId, repository_id }
  });

  if (!issue) return res.status(404);

  const repoInfo = await models.repositories.findOne({
    where: { id: repository_id },
    raw: true
  });

  const [owner, repo] = repoInfo.githubPath.split("/");

  if(serverRuntimeConfig?.e2e === true) {

    await models.pullRequest.create({
      issueId: issue.id,
      githubId: `00`,
      githubLogin: username,
      branch,
      status: "pending"
    });

    return res.status(200).json({ 
      bountyId: issue.contractId,
      originRepo: repoInfo.githubPath,
      originBranch: issue.branch,
      originCID: issue.issueId,
      userRepo: `${username}/${repo}`,
      userBranch: branch,
      cid: `00`
    })
  }

  const githubAPI = (new Octokit({ auth: serverRuntimeConfig?.github?.token })).graphql;

  const repositoryDetails = await githubAPI<GraphQlResponse>(RepositoryQueries.Details, {
    repo,
    owner
  });

  const repositoryGithubId = repositoryDetails.repository.id;

  try {
    const created = await githubAPI<GraphQlResponse>(PullRequestQueries.Create, {
      repositoryId: repositoryGithubId,
      title,
      body,
      head: branch,
      base: issue.branch || serverRuntimeConfig?.github?.mainBranch,
      maintainerCanModify: false,
      draft: false
    });

    await models.pullRequest.create({
      issueId: issue.id,
      githubId: `${created.createPullRequest.pullRequest.number}`,
      githubLogin: username,
      branch,
      status: "pending"
    });

    /*twitterTweet({
      type: 'bounty',
      action: 'solution',
      username: username,
      issue
    })*/

    return res.status(200).json({ 
      bountyId: issue.contractId,
      originRepo: repoInfo.githubPath,
      originBranch: issue.branch,
      originCID: issue.issueId,
      userRepo: `${username}/${repo}`,
      userBranch: branch,
      cid: `${created.createPullRequest.pullRequest.number}`
    });
  } catch (error) {
    return res.status(error?.errors[0]?.type === "UNPROCESSABLE" && 422|| 500).json(error?.errors || error);
  }

}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const { 
    repoId: repository_id, 
    issueGithubId: githubId, 
    bountyId: contractId, 
    issueCid: issueId, 
    pullRequestGithubId, 
    customNetworkName,
    creator,
    userBranch
  } = req.body;

  const customNetwork = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(customNetworkName)
      }
    }
  });

  if (!customNetwork || customNetwork?.isClosed) return res.status(404).json("Invalid");

  const issue = await models.issue.findOne({
    where: {
      issueId,
      network_id: customNetwork.id,
      contractId,
      repository_id,
      githubId
    },
    include: [
      { association: "repository" }
    ]
  });

  if (!issue) return res.status(404).json("Invalid");

  const pullRequest = await models.pullRequest.findOne({
    where: {
      githubId: String(pullRequestGithubId),
      githubLogin: creator,
      branch: userBranch,
      status: "pending"
    }
  });

  if (!pullRequest) return res.status(404).json("Invalid");

  const DAOService = new DAO({ skipWindowAssignment: true });

  if (!await DAOService.start()) return res.status(500).json("Failed to connect with chain");

  if (!await DAOService.loadNetwork(handleNetworkAddress(customNetwork)))
    return res.status(500).json("Failed to load network contract");

  const network = DAOService.network;

  await network.start();

  const networkBounty = await network.getBounty(contractId);
  
  if (!networkBounty) return res.status(404).json("Invalid");

  
  const githubAPI = (new Octokit({ auth: serverRuntimeConfig?.github?.token })).graphql;

  const [owner, repo] = issue.repository.githubPath.split("/");

  const pullRequestDetails = await githubAPI<GraphQlResponse>(PullRequestQueries.Details, {
    repo,
    owner,
    id: +pullRequestGithubId
  });

  await githubAPI(PullRequestQueries.Close, {
    pullRequestId: pullRequestDetails.repository.pullRequest.id
  });

  await pullRequest.destroy();

  return res.status(200).json("Pull Request Canceled");
}

async function PullRequest(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  case "post":
    await post(req, res);
    break;

  case "delete":
    await del(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default  withCors(PullRequest);
