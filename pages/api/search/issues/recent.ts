import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import {LogAccess} from "middleware/log-access";
import WithCors from "middleware/withCors";

const handleWhereState = (state: string) => {
  if(state === 'funding'){
    return ({
      [Op.and]: [
        { state: { [Op.in]: ["draft", "open"] } },
        { fundingAmount: { [Op.ne]: "0" } },
      ],
    })
  }

  if(state === 'open'){
    return ({
      state: state,
      fundingAmount: { [Op.eq]: "0" }
    })
  }

  return ({ state: state })
}

const getLastIssuesByStatus = async (state, whereCondition, sortBy, order, limit = 3) => 
  models.issue.findAll({
    where: {
      ...whereCondition,
      ...(state
        ? handleWhereState(state)
        : {}),
    },
    order: [[String(sortBy), String(order)]],
    include: [
      {
        association: "network",
        include: [{ association: "chain" }],
      },
      { association: "repository" },
      { association: "transactionalToken" },
    ],
    limit,
  });

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {state: {[Op.not]: "pending"}};
  const {
    repoId,
    creator,
    address,
    state,
    networkName,
    sortBy,
    order
  } = req.query || {};

  if (repoId) whereCondition.repository_id = repoId;

  if (creator) whereCondition.creatorGithub = creator;

  if (address) whereCondition.creatorAddress = address;

  if (networkName) {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: networkName.toString()
        }
      }
    });

    if (!network) return res.status(404).json("Invalid network");

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

  const issues = await getLastIssuesByStatus(state,
                                             whereCondition,
                                             sortBy,
                                             order);
                                            
  return res.status(200).json(issues);
}

async function getAll(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default LogAccess(WithCors(getAll))
