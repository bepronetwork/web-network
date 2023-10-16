import {NextApiRequest, NextApiResponse} from "next";
import { Op, Sequelize, WhereOptions } from "sequelize";

import Database from "db/models";

import { withCORS } from "middleware";

import { error as logError } from 'services/logging';

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
            required: true,
            where: {
              name: Sequelize.where(colToLower("networks.name"), "=", (networkName as string).toLowerCase())
            }
          }
        ]
      };
    } else {
      queryParams = {
        include: [
          {
            association: "networks",
          },
        ],
      };
    }
      

    const tokens = await Database.tokens.findAll({
      where: whereCondition,
      ...queryParams
    });

    return res.status(200).json(tokens);
  } catch (error) {
    logError(`Failed to get tokens`, {error: error?.toString()});
    return res.status(500);
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default withCORS(handler);
