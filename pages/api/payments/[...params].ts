import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import models from "db/models";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const [address, networkName] = req.query.params;

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  });

  if (!network) return res.status(404).json("Invalid network");

  const payments = await models.userPayments.findAll({
    include: [
      { 
        association: "issue", 
        where: { network_id: network.id },
        include:[{ association: "token" }] 
      }
    ],
    where: {
      address,
      transactionHash:{
        [Op.not]: null
      }
    }
  });

  if (!payments) return res.status(404);

  return res.status(200).json(payments);
}


async function Payments(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}
export default withCors(Payments)