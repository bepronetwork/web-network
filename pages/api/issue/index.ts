import { NextApiRequest, NextApiResponse } from "next";

import { UserRoute, WithValidChainId } from "middleware";

import { Logger } from "services/logging";

import { post } from "server/common/bounty";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method.toLowerCase()) {
    case "post":
      res.status(200).json(await post(req));
      break;

    default:
      res.status(405);
    }
  } catch (error) {
    Logger.error(error, "issue endpoint error", req);
    res.status(error?.status || 500).json(error?.message || error?.toString());
  }

  res.end();
}

export default UserRoute(WithValidChainId(handler));
