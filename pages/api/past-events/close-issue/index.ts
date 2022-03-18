import models from "db/models";
import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import networkBeproJs from "helpers/api/handle-network-bepro";
import readCloseIssues from "helpers/api/read-close-issues";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { fromBlock, id, networkName } = req.body;
  const octokit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN });

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
  });

  await network.start();

  await network
    .getCloseIssueEvents({ fromBlock, toBlock: +fromBlock + 1, filter: { id } })
    .then((events) =>
      readCloseIssues(events, {
        network,
        models,
        octokit,
        res,
        customNetworkId: customNetwork.id
      })
    )
    .catch((error) => {
      console.log("Error reading CloseIssue", error);
      return res.status(400);
    });
}

export default async function ParseCloseIssue(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method.toLowerCase()) {
    case "post":
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}
