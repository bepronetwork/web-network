import getConfig from "next/config";
import {IM_AN_ADMIN, MISSING_ADMIN_SIGNATURE, NOT_ADMIN_WALLET, NOT_AN_ADMIN} from "../helpers/contants";
import {NextApiHandler} from "next";
import getConfig from "next/config";

import {
  IM_AN_ADMIN,
  MISSING_ADMIN_SIGNATURE,
  MISSING_CHAIN_ID,
  NOT_ADMIN_WALLET,
  NOT_AN_ADMIN
} from "helpers/contants";
import decodeMessage from "helpers/decode-message";

export const AdminRoute = (handler: NextApiHandler, methods: string[] = [`POST`, `PATCH`, `PUT`, `DELETE`]) => {
  const { publicRuntimeConfig } = getConfig();

  return async (req, res) => {
    if (!methods.includes(req.method.toUpperCase()))
      return handler(req, res);

    const headers = req.headers;
    const adminWallet = publicRuntimeConfig?.adminWallet?.toLowerCase();
    const wallet = (headers.wallet as string)?.toLowerCase();
    const chainId = (headers.chain as string);

    if (!chainId)
      return res.status(401).json({message: MISSING_CHAIN_ID})

    if (!wallet || wallet !== adminWallet)
      return res.status(401).json({message: NOT_ADMIN_WALLET});

    const signature = headers.signature as string;
    if (!signature)
      return res.status(401).json({message: MISSING_ADMIN_SIGNATURE});

    if (!decodeMessage(chainId, IM_AN_ADMIN, signature, adminWallet))
      return res.status(401).json({message: NOT_AN_ADMIN})

    return handler(req, res);
  }
}