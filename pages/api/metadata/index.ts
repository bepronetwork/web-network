import { NextApiRequest, NextApiResponse } from "next";

import { UserRoute, WithValidChainId } from "middleware";

import get from "server/common/metadata/get";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
  case "GET":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default UserRoute(WithValidChainId(handler));
