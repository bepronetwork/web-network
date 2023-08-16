import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import { resJsonMessage } from "helpers/res-json-message";

import { RouteMiddleware } from "middleware";
import {WithValidChainId} from "middleware/with-valid-chain-id";

async function getTotal(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {state: { [Op.notIn]: ["pending", "canceled"] }, visible: true};
  const {
    state,
    issueId,
    repoId,
    creator,
    address,
    networkName,
  } = req.query || {};

  if (state) whereCondition.state = state;

  if (issueId) whereCondition.issueId = issueId;

  if (repoId) whereCondition.repository_id = repoId;

  if (creator) whereCondition.creatorGithub = creator;

  if (address) whereCondition.creatorAddress = address;

  const networks = await models.network.findAll({
    where: {
      isRegistered: true,
      isClosed: false,
      ... networkName ? {
        name: { [Op.iLike]: String(networkName) }
      } : {}
    }
  })

  if (networks.length === 0) return resJsonMessage("Networks not found", res, 404);

  whereCondition.network_id = { [Op.in]: networks.map(network => network.id) };

  const issueCount = await models.issue.count({
    where: whereCondition
  });

  return res.status(200).json(issueCount);
}

async function getAll(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await getTotal(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default RouteMiddleware(WithValidChainId(getAll));
