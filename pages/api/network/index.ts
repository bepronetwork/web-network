import { NextApiRequest, NextApiResponse } from "next";

import { UserRoute, NetworkRoute, WithValidChainId } from "middleware";

import { Logger } from "services/logging";

import { get, post, put } from "server/common/network";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method.toLowerCase()) {
    case "get":
      res.status(200).json(await get(req));
      break;
    case "post":
      res.status(200).json(await post(req));
      break;
    case "put":
      res.status(200).json(await put(req));
      break;

    default:
      res.status(405);
    }
  } catch (error) {
    Logger.error(error, "Network endpoint", req);
    res.status(error?.status || 500).json(error?.message || error?.toString());
  }
  res.end();
}

Logger.changeActionName("Network");
export default UserRoute(WithValidChainId(NetworkRoute(handler)));
