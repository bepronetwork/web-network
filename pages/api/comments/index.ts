import { NextApiRequest, NextApiResponse } from "next";
import get from "server/common/comments/get";
import post from "server/common/comments/post";

import { LogAccess } from "middleware/log-access";
import { WithValidChainId } from "middleware/with-valid-chain-id";
import WithCors from "middleware/withCors";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
  case "GET":
    await get(req, res);
    break;
  case "POST":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default LogAccess(WithCors(WithValidChainId(handler)));
