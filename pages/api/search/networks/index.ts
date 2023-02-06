import BigNumber from "bignumber.js";
import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import {paginateArray} from "helpers/paginate";

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
    { association: "tokens" },
    { association: "curators", required: false },
    { association: "issues", required: false,
      where: { 
        state: {[Op.not]: "pending" }
      }
    }
  ];

  const networks = await models.network.findAll({
        attributes: {
          exclude: ["id", "creatorAddress"]
        },
        where: whereCondition,
        include,
        order: [[String(req.query.sortBy) ||["createdAt"], String(req.query.order) || "DESC"]],
        nest: true
  }).then(networks => networks.map(network => {
    const result = ({
      ...network.dataValues,
      totalValueLock: network?.curators?.reduce((ac, cv) => BigNumber(ac).plus(cv?.tokensLocked || 0),
                                                BigNumber(0)).toFixed(),
      countOpenIssues: network?.issues?.filter(b => b.state === "open").length || 0,
      countIssues: network?.issues.length || 0
    })
    delete result.issues
    return result
  }))


  const paginatedData = paginateArray(networks, 10, +page || 1)

  return res.status(200).json({
    count: networks.length,
    rows: paginatedData.data,
    pages: paginatedData.pages,
    currentPage: +paginatedData.page
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