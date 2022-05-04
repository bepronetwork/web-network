import { Network } from "@taikai/dappkit";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import networkBeproJs from "helpers/api/handle-network-bepro";
import readCloseIssues from "helpers/api/read-close-issues";
const { publicRuntimeConfig } = getConfig()

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { fromBlock, id, networkName } = req.body;
  
  const githubAPI = (new Octokit({ auth: publicRuntimeConfig.github.token })).graphql;

  const customNetwork = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  });

  if (!customNetwork) return res.status(404).json("Invalid network");
  if (customNetwork.isClosed) return res.status(404).json("Invalid network");

  const network = networkBeproJs({
    contractAddress: customNetwork.networkAddress
  }) as Network;

  await network.start();

  await network
    .getCloseIssueEvents({ fromBlock, toBlock: +fromBlock + 1, filter: { id } })
    .then((events) =>
      readCloseIssues(events, {
        network,
        models,
        octokit: githubAPI,
        res,
        customNetworkId: customNetwork.id
      }))
    .catch((error) => {
      console.log("Error reading CloseIssue", error);
      return res.status(400);
    });
}

export default async function ParseCloseIssue(req: NextApiRequest,
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
