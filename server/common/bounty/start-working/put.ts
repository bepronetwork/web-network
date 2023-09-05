import { NextApiRequest } from "next";
import { Op } from "sequelize";

import models from "db/models";

import { chainFromHeader } from "helpers/chain-from-header";

import { HttpConflictError, HttpNotFoundError } from "server/errors/http-errors";

export default async function put(req: NextApiRequest) {
  const { id, networkName, context } = req.body;

  const chain = await chainFromHeader(req);

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
      },
      chain_id: { [Op.eq]: +chain?.chainId }
    }
  });

  if (!network)
    throw new HttpConflictError("Invalid network");

  const issue = await models.issue.findOne({
    where: { id, network_id: network.id }
  });

  if (!issue)
    throw new HttpNotFoundError("Bounty not found");

  const user = context.user;

  const userIsAlreadyWorking = issue.working.find((el) => +el === user.id);
  if (userIsAlreadyWorking)
    throw new HttpConflictError("User is already working");

  const newWorking = [...issue.working, user.id];

  issue.working = newWorking;

  await issue.save();

  await models.comments.create({
    issueId: +issue.id,
    comment: "I'm working on this bounty",
    type: "issue",
    userAddress: user.address,
    userId: user.id,
    hidden: false
  });

  return newWorking;
}