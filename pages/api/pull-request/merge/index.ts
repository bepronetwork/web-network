import {NextApiRequest, NextApiResponse} from "next";
import getConfig from "next/config";
import {Octokit} from "octokit";
import {Op} from "sequelize";

import models from "db/models";

import * as PullRequestQueries from "graphql/pull-request";

import {chainFromHeader} from "helpers/chain-from-header";
import {resJsonMessage} from "helpers/res-json-message";

import { withProtected } from "middleware";
import {WithValidChainId} from "middleware/with-valid-chain-id";

import DAO from "services/dao-service";

import {GraphQlResponse} from "types/octokit";

const { serverRuntimeConfig } = getConfig();

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { issueId, pullRequestId, mergeProposalId, address, networkName } =
    req.body;

  const chain = await chainFromHeader(req);

  try {
    const customNetwork = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
        },
        chain_id: {[Op.eq]: +chain?.chainId}
      }
    });

    if (!customNetwork || customNetwork?.isClosed)
      return resJsonMessage("Invalid network", res, 404);

    const issue = await models.issue.findOne({
      where: { issueId, network_id: customNetwork.id }
    });

    if (!issue) return resJsonMessage("Bounty not found", res, 404);

    const pullRequest = await models.pullRequest.findOne({
      where: { githubId: pullRequestId, issueId: issue.id }
    });

    if (!pullRequest) return resJsonMessage("Pull Request not found", res, 404);

    if (!chain.chainRpc)
      return resJsonMessage("Missing web3 provider url", res, 400);

    const DAOService = new DAO({ 
      skipWindowAssignment: true,
      web3Host: chain.chainRpc
    });

    if (!await DAOService.start())
      return resJsonMessage("Failed to connect with chain", res, 400);

    if (!await DAOService.loadNetwork(customNetwork.networkAddress))
      return resJsonMessage("Failed to load network contract", res, 400);

    const network = DAOService.network;

    await network.start();

    const issueBepro = await network.getBounty(issue.contractId);

    if (!issueBepro) return resJsonMessage("Bounty not found on network", res, 404);

    if (issueBepro.canceled || !issueBepro.closed)
      return resJsonMessage("Bounty canceled or not closed yet", res, 400);

    const proposal = issueBepro.proposals[mergeProposalId];

    if (!proposal) return resJsonMessage("Merge proposal not found", res, 400);

    const isCouncil = await network.getOraclesOf(address) >= await network.councilAmount();

    if (
      address.toLowerCase() !== issueBepro.creator.toLowerCase() &&
      address.toLowerCase() !== proposal.creator.toLowerCase() &&
      !isCouncil &&
      !proposal.details.find(({recipient}) => recipient.toLowerCase() === address.toLowerCase())
    )
      return res.status(403).json("Not authorized");

    const repository = await models.repositories.findOne({
      where: { id: issue.repository_id },
      raw: true
    });

    const [owner, repo] = repository.githubPath.split("/");

    const githubAPI = (new Octokit({ auth: serverRuntimeConfig?.github?.token })).graphql;

    const pullRequestDetails = await githubAPI<GraphQlResponse>(PullRequestQueries.Details, {
      repo,
      owner,
      id: +pullRequest.githubId
    });

    const pullRequestGithubId = pullRequestDetails.repository.pullRequest.id;


    const merged = await githubAPI<GraphQlResponse>(PullRequestQueries.Merge, {
      pullRequestId: pullRequestGithubId
    });

    return res.status(200).json(merged);
  } catch (error) {
    return res.status(error.status || 500).json(error.response?.data || error);
  }
}

async function PullRequest(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default withProtected(WithValidChainId(PullRequest));
