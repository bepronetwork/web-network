import {NextApiHandler} from "next";

import { chainFromHeader } from "helpers/chain-from-header";
import {CHAIN_ID_NOT_SUPPORTED, MISSING_CHAIN_ID} from "helpers/constants";
import {isAdmin} from "helpers/is-admin";
import {resJsonMessage} from "helpers/res-json-message";

export const WithValidChainId = (handler: NextApiHandler, methods: string[] = [`POST`, `PATCH`, `PUT`, `DELETE`]) => {
  return async function withValidChainIdHandler(req, res) {
    if (!methods.includes(req.method.toUpperCase()))
      return handler(req, res);

    if (!req.headers?.chain)
      return resJsonMessage(MISSING_CHAIN_ID, res, 400);

    const chain = await chainFromHeader(req);

    if (!chain && !isAdmin(req))
      return resJsonMessage(CHAIN_ID_NOT_SUPPORTED, res, 400);

    const bodyWithContext = {
      ...req.body,
      context: {
        ...req.body?.context,
        chain: chain
      }
    };

    req.body = bodyWithContext;

    return handler(req, res);
  }
}