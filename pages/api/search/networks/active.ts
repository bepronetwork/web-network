import BigNumber from "bignumber.js";
import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import { paginateArray} from "helpers/paginate";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {};

  const { creatorAddress, isClosed, isRegistered, page, sortBy, order} = req.query || {};

  if (creatorAddress)
    whereCondition.creatorAddress = { [Op.iLike]: String(creatorAddress) };
  
  if (isClosed)
    whereCondition.isClosed = isClosed;

  if (isRegistered)
    whereCondition.isRegistered = isRegistered;
    
  const include = [
    { association: "tokens" },
    { association: "issues",
      where: { 
        state: {[Op.not]: "pending" }
      }
    },
    { association: "curators" }
  ];

  const networks = await models.network.findAll({
        attributes: {
          exclude: ["id", "creatorAddress"]
        },
        where: whereCondition,
        include,
        order: [[String(sortBy) ||["createdAt"], String(order) || "DESC"]],
        nest: true
  })

  const result = networks.map((network) => {
    return {
            name: network?.name,
            fullLogo: network?.fullLogo,
            logoIcon: network?.logoIcon,
            totalValueLock: network?.curators?.reduce((ac, cv) => BigNumber(ac).plus(cv?.tokensLocked || 0),
                                                      BigNumber(0)),
            countIssues: network?.issues?.length || 0
    };
  })

  const compare = (networkOne, networkTwo) => (networkOne?.totalValueLock.gt(networkTwo?.totalValueLock) ? -1 : 0 )
  
  const paginatedData = paginateArray(result
          .sort(compare)
          .slice(0, 3)
          .map((network) => ({
            ...network,
            totalValueLock: network.totalValueLock.toFixed(),
          })), 3, page || 1);
                  
  return res.status(200).json({
          count: result.length,
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