import BigNumber from "bignumber.js";
import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import { Op, Sequelize, WhereOptions } from "sequelize";

import models from "db/models";

import {paginateArray} from "helpers/paginate";

interface includeProps {
  association: string;
  required?: boolean;
  where?: {
    state?: {
      [Op.not]?: string
    }
  }
}

const handleNetworksResult = (networks) => networks.map(network => {
  const result = ({
    ...network.dataValues,
    totalValueLock: network?.curators?.reduce((ac, cv) => BigNumber(ac).plus(cv?.tokensLocked || 0),
                                              BigNumber(0)).toFixed(),
    countOpenIssues: network?.issues?.filter(b => b.state === "open").length || 0,
    countIssues: network?.issues.length || 0
  })
  delete result.issues
  return result
})

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {};

  const {
    name,
    creatorAddress,
    networkAddress,
    isClosed,
    isRegistered,
    isDefault,
    isNeedCountsAndTotalLock,
    page,
  } = req.query || {};

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
    
  const include: includeProps[] = [
      { association: "tokens" }
  ];

  if (isNeedCountsAndTotalLock) {
    include.push({ association: "curators", required: false })
    include.push({ association: "issues", required: false,
                   where: { 
                        state: {[Op.not]: "pending" }
                   }
    })
  }
  try{
    const result = await models.network.findAll({
    include: [
      { association: "tokens" },
      { association: 'curators', required: false, attributes: [] },
      { association: 'issues', required: false, attributes: [], where: {state: {[Op.ne]: 'pending'}}}
    ],
    attributes: {
      include: [
        "network.id",
        "network.name",
        [Sequelize.fn('sum', Sequelize.cast(Sequelize.col('curators.tokensLocked'), 'int')), 'tokensLocked'],
        [Sequelize.fn('count', Sequelize.col('issues.id')), 'totalIssues']
      ],
    },
    group: ['network.id', "network.name", "tokens.id", "tokens->network_tokens.id", "issues.id" ],
    where: {
      isRegistered: true,
      isClosed: false
    }});

    console.log('result', result)
  }catch(e) {
    console.log('error',e)
  }
 
  
  const networks = await models.network.findAll({
        attributes: {
          exclude: ["id", "creatorAddress"]
        },
        where: whereCondition,
        include,
        order: [[String(req.query.sortBy) ||["createdAt"], String(req.query.order) || "DESC"]],
        nest: true
  }).then(networks => {
    if(isNeedCountsAndTotalLock)
      return handleNetworksResult(networks)
    else
      return networks
  })


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