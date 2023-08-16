import {NextApiRequest, NextApiResponse} from "next";

import models from "db/models";

import { withCORS } from "middleware";

async function getTotal(req: NextApiRequest, res: NextApiResponse) {
  const userCount = await models.user.count();

  return res.status(200).json(userCount);
}

async function getAll(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await getTotal(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default withCORS(getAll);
