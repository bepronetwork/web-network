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

export const NetworkRoute = (handler: NextApiHandler, methods: string[] = [ `PUT` ]) => {

  return async (req, res) => {
    if (!methods.includes(req.method.toUpperCase()))
      return handler(req, res);

    const { override } = req.body;
    const headers = req.headers;
    const wallet = (headers.wallet as string)?.toLowerCase();
    const chainId = (headers.chain as string);

    const network = await models.network.findOne({
      where: {
        creatorAddress: {[Op.iLike]: wallet},
        chain_id: chainId
      }
    });

    const isAdminOverriding = isAdmin(req) && !!override;
  
    if (!network) return res.status(401).json({message:"Invalid network"});

    if (!wallet || wallet.toLowerCase() !== network?.creatorAddress.toLowerCase())
      return res.status(401).json({message: NOT_AN_CREATOR_NETWORK});

    const signature = headers.signature as string;
    if (!signature)
      return res.status(401).json({message: MISSING_CREATOR_NETWORK_SIGNATURE});

    if (!decodeMessage(chainId, IM_AM_CREATOR_NETWORK, signature, network?.creatorAddress))
      return res.status(401).json({message: NOT_AN_CREATOR_NETWORK})

    return handler(req, res);
  }
}