import {NextApiHandler} from "next";
import {Op} from "sequelize";

import models from "db/models";

import {CHAIN_ID_NOT_SUPPORTED, MISSING_CHAIN_ID} from "../helpers/contants";
import {isAdmin} from "../helpers/is-admin";
import {resJsonMessage} from "../helpers/res-json-message";

export const WithValidChainId = (handler: NextApiHandler, methods: string[] = [`POST`, `PATCH`, `PUT`, `DELETE`]) => {
  return async function withValidChainIdHandler(req, res) {
    if (!methods.includes(req.method.toUpperCase()))
      return handler(req, res);

    if (!req.headers?.chain)
      return resJsonMessage(MISSING_CHAIN_ID, res, 400);

    const foundChain = await models.chain.findOne({where: {chainId: {[Op.eq]: +req.headers.chain}}});
    if (!foundChain && !isAdmin(req))
      return resJsonMessage(CHAIN_ID_NOT_SUPPORTED, res, 400);

    return handler(req, res);
  }
}