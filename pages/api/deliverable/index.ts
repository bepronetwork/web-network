import { NextApiRequest, NextApiResponse } from "next";

import { UserRoute, WithValidChainId } from "middleware";

import post from "server/common/deliverable/post";


async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
  case "POST":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default UserRoute(WithValidChainId(handler));
