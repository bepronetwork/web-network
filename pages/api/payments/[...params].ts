import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import models from "db/models";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const [address] = req.query.params;
  console.log(req.query.params)

  const payments = await models.userPayments.findAll({
    include: [
      { association: "issue" }
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


async function Payments(req: NextApiRequest,
                               res: NextApiResponse) {
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