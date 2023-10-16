import { NextApiRequest, NextApiResponse } from "next";

import { UserRoute, WithValidChainId } from "middleware";

import { Logger } from "services/logging";

import put from "server/common/bounty/start-working/put";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method.toLowerCase()) {
    case "put":
      res.status(200).json(await put(req));
      break;

    default:
      res.status(405);
    }
  } catch (error) {
    Logger.error(error, "Failed to start working", req);
    res.status(error?.status || 500).json(error?.message || error?.toString());
  }

  res.end();
}

Logger.changeActionName(`Issue/Working`);
export default UserRoute(WithValidChainId(handler));
