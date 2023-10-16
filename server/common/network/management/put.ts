import { NextApiRequest } from "next";

import models from "db/models";

import { chainFromHeader } from "helpers/chain-from-header";

import { HttpConflictError, HttpNotFoundError } from "server/errors/http-errors";

export async function put(req: NextApiRequest) {
  const {
    id,
    visible,
    networkAddress
  } = req.body;

  const chain = await chainFromHeader(req);

  const network = await models.network.findOneByNetworkAddress(networkAddress, chain.chainId);

  if (!network) 
    throw new HttpNotFoundError("Network not found");

  if (network.isClosed)
    throw new HttpConflictError("Network closed");

  const issue = await models.issue.findOne({
    where: { 
      id, 
      network_id: network.id
    }
  });

  if (!issue) 
    throw new HttpConflictError("Invalid bounty");

  issue.visible = visible;

  await issue.save();

  return "Bounty updated";
}