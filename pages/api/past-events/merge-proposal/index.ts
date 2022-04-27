import models from "db/models";
import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import networkBeproJs from "helpers/api/handle-network-bepro";
import readMergeProposalCreated from "helpers/api/read-merge-proposal-created";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { fromBlock, id, pullRequestId: githubId, networkName } = req.body;

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
    .getMergeProposalCreatedEvents({
      fromBlock,
      toBlock: +fromBlock + 1,
      filter: { id }
    })
    .then((events) => {
      readMergeProposalCreated(events, {
        network,
        models,
        res,
        githubId,
        networkId: customNetwork.id
      });
    })
    .catch((error) => {
      console.log("Error reading MergeProposalCreated", error);
      res.status(400);
    });
}

export default async function ParseMergeCreateProposal(req: NextApiRequest,
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
