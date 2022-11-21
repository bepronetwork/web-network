import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import paginate, {calculateTotalPages} from "helpers/paginate";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {};

  const {name, creatorAddress, networkAddress, isClosed, isRegistered, isDefault, page} = req.query || {};

  if (name) whereCondition.name = name;

  if (creatorAddress)
    whereCondition.creatorAddress = { [Op.iLike]: String(creatorAddress) };

  if (networkAddress)
    whereCondition.networkAddress = { [Op.iLike]: String(networkAddress) };
  
  if (isClosed)
    whereCondition.isClosed = isClosed;

  if (isRegistered)
    whereCondition.isRegistered = isRegistered;
  
  if (isDefault)
    whereCondition.isDefault = isDefault;
    
  const include = [
    { association: "tokens" }
  ];

  const networks = await models.network.findAndCountAll(paginate({
        attributes: {
          exclude: ["id", "creatorAddress"]
        },
        where: whereCondition,
        include,
        nest: true
  },
                                                                 req.query,
      [[req.query.sortBy || "createdAt", req.query.order || "DESC"]]));

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