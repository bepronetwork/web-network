import {endOfDay, isAfter, parseISO, startOfDay} from "date-fns";
import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";

import {resJsonMessage} from "helpers/res-json-message";

import {LogAccess} from "middleware/log-access";
import {WithValidChainId} from "middleware/with-valid-chain-id";
import WithCors from "middleware/withCors";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {wallet, startDate, endDate} = req.query;

  const networks = await models.network.findAll({});

  if (!networks) return resJsonMessage("Network not found", res, 404);

  let filter: {
    createdAt?: {
      [key: symbol]: Date | Date[]
    }
  } = {};

  if (startDate && endDate) {
    const initialDate = parseISO(startDate?.toString())
    const finalDate = parseISO(endDate?.toString())
  
    if (isAfter(initialDate, finalDate))
      return resJsonMessage("Invalid date", res, 400);

    filter = {
      createdAt: {
        [Op.between]: [startOfDay(initialDate), endOfDay(finalDate)]
      }
    };
  } else if (endDate) {
    filter = {
      createdAt: {
        [Op.lte]: parseISO(endDate?.toString())
      }
    };
  }

  const payments = await models.userPayments.findAll({
    include: [
      {
        association: "issue",
        where: {
          network_id: { [Op.in]: networks.map((network) => network.id) },
        },
        include: [
          { association: "transactionalToken" },
          {
            association: "network",
            include: [{ association: "chain", attributes: ["chainShortName"] }],
          },
        ],
      },
    ],
    where: {
      address: {
        [Op.iLike]: wallet
      },
      transactionHash: {
        [Op.not]: null
      },
      ...filter
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
