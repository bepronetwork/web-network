import {NextApiHandler} from "next";
import {Op} from "sequelize";

import models from "db/models";

import {
  IM_AM_CREATOR_NETWORK,
  NOT_AN_CREATOR_NETWORK,
  MISSING_CREATOR_NETWORK_SIGNATURE
} from "helpers/constants";
import decodeMessage from "helpers/decode-message";
import { isAdmin } from "helpers/is-admin";
import { resJsonMessage } from "helpers/res-json-message";

export const NetworkRoute = (handler: NextApiHandler, methods: string[] = [ `PUT`, `PATCH` ]) => {

  return async (req, res) => {
    if (!methods.includes(req.method.toUpperCase()))
      return handler(req, res);

    const { accessToken, override, repositoriesToAdd, repositoriesToRemove, allowMerge } = req.body;
    const isAdminOverriding = isAdmin(req) && !!override;
  
    req.body.isAdminOverriding = isAdminOverriding;

    if (isAdminOverriding && accessToken)
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

    const isChangingGithubOptions = !!repositoriesToAdd || !!repositoriesToRemove || allowMerge !== undefined;

    if (!accessToken && isChangingGithubOptions) return resJsonMessage("Unauthorized user", res, 401);
  
    if (!network) return resJsonMessage("Invalid network", res, 401);

    if (!wallet || wallet.toLowerCase() !== network?.creatorAddress.toLowerCase())
      return resJsonMessage(NOT_AN_CREATOR_NETWORK, res, 401);

    const signature = headers.signature as string;
    if (!signature)
      return resJsonMessage(MISSING_CREATOR_NETWORK_SIGNATURE, res, 401);

    if (!decodeMessage(chainId, IM_AM_CREATOR_NETWORK, signature, network?.creatorAddress))
      return resJsonMessage(NOT_AN_CREATOR_NETWORK, res, 401);

    return handler(req, res);
  }
}