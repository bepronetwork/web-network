import { NextApiHandler } from "next";
import { getToken } from "next-auth/jwt";
import getConfig from "next/config";

import { MISSING_JWT_TOKEN } from "helpers/error-messages";

import { Logger } from "services/logging";

import { isMethodAllowed } from "server/utils/http";

const { serverRuntimeConfig } = getConfig();

Logger.changeActionName(`withJWT()`);

export const withJWT = (handler: NextApiHandler, allowedMethods = ['GET']): NextApiHandler => {
  return async (req, res) => {
    if (isMethodAllowed(req.method, allowedMethods))
      return handler(req, res);

    const token = await getToken({ req, secret: serverRuntimeConfig?.auth?.secret });
    
    if (!token)
      return res.status(401).json({ message: MISSING_JWT_TOKEN });

    const bodyWithContext = {
      ...req.body,
      context: {
        ...req.body?.context,
        token
      }
    };

    req.body = bodyWithContext;

    return handler(req, res);
  };
};
