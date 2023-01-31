import {NextApiRequest, NextApiResponse} from "next";
import {Op, Sequelize, WhereOptions} from "sequelize";

import Database from "db/models";

import {RouteMiddleware} from "middleware";

import {error as logError, Logger} from 'services/logging';
import {LogAccess} from "../../../middleware/log-access";
import WithCors from "../../../middleware/withCors";

const colToLower = (colName: string) => Sequelize.fn("LOWER", Sequelize.col(colName));

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { networkName, chainId } = req.query;
  
  try {
    const whereCondition: WhereOptions = {};

    let queryParams = {};

    if (chainId)
      whereCondition.chain_id = +chainId;

    if (networkName) {
      whereCondition.isAllowed = true;

      queryParams = {
        where: {
          [Op.or]: [{ isTransactional: true }, { isReward: true }]
        },
        include: [
          {
            association: "networks",
            attributes: [],
            required: !!networkName,
            where: {
              name: Sequelize.where(colToLower("networks.name"), "=", (networkName as string).toLowerCase())
            }
          }
        ]
      };
    }
      

    const tokens = await Database.tokens.findAll({
      where: whereCondition,
      ...queryParams
    });

    return res.status(200).json(tokens);
  } catch (error) {
    logError(error);
    return res.status(500);
  }
}

async function tokensEndPoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

Logger.changeActionName(`Tokens`);
export default LogAccess(WithCors(tokensEndPoint));
