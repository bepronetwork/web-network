import { NextApiHandler } from "next";

import models from "db/models";

import { USER_NOT_FOUND } from "helpers/error-messages";

import { Logger } from "services/logging";

import { isMethodAllowed } from "server/utils/http";

Logger.changeActionName(`withUser()`);

export const withUser = (handler: NextApiHandler, allowedMethods = ['GET']): NextApiHandler => {
  return async (req, res) => {
    if (isMethodAllowed(req.method, allowedMethods))
      return handler(req, res);

    const token = req.body?.context?.token;

    const user = await models.user.scope("ownerOrGovernor").findByAddress(token.address);

    if (!user)
      return res.status(401).json({ message: USER_NOT_FOUND });

    const bodyWithContext = {
      ...req.body,
      context: {
        ...req.body?.context,
        user
      }
    };

    req.body = bodyWithContext;
  
    return handler(req, res);
  };
};
