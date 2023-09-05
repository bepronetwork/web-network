import {NextApiRequest, NextApiResponse} from "next";
import getConfig from "next/config";
import {Op} from "sequelize";

import models from "db/models";

import {chainFromHeader} from "helpers/chain-from-header";
import paginate from "helpers/paginate";
import {resJsonMessage} from "helpers/res-json-message";

import {LogAccess} from "middleware/log-access";
import {WithValidChainId} from "middleware/with-valid-chain-id";
import WithCors from "middleware/withCors";

import DAO from "services/dao-service";

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
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
        },
        // chain_id: {[Op.eq]: +chain?.chainId}
      }
    });

    if (!network || network?.isClosed) return resJsonMessage("Invalid network", res, 404);


    const issue = await models.issue.findOne({
      where: { issueId, network_id: network.id }
    });

    if (!issue) return resJsonMessage("Issue not found", res, 404);

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
    issueGithubID: githubId,
    title,
    description: body,
    username,
    branch,
    networkName
  } = req.body;

  const chain = await chainFromHeader(req);

  const customNetwork = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
      },
      chain_id: { [Op.eq]: +chain?.chainId }
    }
  });

  if (!customNetwork || customNetwork?.isClosed)
    return resJsonMessage("Invalid network", res, !customNetwork ? 404 : 400);

  const issue = await models.issue.findOne({
    where: { githubId, repository_id }
  });

  if (!issue) return res.status(404);

  const repoInfo = await models.repositories.findOne({
    where: { id: repository_id },
    raw: true
  });

  const [, repo] = repoInfo.githubPath.split("/");

  // todo move this to a setup script on webnetwork-e2e project instead
  if(serverRuntimeConfig?.e2eEnabled === true) {

    await models.pullRequest.create({
      issueId: issue.id,
      githubId: `00`,
      githubLogin: username,
      branch,
      status: "pending",
      network_id: customNetwork?.id,
      userRepo: `${username}/${repo}`,
      userBranch: branch,
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

  try {
    const pullRequest = await models.pullRequest.create({
      issueId: issue.id,
      githubLogin: username,
      branch,
      status: "pending",
      network_id: customNetwork?.id,
      userRepo: `${username}/${repo}`,
      userBranch: branch,
    });

    return res.status(200).json({ 
      bountyId: issue.contractId,
      originRepo: repoInfo.githubPath,
      originBranch: issue.branch,
      originCID: issue.issueId,
      userRepo: `${username}/${repo}`,
      userBranch: branch,
      pullRequestId: pullRequest.id
    });
  } catch (error) {
    return res.status(error?.errors[0]?.type === "UNPROCESSABLE" && 422|| 500).json(error?.errors || error);
  }

}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const {  
    bountyId,
    pullRequestId, 
    customNetworkName
  } = req.body;

  const chain = await chainFromHeader(req);

  const customNetwork = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(customNetworkName)
      },
      // chain_id: {[Op.eq]: +chain?.chainId}
    }
  });

  if (!customNetwork || customNetwork?.isClosed)
    return resJsonMessage("Invalid", res, 404);

  const issue = await models.issue.findOne({
    where: {
      id: bountyId,
      network_id: customNetwork.id
    }
  });

  if (!issue) return res.status(404).json("Invalid");

  const pullRequest = await models.pullRequest.findOne({
    where: {
      id: pullRequestId,
      status: "pending",
      network_id: customNetwork.id,
    }
  });

  if (!pullRequest) return resJsonMessage("Invalid", res, 404);

  const DAOService = new DAO({ 
    skipWindowAssignment: true,
    web3Host: chain?.chainRpc
  });

  if (!await DAOService.start()) return resJsonMessage("Failed to connect with chain", res, 400);

  if (!await DAOService.loadNetwork(customNetwork.networkAddress))
    return resJsonMessage("Failed to load network contract", res, 400);

  const network = DAOService.network;

  await network.start();

  const networkBounty = await network.getBounty(issue.contractId);
  
  if (!networkBounty) return resJsonMessage("Bounty not found", res, 404);

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
export default  LogAccess(WithCors(WithValidChainId(PullRequest)));
