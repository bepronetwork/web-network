import { NextApiRequest, NextApiResponse } from "next";

import { withCORS, NetworkRoute, WithValidChainId } from "middleware";

import patch from "server/common/comments/patch";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
  case "PATCH":
    await patch(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default withCORS(WithValidChainId(NetworkRoute(handler)));
