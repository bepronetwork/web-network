import {NextApiRequest, NextApiResponse} from "next";

import {AdminRoute} from "../../../../../../middleware";
import deleteEntry from "../../../../../../server/common/network/management/whitelist/delete";
import get from "../../../../../../server/common/network/management/whitelist/get";
import post from "../../../../../../server/common/network/management/whitelist/post";


async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      await get(req, res);
      break;
    case "POST":
      await post(req, res);
      break;
    case "DELETE":
      await deleteEntry(req, res);
      break;
    default:
      res.status(405);
  }

  res.end();
}

export default AdminRoute(handler);