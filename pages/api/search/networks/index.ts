import {NextApiRequest, NextApiResponse} from "next";
import {Op, Sequelize, WhereOptions} from "sequelize";
import {Fn, Literal} from "sequelize/types/utils";

import models from "db/models";

import {paginateArray} from "helpers/paginate";

import {LogAccess} from "../../../../middleware/log-access";
import WithCors from "../../../../middleware/withCors";

import {RouteMiddleware} from "middleware";

import {chainFromHeader} from "../../../../helpers/chain-from-header";
interface includeProps {
  association: string;
  required?: boolean;
  attributes?: string[];
  where?: {
    state?: {
      [Op.ne]?: string;
    } | string;
  }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {};

  const {
    name,
    creatorAddress,
    networkAddress,
    isClosed,
    isRegistered,
    isDefault,
    isNeedCountsAndTokensLocked,
    page,
    chainId
  } = req.query || {};

  if (name) 
    whereCondition.name = {
      [Op.and]: 
        [Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("network.name")), "=", name.toString().toLowerCase())]
    };

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
  
  if (chainId)
    whereCondition.chain_id = chainId;

  const chain = await chainFromHeader(req);
  if (chain)
    whereCondition.chain_id = {[Op.eq]: chain.chainId};

  console.log(`WHERE`, whereCondition);
    
  const include: includeProps[] = [
      { association: "tokens" }
  ];

  let group: string[] = []

  const attributes: { include?: (string | [Fn,string] | [Literal,string])[]; exclude: string[] } = {
    exclude: ["creatorAddress", "id"]
  }

  if (isNeedCountsAndTokensLocked) {
    const caseZeroThen1 = (clause: string) => `case when ${clause} = 0 then 1 else ${clause} end`;

    include.push({ association: "curators", required: false, attributes: [] })
    include.push({ association: "issues", required: false, attributes: [],
                   where: { 
                        state: {[Op.ne]: "pending" }
                   }
    })
    include.push({ association: 'openIssues', required: false, attributes: [], where: {state: 'open'}},)
    attributes.include = [
      "network.id",
      "network.name",
      [
        Sequelize.literal(`sum(cast("curators"."tokensLocked" as FLOAT)) / ${caseZeroThen1('COUNT(distinct("issues".id))')} / ${caseZeroThen1('COUNT(distinct("openIssues".id))')}`), // eslint-disable-line
        "tokensLocked",
      ],
      [Sequelize.literal('COUNT(DISTINCT("issues".id))'), 'totalIssues'],
      [Sequelize.literal('COUNT(DISTINCT("openIssues".id))'), 'totalOpenIssues']
    ]
    group = ['network.id', "network.name", "tokens.id", "tokens->network_tokens.id"]
  }
 
  const networks = await models.network.findAll({
    include,
    attributes,
    group,
    order: [[req.query.sortBy || "createdAt", req.query.order || "DESC"]],
    where: whereCondition,
    nest: true,
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
export default LogAccess(WithCors(SearchNetworks));