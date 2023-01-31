import {endOfDay, isAfter, parseISO, startOfDay} from "date-fns";
import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";

import {chainFromHeader} from "helpers/chain-from-header";
import {resJsonMessage} from "helpers/res-json-message";

import {LogAccess} from "middleware/log-access";
import {WithValidChainId} from "middleware/with-valid-chain-id";
import WithCors from "middleware/withCors";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {wallet, networkName, startDate, endDate} = req.query;

  const chain = await chainFromHeader(req);

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
      },
      chain_id: {[Op.eq]: +chain?.chainId}
    }
  });

  if (!network) return resJsonMessage("Invalid network", res, 404);

  let filter: Date[] | Date = null

  if (startDate && endDate) {
    const initialDate = parseISO(startDate?.toString())
    const finalDate = parseISO(endDate?.toString())
  
    if (isAfter(initialDate, finalDate))
      return resJsonMessage("Invalid date", res, 400);

    filter = [startOfDay(initialDate), endOfDay(finalDate)]
  } else if (endDate) {
    filter = parseISO(endDate?.toString())
  }

  const payments = await models.userPayments.findAll({
    include: [
      { 
        association: "issue", 
        where: { network_id: network.id },
        include:[{ association: "token" }] 
      }
    ],
    where: {
      address: wallet,
      transactionHash:{
        [Op.not]: null
      },
      ... filter ? {[Array.isArray(filter) ? Op.between : Op.lte]: filter} : {},
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
export default LogAccess(WithCors(WithValidChainId(Payments)));
