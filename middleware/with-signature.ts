import { NextApiHandler } from "next";

import { INVALID_SIGNATURE } from "helpers/error-messages";

import { siweMessageService } from "services/ethereum/siwe";
import { Logger } from "services/logging";

import { isMethodAllowed } from "server/utils/http";

Logger.changeActionName(`withSignature()`);

export const withSignature = (handler: NextApiHandler, allowedMethods = ['GET']): NextApiHandler => {
  return async (req, res) => {
    if (isMethodAllowed(req.method, allowedMethods))
      return handler(req, res);

    const token = req.body?.context?.token;

    const { issuedAt, expiresAt, signature, address, nonce } = token;

    const typedMessage = await siweMessageService.getMessage({
      nonce,
      issuedAt: +issuedAt,
      expiresAt: +expiresAt
    });

    if (!(await siweMessageService.decodeMessage(typedMessage, signature?.toString(), address?.toString())))
      return res.status(401).json({ message: INVALID_SIGNATURE });

    const bodyWithContext = {
      ...req.body,
      context: {
        ...req.body?.context,
        typedMessage
      }
    };

    req.body = bodyWithContext;
  
    return handler(req, res);
  };
};
