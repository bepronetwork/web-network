import {NextApiHandler} from "next";
import {Op} from "sequelize";

import models from "db/models";

import { isAdmin } from "helpers/is-admin";
import { resJsonMessage } from "helpers/res-json-message";

export const NetworkRoute = (handler: NextApiHandler, methods: string[] = [ `PUT`, `PATCH` ]) => {

  return async (req, res) => {
    if (!methods.includes(req.method.toUpperCase()))
      return handler(req, res);

    const { override } = req.body;
    const isAdminOverriding = isAdmin(req) && !!override;
  
    req.body.isAdminOverriding = isAdminOverriding;

    if (isAdminOverriding)
      return handler(req, res);

    const headers = req.headers;
    const wallet = (headers.wallet as string)?.toLowerCase();
    const chainId = (headers.chain as string);

    const network = await models.network.findOne({
      where: {
        creatorAddress: {[Op.iLike]: wallet},
        chain_id: chainId
      }
    });
  
    if (!network) return resJsonMessage("Invalid network", res, 401);

    return handler(req, res);
  }
}