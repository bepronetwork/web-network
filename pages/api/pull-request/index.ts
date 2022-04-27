import { Network_v2 } from "@taikai/dappkit";
import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import networkBeproJs from "helpers/api/handle-network-bepro";
import paginate from "helpers/paginate";

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { login, issueId, networkName } = req.query;
  const where = {} as any;

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

  const octoKit = new Octokit({ auth: publicRuntimeConfig.github.token });

  const options = {
    accept: "application/vnd.github.v3+json",
    owner,
    repo,
    title,
    body,
    head: `${username}:${branch}`,
    base: issue.branch || serverRuntimeConfig.github.mainBranch,
    maintainer_can_modify: false,
    draft: false
  };

  try {
    const created = await octoKit.rest.pulls.create(options);

    await models.pullRequest.create({
      issueId: issue.id,
      githubId: created.data?.number,
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
      cid: created.data?.number 
    });
  } catch (error) {
    return res.status(error.response.status).json(error.response.data);
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
    userBranch,
    userRepo
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

  const network = networkBeproJs({
    contractAddress: customNetwork.name.toLowerCase() === publicRuntimeConfig.networkConfig.networkName.toLowerCase() ? 
      publicRuntimeConfig.contract.address : customNetwork.networkAddress,
    version: 2
  }) as Network_v2;

  await network.start();

  const networkBounty = await network.getBounty(contractId);
  
  if (!networkBounty) return res.status(404).json("Invalid");

  const pullRequestNetwork = networkBounty.pullRequests.find(pr => pr.cid ===  +pullRequestGithubId && 
                                                              pr.userBranch === userBranch && 
                                                              pr.userRepo === userRepo );
  
  if (!pullRequestNetwork)
    return res.status(404).json("Invalid");

  const octoKit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN });

  const [owner, repo] = issue.repository.githubPath.split("/");

  await octoKit.rest.pulls.update({
    owner,
    repo,
    pull_number: pullRequestGithubId,
    state: "closed"
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
