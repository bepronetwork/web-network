import {NextApiRequest, NextApiResponse} from "next";

import {AdminRoute} from "middleware";

import {error as logError} from "services/logging";

import deleteEntry from "server/common/network/management/whitelist/delete";
import get from "server/common/network/management/whitelist/get";
import post from "server/common/network/management/whitelist/post";


async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    logError(e);
    res.status(e?.status || 500)
      .json({message: e?.message || e?.toString(), cause: e?.cause?.message || e?.cause?.toString()})
  }

  res.end();
}

export default AdminRoute(handler);