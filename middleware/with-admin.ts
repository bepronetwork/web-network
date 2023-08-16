import { NextApiHandler } from "next";

import { NOT_ADMIN_WALLET } from "helpers/constants";

import { UserRole } from "interfaces/enums/roles";

import { Logger } from "services/logging";

import { isMethodAllowed } from "server/utils/http";

Logger.changeActionName(`withAdmin()`);

export const withAdmin = (handler: NextApiHandler, allowedMethods = ["GET"]): NextApiHandler => {
  return async (req, res) => {
    if (isMethodAllowed(req.method, allowedMethods))
      return handler(req, res);

    const roles = req.body?.context?.token?.roles || [];

    if (!roles.includes(UserRole.ADMIN))
      return res.status(401).json({ message: NOT_ADMIN_WALLET });

    return handler(req, res);
  }
}