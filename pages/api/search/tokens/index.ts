import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import { Sequelize } from "sequelize";

import Database from "db/models";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {networkName} = req.query
  
  try {
    const network = await Database.network.findOne({
      where:{
        name: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), "=", (networkName as string).toLowerCase()) 
      },
      include:[{ association: "tokens" }]
    });  

    return res.status(200).json(network.tokens);
  } catch (error) {
    console.log(error)
    return res.status(500)
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
