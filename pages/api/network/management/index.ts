import { NextApiRequest, NextApiResponse } from "next";

import { withGovernor, withProtected } from "middleware";
import { NetworkRoute } from "middleware/network-route";
import { WithValidChainId } from "middleware/with-valid-chain-id";

import { Logger } from "services/logging";

import { put } from "server/common/network/management";

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
    Logger.error(error, 'Failed to update visible bounty');
    res.status(error?.status || 500).json(error?.message || error?.toString());
  }

  res.end();
}

Logger.changeActionName(`network/Management`);

export default withProtected(WithValidChainId(withGovernor(NetworkRoute(handler))));
