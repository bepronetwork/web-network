import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import models from "db/models";

import { handleCreateSettlerToken } from "helpers/handleNetworkTokens";

import { AdminRoute } from "middleware";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { address, minAmount, chainId } = req.body;

  if (!chainId)
    return res.status(400).json({message: 'missing chain id'});

  const where = {where: {chainId: {[Op.eq]: chainId}}};

  const chain = await models.chain.findOne(where);

  if (!chain)
    return res.status(404).json({message: 'not found'});

  await handleCreateSettlerToken(address, minAmount, chain.chainRpc, chain.chainId)

  return res.status(200).json({message: 'ok'});
}

async function Token(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default AdminRoute(Token);
