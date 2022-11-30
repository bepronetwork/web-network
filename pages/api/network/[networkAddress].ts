import {withCors} from "../../../middleware";
import {NextApiRequest, NextApiResponse} from "next";

import models from "db/models";
import {Op} from "sequelize";

async function Put(req: NextApiRequest, res: NextApiResponse) {
  const {networkAddress} = req.query;

  if (!req.body.chainId)
    return res.status(400).json({message: `missing body.chainId`});

  const dbNetwork = await models.network.findOne({where: {networkAddress: {[Op.iLike]: networkAddress}}});

  if (!dbNetwork)
    return res.status(400).json({message: `no network for ${networkAddress}`});
  if (dbNetwork?.chain_id)
    return res.status(400).json({message: `already configured`});

  dbNetwork.chain_id = req.body.chainId;
  await dbNetwork.save();

  return res.status(200).json({message: `ok`});
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {

    case "put":
      await Put(req, res);
      break;

    default:
      res.status(405).json("Method not allowed");
  }

  res.end();
}

export default withCors(handler);