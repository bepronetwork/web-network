
import { Network_v2 } from "@taikai/dappkit";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Op } from "sequelize";

import models from "db/models";

import networkBeproJs from "helpers/api/handle-network-bepro";
import { ProposalHelpers } from "helpers/api/proposal";

const eventsMapping = {
  "created": ["getBountyProposalCreatedEvents", "readProposalCreated"],
  "disputed": ["getBountyProposalDisputedEvents", "readProposalDisputed"]
}

const { publicRuntimeConfig } = getConfig();

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { event } = req.query;
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
    contractAddress: customNetwork.name.toLowerCase() === publicRuntimeConfig.networkConfig.networkName.toLowerCase() ? 
      publicRuntimeConfig.contract.address : customNetwork.networkAddress,
    version: 2
  }) as Network_v2;

  await network.start();

  if (!eventsMapping[String(event)]) return res.status(404).json("Invalid event");

  const [contractMethod, apiMethod] = eventsMapping[String(event)];

  const events = await network[contractMethod]({ 
    fromBlock, 
    toBlock: toBlock || (+fromBlock + 1), 
    filter: { id } 
  });

  const results = await ProposalHelpers[apiMethod](events, network, customNetwork);

  return res.status(200).json(results);
}

export default async function ProposalEvents(req: NextApiRequest,
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