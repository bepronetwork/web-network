import { NextApiHandler } from "next";

import { NOT_AN_CREATOR_NETWORK } from "helpers/constants";

import { Logger } from "services/logging";

import { isMethodAllowed } from "server/utils/http";
import { UserRoleUtils } from "server/utils/jwt";

Logger.changeActionName(`withGovernor()`);

export const withGovernor = (handler: NextApiHandler, allowedMethods = ["GET"]): NextApiHandler => {
  return async (req, res) => {
    if (isMethodAllowed(req.method, allowedMethods))
      return handler(req, res);

    const token = req.body?.context?.token;
    const chain = req.body?.context?.chain || [];
    const networkAddress = req.body?.networkAddress;

    if (!UserRoleUtils.isGovernorOf(token, chain?.chainId, networkAddress) && !UserRoleUtils.hasAdminRole(token))
      return res.status(401).json({ message: NOT_AN_CREATOR_NETWORK });

    return handler(req, res);
  }
}