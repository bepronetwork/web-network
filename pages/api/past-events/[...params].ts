import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import models from "db/models";

import { BountyHelpers } from "helpers/api/bounty";
import { ProposalHelpers } from "helpers/api/proposal";
import { PullRequestHelpers } from "helpers/api/pull-request";
import { handleNetworkAddress } from "helpers/custom-network";

import DAO from "services/dao-service";

const Helpers = {
  "bounty": BountyHelpers,
  "proposal": ProposalHelpers,
  "pull-request": PullRequestHelpers
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const [entity, event] = req.query.params;
  const { fromBlock, id, networkName, toBlock } = req.body;

  const customNetwork = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  });

  if (!customNetwork || customNetwork?.isClosed) return res.status(404).json("Invalid network");

  const DAOService = new DAO(true);

  if (!await DAOService.start()) return res.status(500).json("Failed to connect with chain");

  if (!await DAOService.loadNetwork(handleNetworkAddress(customNetwork)))
    return res.status(500).json("Failed to load network contract");

  const helper = Helpers[entity];

  if (!helper[String(event)]) return res.status(404).json("Invalid event");

  const [contractMethod, apiMethod] = helper[String(event)];

  const events = await DAOService.network[contractMethod]({ 
    fromBlock, 
    toBlock: toBlock || (+fromBlock + 1), 
    filter: { id } 
  });

  const results = await apiMethod(events, DAOService.network, customNetwork);

  return res.status(200).json(results);
}

export default async function BountyEvents(req: NextApiRequest,
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