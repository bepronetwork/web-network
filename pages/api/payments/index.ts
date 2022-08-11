import { endOfDay, isAfter, parseISO, startOfDay } from "date-fns";
import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import models from "db/models";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { wallet, networkName, startDate, endDate  } = req.query;
  
  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  });

  if (!network) return res.status(404).json("Invalid network");

  let filter: Date[] | Date = null

  if(startDate && endDate){
    const initialDate = parseISO(startDate?.toString())
    const finalDate = parseISO(endDate?.toString())
  
    if(isAfter(initialDate, finalDate)) return res.status(404).json("Invalid date");

    filter = [startOfDay(initialDate), endOfDay(finalDate)]
  }else if(endDate){
    filter = parseISO(endDate?.toString())
  }

  function handleOpFilter(Op) {
    if(Array.isArray(filter)) {
      return {[Op.between]: filter}
    }else {
      return {[Op.lte]: filter}
    }
    
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
      createdAt: filter && handleOpFilter(Op)
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