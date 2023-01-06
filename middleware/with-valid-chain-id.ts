import models from "db/models";
import {NextApiHandler} from "next";
import {CHAIN_ID_NOT_SUPPORTED, MISSING_CHAIN_ID} from "../helpers/contants";
import {Op} from "sequelize";

export const WithValidChainId = (handler: NextApiHandler, methods: string[] = [`POST`, `PATCH`, `PUT`, `DELETE`]) => {
  return async function withValidChainIdHandler(req, res) {
    if (!methods.includes(req.method.toUpperCase()))
      return handler(req, res);

    if (!req.headers?.chain)
      return res.status(400).json({message: MISSING_CHAIN_ID});

    const foundChain = await models.chain.findOne({where: {chainId: {[Op.iLike]: req.headers.chain}}});
    if (!foundChain)
      return res.status(400).json({message: CHAIN_ID_NOT_SUPPORTED});

    return handler(req, res);
  }
}