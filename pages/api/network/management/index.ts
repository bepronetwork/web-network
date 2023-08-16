import { NextApiRequest, NextApiResponse } from "next";
import {Op} from "sequelize";

import Database from "db/models";
import models from "db/models";

import { chainFromHeader } from "helpers/chain-from-header";
import { resJsonMessage } from "helpers/res-json-message";

import { withGovernor, withProtected } from "middleware";
import { NetworkRoute } from "middleware/network-route";
import { WithValidChainId } from "middleware/with-valid-chain-id";

import { Logger } from "services/logging";

async function put(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      issueId,
      visible,
      creator,
      isAdminOverriding,
      networkAddress
    } = req.body;

    const chain = await chainFromHeader(req);

    const network = await Database.network.findOne({
      where: {
        ...(isAdminOverriding
          ? {}
          : {
              creatorAddress: { [Op.iLike]: creator },
          }),
        networkAddress: {
          [Op.iLike]: networkAddress,
        },
        chain_id: chain.chainId,
      },
    });

    if (!network) return resJsonMessage("Invalid network", res, 404);
    if (network.isClosed && !isAdminOverriding)
      return resJsonMessage("Invalid network", res, 404);

    if (!chain.chainRpc) return resJsonMessage("Missing chainRpc", res, 400);

    if (!chain.registryAddress)
      return resJsonMessage("Missing registryAddress", res, 400);


    const issue = await models.issue.findOne({
        where: { issueId, network_id: network.id }
    });

    if (!issue) return res.status(404).json({message: "Issue not found"});

    issue.visible = visible

    await issue.save()


    return resJsonMessage("Bounty updated", res, 200);
  } catch (error) {
    Logger.error(error, 'Failed to update visible bounty');
    return res.status(500).json(error);
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "put":
    await put(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

Logger.changeActionName(`network/Management`);
export default withProtected(WithValidChainId(withGovernor(NetworkRoute(handler))));
