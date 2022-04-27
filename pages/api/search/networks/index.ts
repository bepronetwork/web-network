import models from "db/models";
import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { Op, WhereOptions } from "sequelize";

import paginate, { calculateTotalPages } from "helpers/paginate";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {};

  const { name, creatorAddress, networkAddress, page } = req.query || {};

  if (name) whereCondition.name = name;

  if (creatorAddress)
    whereCondition.creatorAddress = { [Op.iLike]: String(creatorAddress) };

  if (networkAddress)
    whereCondition.networkAddress = { [Op.iLike]: String(networkAddress) };

  const networks = await models.network.findAndCountAll(paginate({
        attributes: {
          exclude: ["id", "creatorAddress", "updatedAt"]
        },
        where: whereCondition,
        nest: true
  },
                                                                 req.query,
      [[req.query.sortBy || "updatedAt", req.query.order || "DESC"]]));

  return res.status(200).json({
    ...networks,
    currentPage: +page || 1,
    pages: calculateTotalPages(networks.count)
  });
}

async function SearchNetworks(req: NextApiRequest,
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
export default withCors(SearchNetworks)