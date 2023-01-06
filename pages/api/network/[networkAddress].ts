import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";

import {withCors} from "../../../middleware";
import {isAdmin} from "../../../helpers/is-admin";
import {resJsonMessage} from "../../../helpers/res-json-message";
import {NOT_AN_ADMIN} from "../../../helpers/contants";

async function Put(req: NextApiRequest, res: NextApiResponse) {
  const {networkAddress} = req.query;

  if (!isAdmin(req))
    return resJsonMessage(NOT_AN_ADMIN, res);

  if (!req.body.chainId)
    return res.status(400).json({message: `missing body.chainId`});

  const dbNetwork = await models.network.findOne({where: {networkAddress: {[Op.iLike]: networkAddress}}});

  if (!dbNetwork)
    return res.status(400).json({message: `no network for ${networkAddress}`});

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