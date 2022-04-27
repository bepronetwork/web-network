import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import networkBeproJs from "helpers/api/handle-network-bepro";
const { publicRuntimeConfig } = getConfig()
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

    if (!issue) return res.status(404).json("Issue not found");

    const pullRequest = await models.pullRequest.findOne({
      where: { githubId: pullRequestId, issueId: issue.id }
    });

    if (!pullRequest) return res.status(404).json("Pull Request not found");

    const network = networkBeproJs({
      contractAddress: customNetwork.networkAddress
    });

    await network.start();

    const issueBepro = await network.getIssueByCID(issueId);

    if (!issueBepro) return res.status(404).json("Issue not found on network");

    if (issueBepro.canceled || !issueBepro.finalized)
      return res.status(400).json("Issue canceled or not closed yet");

    const mergeBepro = await network.getMergeById(issueBepro._id,
                                                  mergeProposalId);

    if (!mergeBepro) return res.status(404).json("Merge proposal not found");

    const isCouncil = await network.isCouncil(address);

    if (
      address.toLowerCase() !== issueBepro.issueGenerator.toLowerCase() &&
      address.toLowerCase() !== mergeBepro.proposalAddress.toLowerCase() &&
      !isCouncil &&
      !mergeBepro.prAddresses.find((el) => el.toLowerCase() === address.toLowerCase())
    )
      return res.status(403).json("Not authorized");

    const repository = await models.repositories.findOne({
      where: { id: issue.repository_id },
      raw: true
    });

    const [owner, repo] = repository.githubPath.split("/");

    const octoKit = new Octokit({ auth: publicRuntimeConfig.github.token });

    const octoResponse = await octoKit.rest.pulls.merge({
      owner,
      repo,
      pull_number: pullRequest?.githubId
    });

    return res.status(octoResponse.status).json(octoResponse.data);
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