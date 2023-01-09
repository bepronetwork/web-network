import { WithJwt } from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";


import {chainFromHeader} from "../../../../helpers/chain-from-header";
import {resJsonMessage} from "../../../../helpers/res-json-message";
import {LogAccess} from "../../../../middleware/log-access";
import {WithValidChainId} from "../../../../middleware/with-valid-chain-id";
import WithCors from "../../../../middleware/withCors";

async function getTotal(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {state: {[Op.not]: "pending"}};
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

  if (networkName) {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
        },
        chain_id: {[Op.eq]: +(await chainFromHeader(req))?.chainId }
      }
    });

    if (!network) return resJsonMessage("Invalid network", res, 404);

    whereCondition.network_id = network?.id;
  } else {
    const networks = await models.network.findAll({
      where: {
        isRegistered: true,
        isClosed: false
      }
    })

    if (networks.length === 0) return res.status(404).json("Networks not found");

    whereCondition.network_id = {[Op.in]: networks.map(network => network.id)}
  }

  const issueCount = await models.issue.count({
    where: whereCondition
  });

  return res.status(200).json(issueCount);
}

async function getAll(req: NextApiRequest,
                      res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await getTotal(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default LogAccess(WithCors(WithJwt(WithValidChainId(getAll))));
