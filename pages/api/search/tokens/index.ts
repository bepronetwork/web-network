import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import Database from "db/models";
import {chainFromHeader} from "../../../../helpers/chain-from-header";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {networkName} = req.query
  
  try {
    const network = await Database.network.findOne({
      where:{
        name: {[Op.iLike]: networkName},
        chain_id: {[Op.eq]: (await chainFromHeader(req))?.chainId }
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
