import {withCors} from 'middleware';
import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import handleNetworkValues from 'helpers/handleNetworksValuesApi';

const getLastIssuesByStatus = async (state, whereCondition, sortBy, order, limit = 3) => (models.issue.findAll({
  where: {
    ...whereCondition,
    state,
  },
  order: [[ String(sortBy), String(order) ]],
  include: [ 
    { association: "network", attributes: ['colors', 'name', 'logoIcon'] },
    { association: "repository" },
    { association: "token" }
  ],
  limit
}))

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {state: {[Op.not]: "pending"}};
  const {
    repoId,
    creator,
    address,
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
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
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

  const issuesOpen = await getLastIssuesByStatus("open",
                                                 whereCondition,
                                                 sortBy,
                                                 order).then((data) => handleNetworkValues(data));
  
  return res.status(200).json(issuesOpen);
}

async function getAll(req: NextApiRequest,
                      res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default withCors(getAll)