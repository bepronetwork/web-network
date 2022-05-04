import { Network_v2 } from "@taikai/dappkit";
import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import * as PullRequestQueries from "graphql/pull-request";

import networkBeproJs from "helpers/api/handle-network-bepro";


const { publicRuntimeConfig } = getConfig();

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { issueId, pullRequestId, mergeProposalId, address, networkName } =
    req.body;

  try {
    const customNetwork = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        }
      }
    });

    if (!customNetwork) return res.status(404).json("Invalid network");
    if (customNetwork.isClosed) return res.status(404).json("Invalid network");

    const issue = await models.issue.findOne({
      where: { issueId, network_id: customNetwork.id }
    });

    if (!issue) return res.status(404).json("Bounty not found");

    const pullRequest = await models.pullRequest.findOne({
      where: { githubId: pullRequestId, issueId: issue.id }
    });

    if (!pullRequest) return res.status(404).json("Pull Request not found");

    const network = networkBeproJs({
      contractAddress: customNetwork.networkAddress,
      version: 2
    }) as Network_v2;

    await network.start();

    const issueBepro = await network.getBounty(issue.contractId);

    if (!issueBepro) return res.status(404).json("Bounty not found on network");

    if (issueBepro.canceled || !issueBepro.closed)
      return res.status(400).json("Bounty canceled or not closed yet");

    const proposal = issueBepro.proposals[mergeProposalId];

    if (!proposal) return res.status(404).json("Merge proposal not found");

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

    const githubAPI = (new Octokit({ auth: publicRuntimeConfig.github.token })).graphql;

    const pullRequestDetails = await githubAPI(PullRequestQueries.Details, {
      repo,
      owner,
      id: +pullRequest.githubId
    });

    const pullRequestGithubId = pullRequestDetails["repository"]["pullRequest"]["id"];


    const merged = await githubAPI(PullRequestQueries.Merge, {
      pullRequestId: pullRequestGithubId
    });

    return res.status(200).json(merged);
  } catch (error) {
    return res.status(error.status || 500).json(error.response?.data || error);
  }
}

async function PullRequest(req: NextApiRequest,
                           res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}


export default withCors(PullRequest)