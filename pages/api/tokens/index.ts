import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import { Sequelize } from "sequelize";

import Database from "db/models";

import { error as logError } from 'services/logging';

const colToLower = (colName: string) => Sequelize.fn("LOWER", Sequelize.col(colName));

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { networkName } = req.query;
  
  try {
    let queryParams = {};

    if (networkName)
      queryParams = {
        where: {
          isAllowed: true
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

    const tokens = await Database.tokens.findAll({
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

export default withCors(tokensEndPoint);
