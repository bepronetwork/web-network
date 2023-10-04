import {NextApiRequest, NextApiResponse} from "next";

import { withProtected, WithValidChainId, withGovernor } from "middleware";

import {Logger} from "services/logging";

import deleteEntry from "server/common/network/management/whitelist/delete";
import get from "server/common/network/management/whitelist/get";
import post from "server/common/network/management/whitelist/post";


async function handler(req: NextApiRequest, res: NextApiResponse) {
  Logger.changeActionName(`AllowList`);

  try {
    switch (req.method) {
    case "GET":
      res.status(200).json(await get(req, res));
      break;
    case "POST":
      res.status(200).json(await post(req, res));
      break;
    case "DELETE":
      res.status(200).json(await deleteEntry(req, res));
      break;
    default:
      res.status(405);
    }
  } catch (e) {
    Logger.error(e, `AllowListError`, {method: req.method});
    res.status(e?.status || 500)
      .json({message: e?.message || e?.toString()});
    return;
  }

  res.end();
}

export default withProtected(WithValidChainId(withGovernor(handler, ["GET", "DELETE"])));