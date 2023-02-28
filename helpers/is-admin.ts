import {NextApiRequest} from "next";
import getConfig from "next/config";

import {IM_AN_ADMIN} from "helpers/contants";
import decodeMessage from "helpers/decode-message";

export function isAdmin(req: NextApiRequest) {
  const { publicRuntimeConfig } = getConfig();

  const headers = req.headers;
  const adminWallet = publicRuntimeConfig?.adminWallet?.toLowerCase();
  const wallet = (headers.wallet as string)?.toLowerCase();
  const chainId = (headers.chain as string);
  const signature = headers.signature as string;

  return wallet &&
    wallet === adminWallet &&
    chainId &&
    signature &&
    decodeMessage(chainId, IM_AN_ADMIN, signature, adminWallet);
}