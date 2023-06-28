import { NextApiRequest, NextApiResponse } from "next";
import get from "server/common/overview/network";

import { LogAccess } from "middleware/log-access";
import { WithValidChainId } from "middleware/with-valid-chain-id";
import WithCors from "middleware/withCors";

import { error as LogError } from "services/logging";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
    case "GET":
      res.status(200).json(await get(req.query));
      break;

    default:
      res.status(405);
    }
  } catch (error) {
    LogError(error);
    res.status(error.cause || 500).json(error.message || error);
  }

  res.end();
}
export default LogAccess(WithCors(WithValidChainId(handler)));