import { Network_v2 } from "@taikai/dappkit";
import { BEPRO_NETWORK_NAME, CONTRACT_ADDRESS } from "env";
import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import models from "db/models";

import readBountyCreated from "helpers/api/bounty/read-created";
import networkBeproJs from "helpers/api/handle-network-bepro";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { fromBlock, id, networkName, toBlock } = req.body;

  const customNetwork = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  });

  if (!customNetwork || customNetwork?.isClosed) return res.status(404).json("Invalid network");

  const network = networkBeproJs({
    contractAddress: customNetwork.name.toLowerCase() === BEPRO_NETWORK_NAME.toLowerCase() ? 
      CONTRACT_ADDRESS : customNetwork.networkAddress,
    version: 2
  }) as Network_v2;

  await network.start();

  const events = await network.getBountyCreatedEvents({ 
    fromBlock, 
    toBlock: toBlock || (+fromBlock + 1), 
    filter: { id } 
  });

  const results = await readBountyCreated(events, network, customNetwork);

  return res.status(200).json(results);
}

export default async function BountyCreated(req: NextApiRequest,
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